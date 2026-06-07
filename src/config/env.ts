import { config } from 'dotenv';
import * as v from 'valibot';

import { buildDatabaseUrl } from './build-database-url.js';

config();

const envSchema = v.object({
  PORT: v.optional(v.pipe(v.string(), v.transform(Number), v.integer(), v.minValue(1))),
  HOST: v.optional(v.string()),
  DB_HOST: v.optional(v.string()),
  DB_PORT: v.optional(v.pipe(v.string(), v.transform(Number), v.integer(), v.minValue(1))),
  DB_USER: v.pipe(v.string(), v.minLength(1)),
  DB_PASSWORD: v.optional(v.string()),
  DB_NAME: v.pipe(v.string(), v.minLength(1)),
});

const parsed = v.safeParse(envSchema, process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', v.flatten(parsed.issues));
  process.exit(1);
}

const dbHost = parsed.output.DB_HOST ?? 'localhost';
const dbPort = parsed.output.DB_PORT ?? 5432;
const dbUser = parsed.output.DB_USER;
const dbPassword = parsed.output.DB_PASSWORD ?? '';
const dbName = parsed.output.DB_NAME;

export const env = {
  PORT: parsed.output.PORT ?? 3000,
  HOST: parsed.output.HOST ?? '0.0.0.0',
  DB_HOST: dbHost,
  DB_PORT: dbPort,
  DB_USER: dbUser,
  DB_PASSWORD: dbPassword,
  DB_NAME: dbName,
  DATABASE_URL: buildDatabaseUrl({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    name: dbName,
  }),
};
