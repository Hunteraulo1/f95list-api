import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { openApiDescription, openApiServers } from '../lib/openapi-description.js';
import { buildSwaggerUiTheme, registerSwaggerThemeAssets } from '../lib/swagger-theme/index.js';

const swaggerPlugin: FastifyPluginAsync = async (app) => {
  await app.register(swagger, {
    refResolver: {
      buildLocalReference(json, _baseUri, _fragment, i) {
        if (!json.title && json.$id) {
          json.title = json.$id;
        }
        if (!json.$id) {
          return `def-${i}`;
        }
        return `${json.$id}`;
      },
    },
    openapi: {
      info: {
        title: 'API publique F95 France',
        description: openApiDescription,
        version: '1.0.0',
      },
      servers: openApiServers,
      tags: [
        {
          name: 'Jeux',
          description:
            'Jeux référencés sur le site et leurs informations (fiche, liens, version, etc.).',
        },
        {
          name: 'Traductions',
          description:
            'Liste des traductions : chaque entrée est rattachée à un jeu (statut, liens vers les patchs, etc.).',
        },
        { name: 'Traducteurs', description: 'Liste publique des traducteurs.' },
        {
          name: 'Mises à jour',
          description:
            'Jeux pour lesquels une traduction a été mise à jour par un traducteur, ou dont la traduction est indiquée comme intégrée au jeu — le fil reflète ces événements dans l’ordre chronologique.',
        },
        { name: 'health', description: 'Sonde de santé (sans authentification).' },
      ],
      components: {
        securitySchemes: {
          ApiKeyBearer: {
            type: 'http',
            scheme: 'bearer',
            description: 'Clé API complète (ex. f95ext_…).',
          },
          ApiKeyHeader: {
            type: 'apiKey',
            in: 'header',
            name: 'X-Api-Key',
            description: 'Clé API complète (même valeur qu’en Bearer).',
          },
        },
      },
      security: [{ ApiKeyBearer: [] }, { ApiKeyHeader: [] }],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/',
    theme: buildSwaggerUiTheme(),
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
      persistAuthorization: true,
    },
  });

  await registerSwaggerThemeAssets(app);
};

export default fp(swaggerPlugin, { name: 'swagger' });
