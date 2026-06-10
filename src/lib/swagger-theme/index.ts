import type { FastifyInstance } from 'fastify';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { readBannerWebp } from './banner.js';
import { buildMountHeaderScript } from './mount-header.js';

const themeDir = dirname(fileURLToPath(import.meta.url));
const BANNER_URL = '/static/theme/banner.webp';

function readThemeText(filename: string): string {
  return readFileSync(join(themeDir, filename), 'utf8');
}

export function resolveSitePublicUrl(): string {
  return (process.env.SITE_PUBLIC_URL ?? 'https://f95france.site').replace(/\/$/, '');
}

export function renderHeaderHtml(sitePublicUrl: string = resolveSitePublicUrl()): string {
  return readThemeText('header.html')
    .replaceAll('{{SITE_URL}}', sitePublicUrl)
    .replaceAll('{{BANNER_URL}}', BANNER_URL);
}

export function buildSwaggerUiTheme() {
  return {
    title: 'API publique F95 France',
    css: [{ filename: 'f95-france-theme.css', content: readThemeText('theme.css') }],
    js: [{ filename: 'f95-france-header.js', content: buildMountHeaderScript() }],
  };
}

export async function registerSwaggerThemeAssets(app: FastifyInstance) {
  app.get('/static/theme/header.html', { schema: { hide: true } }, (_request, reply) => {
    reply.type('text/html; charset=utf-8').send(renderHeaderHtml());
  });

  app.get('/static/theme/banner.webp', { schema: { hide: true } }, (_request, reply) => {
    reply.type('image/webp').send(readBannerWebp());
  });
}
