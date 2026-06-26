import type { FastifyPluginAsync } from 'fastify';
import healthRoutes from './health.js';
import extensionRoutes from './private/extension.js';
import privateIpsRoutes from './private/ips.js';
import gameRoutes from './v1/games.js';
import translationRoutes from './v1/translations.js';
import translatorRoutes from './v1/translators.js';
import updateRoutes from './v1/updates.js';

const routes: FastifyPluginAsync = async (app) => {
  await app.register(healthRoutes, { prefix: '/' });
  await app.register(privateIpsRoutes, { prefix: '/private' });
  await app.register(gameRoutes, { prefix: '/v1' });
  await app.register(translationRoutes, { prefix: '/v1' });
  await app.register(translatorRoutes, { prefix: '/v1' });
  await app.register(updateRoutes, { prefix: '/v1' });
  await app.register(extensionRoutes, { prefix: '/private' });
};

export default routes;
