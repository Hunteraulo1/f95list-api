import { createHash } from 'node:crypto';

import { and, eq, sql } from 'drizzle-orm';
import type { FastifyRequest } from 'fastify';

import type { Database } from '../db/index.js';
import { apiKey, apiKeyRate, user } from '../db/schema.js';

const RATE_WINDOW_MS = 60_000;
const API_KEY_KIND_BEARER = 'bearer';
const API_KEY_EXTENSION_ONLY_LABEL_TOKEN = '[extension-only]';
const EXTENSION_ONLY_API_ROUTE = '/private/extension';

export const EXPLOITATION_SI_API_KEY_LABEL = '[exploitation-si]';

export type ApiKeyValidateFailure =
  | 'missing'
  | 'invalid'
  | 'expired'
  | 'rate_limited'
  | 'quota_disabled'
  | 'route_restricted';

export function hashApiKeySecret(rawKey: string): string {
  return createHash('sha256').update(rawKey, 'utf8').digest('hex');
}

export function extractApiKeyFromRequest(request: FastifyRequest): string | null {
  const auth = request.headers.authorization;
  if (typeof auth === 'string' && auth.toLowerCase().startsWith('bearer ')) {
    const token = auth.slice(7).trim();
    if (token.length > 0) return token;
  }

  const header = request.headers['x-api-key'];
  if (typeof header === 'string') {
    const trimmed = header.trim();
    if (trimmed.length > 0) return trimmed;
  }
  if (Array.isArray(header)) {
    const trimmed = header[0]?.trim();
    if (trimmed) return trimmed;
  }

  return null;
}

function inferRouteScopeFromLabel(label: string | null | undefined): string | null {
  const normalized = (label ?? '').toLowerCase();
  return normalized.includes(API_KEY_EXTENSION_ONLY_LABEL_TOKEN) ? EXTENSION_ONLY_API_ROUTE : null;
}

export type ConsumeApiKeyRateResult = 'ok' | 'rate_limited' | 'quota_disabled';

export async function consumeApiKeyRate(
  db: Database,
  apiKeyId: string,
  limitPerMinute: number,
): Promise<ConsumeApiKeyRateResult> {
  if (limitPerMinute <= 0) {
    return 'quota_disabled';
  }

  const now = new Date();
  const [row] = await db
    .select()
    .from(apiKeyRate)
    .where(eq(apiKeyRate.apiKeyId, apiKeyId))
    .limit(1);

  if (!row) {
    await db.insert(apiKeyRate).values({
      apiKeyId,
      requestCount: 1,
      windowStartedAt: now,
    });
    return 'ok';
  }

  const elapsed = now.getTime() - row.windowStartedAt.getTime();
  if (elapsed >= RATE_WINDOW_MS) {
    await db
      .update(apiKeyRate)
      .set({ requestCount: 1, windowStartedAt: now })
      .where(eq(apiKeyRate.apiKeyId, apiKeyId));
    return 'ok';
  }

  if (row.requestCount >= limitPerMinute) {
    return 'rate_limited';
  }

  await db
    .update(apiKeyRate)
    .set({ requestCount: row.requestCount + 1 })
    .where(eq(apiKeyRate.apiKeyId, apiKeyId));
  return 'ok';
}

export type ApiKeyAuthContext = {
  keyId: string;
  ownerUserId: string;
  label: string;
  routeScope: string | null;
};

export async function validateApiKeyRequest(
  db: Database,
  request: FastifyRequest,
  pathname: string,
): Promise<{ ok: true; auth: ApiKeyAuthContext } | { ok: false; failure: ApiKeyValidateFailure }> {
  const raw = extractApiKeyFromRequest(request);
  if (!raw) {
    return { ok: false, failure: 'missing' };
  }

  const keyHash = hashApiKeySecret(raw);
  const [row] = await db
    .select()
    .from(apiKey)
    .where(and(eq(apiKey.keyHash, keyHash), eq(apiKey.kind, API_KEY_KIND_BEARER)))
    .limit(1);

  if (!row || row.revokedAt) {
    return { ok: false, failure: 'invalid' };
  }

  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) {
    return { ok: false, failure: 'expired' };
  }

  const routeScope = inferRouteScopeFromLabel(row.label);
  if (routeScope && pathname !== routeScope) {
    return { ok: false, failure: 'route_restricted' };
  }

  const rate = await consumeApiKeyRate(db, row.id, row.requestsPerMinute);
  if (rate === 'quota_disabled') {
    return { ok: false, failure: 'quota_disabled' };
  }
  if (rate === 'rate_limited') {
    return { ok: false, failure: 'rate_limited' };
  }

  const touch = new Date();
  await db
    .update(apiKey)
    .set({
      lastUsedAt: touch,
      updatedAt: touch,
      totalRequestCount: sql`${apiKey.totalRequestCount} + 1`,
    })
    .where(eq(apiKey.id, row.id));

  const [owner] = await db.select().from(user).where(eq(user.id, row.ownerUserId)).limit(1);
  if (!owner) {
    return { ok: false, failure: 'invalid' };
  }

  return {
    ok: true,
    auth: {
      keyId: row.id,
      ownerUserId: row.ownerUserId,
      label: row.label,
      routeScope,
    },
  };
}

export function hasApiKeyLabel(request: FastifyRequest, expectedLabel: string): boolean {
  return request.apiKeyAuth?.label === expectedLabel;
}

const FAILURE_SPEC: Record<
  ApiKeyValidateFailure,
  { status: number; error: string; retryAfter?: string }
> = {
  missing: {
    status: 401,
    error: 'Authentification requise : clé API (Authorization: Bearer … / X-Api-Key).',
  },
  invalid: { status: 401, error: 'Clé API invalide ou révoquée.' },
  expired: { status: 401, error: 'Clé API expirée.' },
  rate_limited: {
    status: 429,
    error:
      'Limite de fréquence atteinte : vous avez dépassé le nombre de requêtes autorisées par minute pour cette clé API. Réessayez dans environ une minute.',
    retryAfter: '60',
  },
  quota_disabled: {
    status: 403,
    error:
      'Accès API suspendu : le quota a été fixé à 0 (blocage côté administration). Il ne s’agit pas d’un simple dépassement de limite minute ; un administrateur doit remonter le quota pour rétablir l’accès.',
  },
  route_restricted: {
    status: 403,
    error: `Cette clé API est restreinte à la route ${EXTENSION_ONLY_API_ROUTE}.`,
  },
};

export function apiKeyFailureResponse(failure: ApiKeyValidateFailure): {
  status: number;
  body: { error: string };
  headers?: Record<string, string>;
} {
  const spec = FAILURE_SPEC[failure];
  return {
    status: spec.status,
    body: { error: spec.error },
    headers: spec.retryAfter ? { 'retry-after': spec.retryAfter } : undefined,
  };
}

/** Chemins accessibles sans clé API (sonde + assets Swagger UI). */
export function isApiKeyExemptPath(method: string, pathname: string): boolean {
  const verb = method.toUpperCase();
  if (verb === 'OPTIONS' || verb === 'HEAD') {
    return true;
  }

  if (pathname === '/health' || pathname === '/health/') {
    return true;
  }

  // L'API extension est protégée par contrôle d'origine (voir extension-origin.ts),
  // pas par clé API.
  if (pathname === '/private/extension' || pathname === '/private/extension/') {
    return true;
  }

  if (
    pathname === '/' ||
    pathname === '/json' ||
    pathname === '/yaml' ||
    pathname.startsWith('/static/')
  ) {
    return true;
  }

  return false;
}
