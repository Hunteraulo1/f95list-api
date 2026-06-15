import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

import { env } from '../config/env.js';
import * as relations from './relations.js';
import * as schema from './schema.js';

const pool = mysql.createPool(env.DATABASE_URL);

export const db = drizzle(pool, { schema: { ...schema, ...relations }, mode: 'default' });

export type Database = typeof db;

export async function closeDb() {
  await pool.end();
}
