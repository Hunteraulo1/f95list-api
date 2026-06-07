import { sql } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';

const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/health',
    {
      schema: {
        tags: ['health'],
        description: 'Sonde de santé (app + base de données). Accessible sans authentification.',
        security: [],
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              database: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
            },
          },
          503: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              database: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        await app.db.execute(sql`SELECT 1`);
        return {
          status: 'ok',
          database: 'up',
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        request.log.error(error);
        return reply.status(503).send({
          status: 'error',
          database: 'down',
        });
      }
    },
  );
};

export default healthRoutes;
