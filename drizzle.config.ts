import { defineConfig } from 'drizzle-kit';

import { env } from './src/config/env.js';
import { resolveMariaDbSslOptions } from './src/config/mariadb-ssl.js';

const ssl = resolveMariaDbSslOptions(env.MARIADB_SSL_MODE);

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    host: env.MARIADB_HOST,
    port: env.MARIADB_PORT,
    user: env.MARIADB_USER,
    password: env.MARIADB_PASSWORD,
    database: env.MARIADB_DATABASE,
    ...(ssl !== undefined ? { ssl } : {}),
  },
});
