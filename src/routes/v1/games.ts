import { eq } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';

import { game } from '../../db/schema.js';
import { apiError, methodNotAllowed } from '../../lib/api-error.js';
import { openApiOperations, openApiParams, openApiQuery } from '../../schemas/openapi/v1.js';
import { translationsByGameIds } from '../../services/games-with-translations.js';
import { parseInclude, searchParamsFromQuery } from '../../services/include-query.js';

const gameRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/games',
    {
      schema: {
        tags: ['Jeux'],
        summary: openApiOperations.listGames.summary,
        description: openApiOperations.listGames.description,
        querystring: {
          type: 'object',
          properties: {
            website: openApiQuery.website,
            include: openApiQuery.include,
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const params = searchParamsFromQuery(request.query as Record<string, unknown>);
        const websiteFilter = params.get('website')?.trim();
        if (websiteFilter && websiteFilter.length > 32) {
          return apiError(reply, 400, 'Paramètre website invalide (32 caractères maximum).');
        }

        const selectGames = () => app.db.select().from(game);
        const games = await (websiteFilter
          ? selectGames().where(eq(game.website, websiteFilter))
          : selectGames());

        if (!parseInclude(params).has('translations')) {
          return games;
        }

        const byGame = await translationsByGameIds(
          app.db,
          games.map((g) => g.id),
        );
        return games.map((g) => ({
          ...g,
          translations: byGame.get(g.id) ?? [],
        }));
      } catch (error) {
        request.log.error(error, 'Error fetching games');
        return apiError(reply, 500, 'Impossible de récupérer les jeux.');
      }
    },
  );

  app.post('/games', { schema: { hide: true } }, async (_request, reply) =>
    methodNotAllowed.post(reply),
  );

  app.get(
    '/games/:id',
    {
      schema: {
        tags: ['Jeux'],
        summary: openApiOperations.getGame.summary,
        description: openApiOperations.getGame.description,
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: openApiParams.uuidId },
        },
        querystring: {
          type: 'object',
          properties: {
            include: openApiQuery.include,
          },
        },
      },
    },
    async (request, reply) => {
      const { id: gameId } = request.params as { id: string };

      if (!gameId) {
        return apiError(reply, 400, "L'identifiant du jeu est requis.");
      }

      try {
        const selectedGame = await app.db.select().from(game).where(eq(game.id, gameId));
        if (selectedGame.length === 0) {
          return apiError(reply, 404, 'Jeu introuvable.');
        }

        const g = selectedGame[0];
        if (!g) {
          return apiError(reply, 404, 'Jeu introuvable.');
        }

        const params = searchParamsFromQuery(request.query as Record<string, unknown>);
        if (!parseInclude(params).has('translations')) {
          return g;
        }

        const byGame = await translationsByGameIds(app.db, [g.id]);
        return { ...g, translations: byGame.get(g.id) ?? [] };
      } catch (error) {
        request.log.error(error, 'Error fetching game');
        return apiError(reply, 500, 'Impossible de récupérer le jeu.');
      }
    },
  );

  app.put('/games/:id', { schema: { hide: true } }, async (_request, reply) =>
    methodNotAllowed.put(reply),
  );
};

export default gameRoutes;
