import { desc, eq } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';

import { gameTranslation } from '../../db/schema.js';
import { apiError } from '../../lib/api-error.js';
import { openApiRouteResponses } from '../../schemas/openapi/responses.js';
import { openApiOperations, openApiParams, openApiQuery } from '../../schemas/openapi/v1.js';
import { searchParamsFromQuery } from '../../services/include-query.js';
import { parseTranslationListFilters } from '../../services/translation-list-filters.js';
import { mapTranslationsForPublicApi } from '../../services/translation-public.js';

const translationRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/translations',
    {
      schema: {
        tags: ['Traductions'],
        summary: openApiOperations.listTranslations.summary,
        description: openApiOperations.listTranslations.description,
        querystring: {
          type: 'object',
          properties: {
            gameId: openApiQuery.gameId,
            status: openApiQuery.status,
            gameType: openApiQuery.gameType,
            versionMatchesTversion: openApiQuery.versionMatchesTversion,
          },
        },
        response: openApiRouteResponses.listTranslations,
      },
    },
    async (request, reply) => {
      try {
        const params = searchParamsFromQuery(request.query as Record<string, unknown>);
        const filters = parseTranslationListFilters(params);
        if (!filters.ok) {
          return apiError(reply, 400, filters.message);
        }

        const rows = await (filters.where
          ? app.db.select().from(gameTranslation).where(filters.where)
          : app.db.select().from(gameTranslation)
        ).orderBy(desc(gameTranslation.updatedAt));

        return mapTranslationsForPublicApi(app.db, rows);
      } catch (error) {
        request.log.error(error, 'Error fetching translations');
        return apiError(reply, 500, 'Impossible de récupérer les traductions.');
      }
    },
  );

  app.get(
    '/translations/:id',
    {
      schema: {
        tags: ['Traductions'],
        summary: openApiOperations.getTranslation.summary,
        description: openApiOperations.getTranslation.description,
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: openApiParams.uuidId },
        },
        response: openApiRouteResponses.getTranslation,
      },
    },
    async (request, reply) => {
      const { id: translationId } = request.params as { id: string };

      if (!translationId) {
        return apiError(reply, 400, "L'identifiant de la traduction est requis.");
      }

      try {
        const rows = await app.db
          .select()
          .from(gameTranslation)
          .where(eq(gameTranslation.id, translationId))
          .limit(1);

        if (rows.length === 0) {
          return apiError(reply, 404, 'Traduction introuvable.');
        }

        const [mapped] = await mapTranslationsForPublicApi(app.db, rows);
        return mapped;
      } catch (error) {
        request.log.error(error, 'Error fetching translation');
        return apiError(reply, 500, 'Impossible de récupérer la traduction.');
      }
    },
  );
};

export default translationRoutes;
