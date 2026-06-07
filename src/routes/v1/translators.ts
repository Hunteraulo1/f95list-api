import { eq } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';

import { translator } from '../../db/schema.js';
import { apiError, methodNotAllowed } from '../../lib/api-error.js';
import { openApiOperations, openApiParams, openApiQuery } from '../../schemas/openapi/v1.js';
import { searchParamsFromQuery } from '../../services/include-query.js';
import {
  translatorReadCountExpr,
  translatorTradCountExpr,
} from '../../services/translator-activity-counts.js';
import { parseTranslatorCountFilters } from '../../services/translator-count-filters.js';

const translatorRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/translators',
    {
      schema: {
        tags: ['Traducteurs'],
        summary: openApiOperations.listTranslators.summary,
        description: openApiOperations.listTranslators.description,
        querystring: {
          type: 'object',
          properties: {
            activeOnly: openApiQuery.activeOnly,
            tradCountMin: openApiQuery.tradCountMin,
            tradCountMax: openApiQuery.tradCountMax,
            readCountMin: openApiQuery.readCountMin,
            readCountMax: openApiQuery.readCountMax,
            hasDiscord: openApiQuery.hasDiscord,
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const params = searchParamsFromQuery(request.query as Record<string, unknown>);
        const filters = parseTranslatorCountFilters(params);
        if (!filters.ok) {
          return apiError(reply, 400, filters.message);
        }

        const selectTranslators = () =>
          app.db
            .select({
              id: translator.id,
              name: translator.name,
              discordId: translator.discordId,
              pages: translator.pages,
              tradCount: translatorTradCountExpr().as('tradCount'),
              readCount: translatorReadCountExpr().as('readCount'),
              createdAt: translator.createdAt,
              updatedAt: translator.updatedAt,
            })
            .from(translator);

        return filters.where ? selectTranslators().where(filters.where) : selectTranslators();
      } catch (error) {
        request.log.error(error, 'Error fetching translators');
        return apiError(reply, 500, 'Impossible de récupérer les traducteurs.');
      }
    },
  );

  app.post('/translators', { schema: { hide: true } }, async (_request, reply) =>
    methodNotAllowed.post(reply),
  );

  app.get(
    '/translators/:id',
    {
      schema: {
        tags: ['Traducteurs'],
        summary: openApiOperations.getTranslator.summary,
        description: openApiOperations.getTranslator.description,
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: openApiParams.uuidId },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      if (!id) {
        return apiError(reply, 400, "L'identifiant du traducteur est requis.");
      }

      try {
        const rows = await app.db
          .select({
            id: translator.id,
            name: translator.name,
            discordId: translator.discordId,
            pages: translator.pages,
            tradCount: translatorTradCountExpr().as('tradCount'),
            readCount: translatorReadCountExpr().as('readCount'),
            createdAt: translator.createdAt,
            updatedAt: translator.updatedAt,
          })
          .from(translator)
          .where(eq(translator.id, id))
          .limit(1);

        if (rows.length === 0) {
          return apiError(reply, 404, 'Traducteur introuvable.');
        }

        return rows[0];
      } catch (error) {
        request.log.error(error, 'Error fetching translator');
        return apiError(reply, 500, 'Impossible de récupérer le traducteur.');
      }
    },
  );
};

export default translatorRoutes;
