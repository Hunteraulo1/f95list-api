import type { ConnectionOptions } from 'mysql2/promise';

export const MARIADB_SSL_MODES = [
  'disable',
  'prefer',
  'require',
  'verify-ca',
  'verify-full',
] as const;

export type MariaDbSslMode = (typeof MARIADB_SSL_MODES)[number];

const SSL_MODE_ALIASES: Record<string, MariaDbSslMode> = {
  disable: 'disable',
  disabled: 'disable',
  prefer: 'prefer',
  preferred: 'prefer',
  require: 'require',
  required: 'require',
  'verify-ca': 'verify-ca',
  verify_ca: 'verify-ca',
  'verify-full': 'verify-full',
  verify_full: 'verify-full',
  'verify-identity': 'verify-full',
  verify_identity: 'verify-full',
};

export function normalizeMariaDbSslMode(value: string): MariaDbSslMode | undefined {
  const normalized = value.trim().toLowerCase().replaceAll('_', '-');
  return SSL_MODE_ALIASES[normalized];
}

export function resolveMariaDbSslOptions(mode: MariaDbSslMode): ConnectionOptions['ssl'] {
  switch (mode) {
    case 'disable':
      return undefined;
    case 'prefer':
    case 'require':
      return { rejectUnauthorized: false };
    case 'verify-ca':
    case 'verify-full':
      return { rejectUnauthorized: true };
  }
}
