import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { closeDb, type Database, db } from '../db/index.js';

declare module 'fastify' {
  interface FastifyInstance {
    db: Database;
  }
}

const drizzlePlugin: FastifyPluginAsync = async (app) => {
  app.decorate('db', db);

  app.addHook('onClose', async () => {
    await closeDb();
  });
};

export default fp(drizzlePlugin, { name: 'drizzle' });
