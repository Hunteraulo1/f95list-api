import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import {
    apiKeyFailureResponse,
    isApiKeyExemptPath,
    validateApiKeyRequest,
} from '../lib/api-key-auth.js';

declare module 'fastify' {
  interface FastifyRequest {
    apiKeyAuth?: {
      keyId: string;
      ownerUserId: string;
      label: string;
      routeScope: string | null;
    };
  }
}

const apiKeyAuthPlugin: FastifyPluginAsync = async (app) => {
  app.addHook('onRequest', async (request, reply) => {
    const pathname = request.url.split('?')[0] ?? request.url;
    if (isApiKeyExemptPath(request.method, pathname)) {
      return;
    }

    const result = await validateApiKeyRequest(app.db, request, pathname);
    if (!result.ok) {
      const failure = apiKeyFailureResponse(result.failure);
      if (failure.headers) {
        for (const [name, value] of Object.entries(failure.headers)) {
          reply.header(name, value);
        }
      }
      return reply.status(failure.status).send(failure.body);
    }

    request.apiKeyAuth = result.auth;
  });
};

export default fp(apiKeyAuthPlugin, { name: 'api-key-auth', dependencies: ['drizzle'] });
