import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { openApiEntitySchemas } from '../schemas/openapi/entities.js';

const openApiSchemasPlugin: FastifyPluginAsync = async (app) => {
  for (const schema of openApiEntitySchemas) {
    app.addSchema(schema);
  }
};

export default fp(openApiSchemasPlugin, { name: 'openapi-schemas' });
