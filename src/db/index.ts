import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { env } from '../config/env.js';
import * as relations from './relations.js';
import * as schema from './schema.js';

const client = postgres(env.DATABASE_URL);

export const db = drizzle(client, { schema: { ...schema, ...relations } });

export type Database = typeof db;

export async function closeDb() {
  await client.end();
}
