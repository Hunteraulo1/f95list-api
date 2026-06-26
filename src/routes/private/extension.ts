import type { FastifyPluginAsync } from 'fastify';

import { apiError, methodNotAllowed } from '../../lib/api-error.js';
import { buildExtensionApiPayload } from '../../services/extension-api.js';

const extensionRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/extension',
    {
      schema: {
        tags: ['Extension'],
        summary: 'Données agrégées pour l’extension navigateur',
        description:
          'Renvoie les jeux, mises à jour et traducteurs au format attendu par l’extension navigateur (libellés français). Filtrer sur un jeu via le paramètre `gameId`.',
        querystring: {
          type: 'object',
          properties: {
            gameId: {
              type: 'string',
              description: 'Identifiant du jeu pour ne renvoyer que ses traductions.',
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  games: { type: 'array', items: { type: 'object', additionalProperties: true } },
                  updates: { type: 'array', items: { type: 'object', additionalProperties: true } },
                  traductors: {
                    type: 'array',
                    items: { type: 'object', additionalProperties: true },
                  },
                },
                additionalProperties: true,
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { gameId } = request.query as { gameId?: string };
        const data = await buildExtensionApiPayload(app.db, gameId?.trim() || undefined);
        return { data };
      } catch (error) {
        request.log.error(error, 'Error fetching extension api data');
        return apiError(reply, 500, 'Failed to fetch extension api data');
      }
    },
  );

  app.post('/extension', { schema: { hide: true } }, async (_request, reply) =>
    methodNotAllowed.post(reply),
  );
};

export default extensionRoutes;
