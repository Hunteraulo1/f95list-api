import { toJsonSchema } from '@valibot/to-json-schema';
import type { FastifySchema } from 'fastify';
import type { BaseIssue, BaseSchema, InferInput, InferOutput } from 'valibot';
import * as v from 'valibot';

type SyncSchema = BaseSchema<unknown, unknown, BaseIssue<unknown>>;

export function toOpenApiSchema<T extends SyncSchema>(schema: T) {
  return toJsonSchema(schema, { target: 'openapi-3.0' });
}

export interface ValibotRouteSchema<
  TBody extends SyncSchema | undefined = undefined,
  TQuery extends SyncSchema | undefined = undefined,
  TParams extends SyncSchema | undefined = undefined,
  THeaders extends SyncSchema | undefined = undefined,
  TResponse extends Record<number, SyncSchema> | undefined = undefined,
> {
  body?: TBody;
  querystring?: TQuery;
  params?: TParams;
  headers?: THeaders;
  response?: TResponse;
}

export function buildRouteSchema<
  TBody extends SyncSchema | undefined = undefined,
  TQuery extends SyncSchema | undefined = undefined,
  TParams extends SyncSchema | undefined = undefined,
  THeaders extends SyncSchema | undefined = undefined,
  TResponse extends Record<number, SyncSchema> | undefined = undefined,
>(schema: ValibotRouteSchema<TBody, TQuery, TParams, THeaders, TResponse>): FastifySchema {
  const result: FastifySchema = {};

  if (schema.body) {
    result.body = toOpenApiSchema(schema.body);
  }
  if (schema.querystring) {
    result.querystring = toOpenApiSchema(schema.querystring);
  }
  if (schema.params) {
    result.params = toOpenApiSchema(schema.params);
  }
  if (schema.headers) {
    result.headers = toOpenApiSchema(schema.headers);
  }
  if (schema.response) {
    result.response = Object.fromEntries(
      Object.entries(schema.response).map(([status, responseSchema]) => [
        status,
        toOpenApiSchema(responseSchema),
      ]),
    );
  }

  return result;
}

export function validateWithValibot<T extends SyncSchema>(
  schema: T,
  value: unknown,
): InferOutput<T> {
  return v.parse(schema, value);
}

export function safeValidateWithValibot<T extends SyncSchema>(schema: T, value: unknown) {
  return v.safeParse(schema, value);
}

export type InferBody<T extends ValibotRouteSchema> = T['body'] extends SyncSchema
  ? InferInput<T['body']>
  : never;

export type InferQuery<T extends ValibotRouteSchema> = T['querystring'] extends SyncSchema
  ? InferInput<T['querystring']>
  : never;

export type InferParams<T extends ValibotRouteSchema> = T['params'] extends SyncSchema
  ? InferInput<T['params']>
  : never;

export { v };
