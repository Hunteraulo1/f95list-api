/** Propriétés OpenAPI avec `description` (évite le `[...]` de Swagger UI). */

export const prop = {
  uuid: (description: string) => ({ type: 'string', format: 'uuid', description }) as const,

  string: (description: string) => ({ type: 'string', description }) as const,

  nullableString: (description: string) =>
    ({ type: 'string', nullable: true, description }) as const,

  nullableInteger: (description: string) =>
    ({ type: 'integer', nullable: true, description }) as const,

  boolean: (description: string) => ({ type: 'boolean', description }) as const,

  integer: (description: string, minimum?: number) =>
    ({
      type: 'integer',
      description,
      ...(minimum !== undefined ? { minimum } : {}),
    }) as const,

  timestamp: (description: string) =>
    ({ type: 'string', format: 'date-time', description }) as const,

  stringArray: (description: string) =>
    ({
      type: 'array',
      description,
      items: { type: 'string' },
    }) as const,

  enumString: (description: string, values: readonly string[]) =>
    ({
      type: 'string',
      description,
      enum: values,
    }) as const,
};
