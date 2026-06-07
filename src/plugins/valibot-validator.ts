import type { BaseIssue, BaseSchema } from 'valibot';
import { ValiError } from 'valibot';

import { safeValidateWithValibot } from '../lib/valibot.js';

type SyncSchema = BaseSchema<unknown, unknown, BaseIssue<unknown>>;

export interface ValibotSchemas {
  body?: SyncSchema;
  querystring?: SyncSchema;
  params?: SyncSchema;
  headers?: SyncSchema;
}

export function createValibotValidator(schemas: ValibotSchemas) {
  return async (request: { body: unknown; query: unknown; params: unknown; headers: unknown }) => {
    const fields = [
      ['body', schemas.body, request.body] as const,
      ['querystring', schemas.querystring, request.query] as const,
      ['params', schemas.params, request.params] as const,
      ['headers', schemas.headers, request.headers] as const,
    ];

    for (const [field, schema, value] of fields) {
      if (!schema) continue;

      const result = safeValidateWithValibot(schema, value);
      if (!result.success) {
        throw new ValiError(result.issues);
      }

      if (field === 'body') request.body = result.output;
      if (field === 'querystring') request.query = result.output;
      if (field === 'params') request.params = result.output;
      if (field === 'headers') request.headers = result.output;
    }
  };
}
