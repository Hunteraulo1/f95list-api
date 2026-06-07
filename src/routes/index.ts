import type { FastifyPluginAsync } from 'fastify';
import healthRoutes from './health.js';
import gameRoutes from './v1/games.js';
import translationRoutes from './v1/translations.js';
import translatorRoutes from './v1/translators.js';
import updateRoutes from './v1/updates.js';

const routes: FastifyPluginAsync = async (app) => {
  await app.register(healthRoutes, { prefix: '/api' });
  await app.register(gameRoutes, { prefix: '/api/v1' });
  await app.register(translationRoutes, { prefix: '/api/v1' });
  await app.register(translatorRoutes, { prefix: '/api/v1' });
  await app.register(updateRoutes, { prefix: '/api/v1' });
};

export default routes;
