import type { FastifyPluginAsync } from 'fastify';

import { apiError } from '../../lib/api-error.js';
import { EXPLOITATION_SI_API_KEY_LABEL, hasApiKeyLabel } from '../../lib/api-key-auth.js';
import { listUserIpAggregates } from '../../services/user-ip-aggregates.js';

const privateIpsRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/ips',
    {
      schema: { hide: true },
    },
    async (request, reply) => {
      if (!hasApiKeyLabel(request, EXPLOITATION_SI_API_KEY_LABEL)) {
        return apiError(
          reply,
          403,
          'Accès réservé aux clés API portant le libellé [exploitation-si].',
        );
      }

      return listUserIpAggregates(app.db);
    },
  );
};

export default privateIpsRoutes;
