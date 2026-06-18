import { config } from 'dotenv';
import * as v from 'valibot';

import { buildDatabaseUrl } from './build-database-url.js';
import { MARIADB_SSL_MODES, normalizeMariaDbSslMode, type MariaDbSslMode } from './mariadb-ssl.js';

config();

const envSchema = v.object({
  PORT: v.optional(v.pipe(v.string(), v.transform(Number), v.integer(), v.minValue(1))),
  HOST: v.optional(v.string()),
  MARIADB_HOST: v.optional(v.string()),
  MARIADB_PORT: v.optional(v.pipe(v.string(), v.transform(Number), v.integer(), v.minValue(1))),
  MARIADB_USER: v.pipe(v.string(), v.minLength(1)),
  MARIADB_PASSWORD: v.optional(v.string()),
  MARIADB_DATABASE: v.pipe(v.string(), v.minLength(1)),
  MARIADB_SSL_MODE: v.optional(
    v.pipe(
      v.string(),
      v.transform((value) => normalizeMariaDbSslMode(value)),
      v.picklist(MARIADB_SSL_MODES),
    ),
  ),
});

const parsed = v.safeParse(envSchema, process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', v.flatten(parsed.issues));
  process.exit(1);
}

const dbHost = parsed.output.MARIADB_HOST ?? 'localhost';
const dbPort = parsed.output.MARIADB_PORT ?? 3306;
const dbSslMode: MariaDbSslMode = parsed.output.MARIADB_SSL_MODE ?? 'disable';
const dbUser = parsed.output.MARIADB_USER;
const dbPassword = parsed.output.MARIADB_PASSWORD ?? '';
const dbName = parsed.output.MARIADB_DATABASE;

export const env = {
  PORT: parsed.output.PORT ?? 3000,
  HOST: parsed.output.HOST ?? '0.0.0.0',
  MARIADB_HOST: dbHost,
  MARIADB_PORT: dbPort,
  MARIADB_USER: dbUser,
  MARIADB_PASSWORD: dbPassword,
  MARIADB_DATABASE: dbName,
  MARIADB_SSL_MODE: dbSslMode,
  DATABASE_URL: buildDatabaseUrl({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    name: dbName,
  }),
};
