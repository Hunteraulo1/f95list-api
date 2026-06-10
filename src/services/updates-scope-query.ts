import { and, eq, or, sql, type SQL } from 'drizzle-orm';

import * as table from '../db/schema.js';

export type UpdatesApiScope = 'featured' | 'all';

export function parseUpdatesApiScope(searchParams: URLSearchParams): UpdatesApiScope {
  const scopeRaw = searchParams.get('scope')?.trim().toLowerCase();
  if (scopeRaw === 'all') return 'all';
  if (scopeRaw === 'featured') return 'featured';

  return 'featured';
}

export function featuredUpdatesScopeWhere(): SQL {
  const isAdding = eq(table.update.status, 'adding');

  const hasVersionDelta = sql`exists (
    select 1 from ${table.updateHistory} uh
    where uh.update_id = ${table.update.id}
    and uh.changes is not null
    and exists (
      select 1 from jsonb_array_elements(uh.changes::jsonb->'deltas') as delta
      where (delta->>'field' = 'version' or delta->>'field' = 'tversion')
      and coalesce(delta->>'oldValue', '') is distinct from coalesce(delta->>'newValue', '')
    )
  )`;

  const featured = or(isAdding, hasVersionDelta);
  return featured ?? isAdding;
}

export function buildUpdatesListWhere(scope: UpdatesApiScope, extra?: SQL): SQL | undefined {
  const parts: SQL[] = [];
  if (scope === 'featured') {
    parts.push(featuredUpdatesScopeWhere());
  }
  if (extra) parts.push(extra);
  if (parts.length === 0) return undefined;
  return parts.length === 1 ? parts[0] : and(...parts);
}
