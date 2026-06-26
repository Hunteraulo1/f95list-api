import type { FastifyRequest } from 'fastify';

/** Schémas d'origine des runtimes d'extension navigateur. */
const EXTENSION_ORIGIN_PREFIXES = [
  'chrome-extension://',
  'moz-extension://',
  'safari-web-extension://',
];

/** Origines des pages de forum depuis lesquelles l'extension peut appeler l'API. */
const EXTENSION_HOST_PAGE_ORIGIN_PREFIXES = [
  'https://f95zone.to',
  'http://f95zone.to',
  'https://www.f95zone.to',
  'https://lewdcorner.com',
  'http://lewdcorner.com',
  'https://www.lewdcorner.com',
];

/**
 * Autorise une requête de l'extension sur la base de son en-tête `Origin`
 * (runtime d'extension ou page de forum allowlistée), sans clé API.
 */
export function isExtensionClientRequest(request: FastifyRequest): boolean {
  const header = request.headers.origin;
  const origin = (typeof header === 'string' ? header : '').trim();
  if (!origin) return false;
  return (
    EXTENSION_ORIGIN_PREFIXES.some((prefix) => origin.startsWith(prefix)) ||
    EXTENSION_HOST_PAGE_ORIGIN_PREFIXES.some((prefix) => origin.startsWith(prefix))
  );
}
