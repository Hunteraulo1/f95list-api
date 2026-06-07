import cors from '@fastify/cors';
import Fastify from 'fastify';
import { ValiError } from 'valibot';

import { env } from './config/env.js';
import drizzlePlugin from './plugins/drizzle.js';
import swaggerPlugin from './plugins/swagger.js';
import routes from './routes/index.js';

export async function buildApp() {
  const app = Fastify({
    logger: true,
    routerOptions: {
      ignoreTrailingSlash: true,
    },
  });

  app.setErrorHandler((error: Error & { statusCode?: number }, _request, reply) => {
    if (error instanceof ValiError) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Validation échouée',
        details: error.issues.map((issue) => ({
          path: issue.path?.map((p: { key: string | number }) => p.key).join('.') ?? '',
          message: issue.message,
        })),
      });
    }

    app.log.error(error);

    const statusCode =
      'statusCode' in error && typeof error.statusCode === 'number' ? error.statusCode : 500;

    return reply.status(statusCode).send({
      statusCode,
      error: error instanceof Error ? error.name : 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Erreur interne',
    });
  });

  await app.register(cors, {
    origin: '*',
    methods: ['GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Api-Key'],
  });

  await app.register(swaggerPlugin);
  await app.register(drizzlePlugin);
  await app.register(routes);
  
  console.info(app.printRoutes());

  return app;
}

export async function startServer() {
  const app = await buildApp();

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    app.log.info(`Documentation API : http://${env.HOST}:${env.PORT}/`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }

  return app;
}
