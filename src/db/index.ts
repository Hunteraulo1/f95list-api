import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

import { env } from '../config/env.js';
import { resolveMariaDbSslOptions } from '../config/mariadb-ssl.js';
import * as relations from './relations.js';
import * as schema from './schema.js';

const ssl = resolveMariaDbSslOptions(env.MARIADB_SSL_MODE);

const pool = mysql.createPool({
  uri: env.DATABASE_URL,
  ...(ssl !== undefined ? { ssl } : {}),
});

export const db = drizzle(pool, { schema: { ...schema, ...relations }, mode: 'default' });

export type Database = typeof db;

export async function closeDb() {
  await pool.end();
}
