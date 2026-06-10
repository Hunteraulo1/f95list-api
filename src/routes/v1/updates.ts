import { desc, eq } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';

import { enginesPerGameSubquery } from '../../db/engines-per-game-subquery.js';
import { game, update as updateTable } from '../../db/schema.js';
import { apiError } from '../../lib/api-error.js';
import { openApiRouteResponses } from '../../schemas/openapi/responses.js';
import { openApiOperations, openApiParams, openApiQuery } from '../../schemas/openapi/v1.js';
import { dateRangeOnColumn, parseOptionalDateRangeQuery } from '../../services/date-range-query.js';
import { translationsByGameIds } from '../../services/games-with-translations.js';
import { parseInclude, searchParamsFromQuery } from '../../services/include-query.js';
import { embeddedGameFromRow } from '../../services/updates-embedded-game.js';
import { buildUpdatesListWhere, parseUpdatesApiScope } from '../../services/updates-scope-query.js';

const updateRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/updates',
    {
      schema: {
        tags: ['Mises à jour'],
        summary: openApiOperations.listUpdates.summary,
        description: openApiOperations.listUpdates.description,
        querystring: {
          type: 'object',
          properties: {
            limit: openApiQuery.limit,
            scope: openApiQuery.scope,
            startDate: openApiQuery.startDate,
            endDate: openApiQuery.endDate,
            include: openApiQuery.include,
          },
        },
        response: openApiRouteResponses.listUpdates,
      },
    },
    async (request, reply) => {
      try {
        const params = searchParamsFromQuery(request.query as Record<string, unknown>);

        const limitRaw = params.get('limit');
        const parsedLimit = limitRaw ? Number.parseInt(limitRaw, 10) : 50;
        const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 200) : 50;

        const range = parseOptionalDateRangeQuery(params);
        if (!range.ok) {
          return apiError(reply, 400, range.message);
        }

        const updateDateWhere = dateRangeOnColumn(updateTable.createdAt, range.from, range.to);
        const scope = parseUpdatesApiScope(params);
        const listWhere = buildUpdatesListWhere(scope, updateDateWhere);

        const inc = parseInclude(params);
        const withGame = inc.has('game');
        const withTranslations = inc.has('translations');

        const slimSelect = () =>
          app.db
            .select({
              updateId: updateTable.id,
              updateStatus: updateTable.status,
              updateCreatedAt: updateTable.createdAt,
              updateUpdatedAt: updateTable.updatedAt,
              gameId: updateTable.gameId,
            })
            .from(updateTable);

        if (!withGame && !withTranslations) {
          const slim = await (listWhere ? slimSelect().where(listWhere) : slimSelect())
            .orderBy(desc(updateTable.createdAt))
            .limit(limit);
          return slim;
        }

        if (!withGame && withTranslations) {
          const slim = await (listWhere ? slimSelect().where(listWhere) : slimSelect())
            .orderBy(desc(updateTable.createdAt))
            .limit(limit);
          const byGame = await translationsByGameIds(
            app.db,
            slim.map((s) => s.gameId),
          );
          return slim.map((s) => ({
            ...s,
            game: {
              id: s.gameId,
              translations: byGame.get(s.gameId) ?? [],
            },
          }));
        }

        const enginesSq = enginesPerGameSubquery();
        const flatBase = app.db
          .select({
            updateId: updateTable.id,
            updateStatus: updateTable.status,
            updateCreatedAt: updateTable.createdAt,
            updateUpdatedAt: updateTable.updatedAt,
            gameId: game.id,
            gameName: game.name,
            gameImage: game.image,
            gameLink: game.link,
            gameWebsite: game.website,
            gameThreadId: game.threadId,
            gameGameVersion: game.gameVersion,
            gameEngineTypes: enginesSq.engineTypes,
            gameTags: game.tags,
          })
          .from(updateTable)
          .innerJoin(game, eq(updateTable.gameId, game.id))
          .leftJoin(enginesSq, eq(game.id, enginesSq.gameId));

        const flat = await (listWhere ? flatBase.where(listWhere) : flatBase)
          .orderBy(desc(updateTable.createdAt))
          .limit(limit);

        if (!withTranslations) {
          return flat.map((r) => ({
            updateId: r.updateId,
            updateStatus: r.updateStatus,
            updateCreatedAt: r.updateCreatedAt,
            updateUpdatedAt: r.updateUpdatedAt,
            gameId: r.gameId,
            game: embeddedGameFromRow(r),
          }));
        }

        const byGame = await translationsByGameIds(
          app.db,
          flat.map((r) => r.gameId),
        );
        return flat.map((r) => ({
          updateId: r.updateId,
          updateStatus: r.updateStatus,
          updateCreatedAt: r.updateCreatedAt,
          updateUpdatedAt: r.updateUpdatedAt,
          gameId: r.gameId,
          game: {
            ...embeddedGameFromRow(r),
            translations: byGame.get(r.gameId) ?? [],
          },
        }));
      } catch (error) {
        request.log.error(error, 'Error fetching updates');
        return apiError(reply, 500, 'Impossible de récupérer les mises à jour.');
      }
    },
  );

  app.get(
    '/updates/:id',
    {
      schema: {
        tags: ['Mises à jour'],
        summary: openApiOperations.getUpdate.summary,
        description: openApiOperations.getUpdate.description,
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
        response: openApiRouteResponses.getUpdate,
      },
    },
    async (request, reply) => {
      const { id: updateId } = request.params as { id: string };

      if (!updateId) {
        return apiError(reply, 400, "L'identifiant de la mise à jour est requis.");
      }

      try {
        const params = searchParamsFromQuery(request.query as Record<string, unknown>);
        const inc = parseInclude(params);
        const withGame = inc.has('game');
        const withTranslations = inc.has('translations');

        const slimSelect = () =>
          app.db
            .select({
              updateId: updateTable.id,
              updateStatus: updateTable.status,
              updateCreatedAt: updateTable.createdAt,
              updateUpdatedAt: updateTable.updatedAt,
              gameId: updateTable.gameId,
            })
            .from(updateTable);

        if (!withGame && !withTranslations) {
          const slim = await slimSelect().where(eq(updateTable.id, updateId)).limit(1);
          if (slim.length === 0) {
            return apiError(reply, 404, 'Mise à jour introuvable.');
          }
          return slim[0];
        }

        if (!withGame && withTranslations) {
          const slim = await slimSelect().where(eq(updateTable.id, updateId)).limit(1);
          if (slim.length === 0) {
            return apiError(reply, 404, 'Mise à jour introuvable.');
          }
          const s = slim[0];
          if (!s) {
            return apiError(reply, 404, 'Mise à jour introuvable.');
          }
          const byGame = await translationsByGameIds(app.db, [s.gameId]);
          return {
            ...s,
            game: {
              id: s.gameId,
              translations: byGame.get(s.gameId) ?? [],
            },
          };
        }

        const enginesSq = enginesPerGameSubquery();
        const flat = await app.db
          .select({
            updateId: updateTable.id,
            updateStatus: updateTable.status,
            updateCreatedAt: updateTable.createdAt,
            updateUpdatedAt: updateTable.updatedAt,
            gameId: game.id,
            gameName: game.name,
            gameImage: game.image,
            gameLink: game.link,
            gameWebsite: game.website,
            gameThreadId: game.threadId,
            gameGameVersion: game.gameVersion,
            gameEngineTypes: enginesSq.engineTypes,
            gameTags: game.tags,
          })
          .from(updateTable)
          .innerJoin(game, eq(updateTable.gameId, game.id))
          .leftJoin(enginesSq, eq(game.id, enginesSq.gameId))
          .where(eq(updateTable.id, updateId))
          .limit(1);

        if (flat.length === 0) {
          return apiError(reply, 404, 'Mise à jour introuvable.');
        }

        const r = flat[0];
        if (!r) {
          return apiError(reply, 404, 'Mise à jour introuvable.');
        }

        const base = {
          updateId: r.updateId,
          updateStatus: r.updateStatus,
          updateCreatedAt: r.updateCreatedAt,
          updateUpdatedAt: r.updateUpdatedAt,
          gameId: r.gameId,
          game: embeddedGameFromRow(r),
        };

        if (!withTranslations) {
          return base;
        }

        const byGame = await translationsByGameIds(app.db, [r.gameId]);
        return {
          ...base,
          game: {
            ...base.game,
            translations: byGame.get(r.gameId) ?? [],
          },
        };
      } catch (error) {
        request.log.error(error, 'Error fetching update');
        return apiError(reply, 500, 'Impossible de récupérer la mise à jour.');
      }
    },
  );
};

export default updateRoutes;
