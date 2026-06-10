/** Schémas JSON partagés (enregistrés via `fastify.addSchema`). */

import {
  apiErrorExample,
  embeddedGameExample,
  gameExample,
  healthOkExample,
  healthUnavailableExample,
  translationExample,
  translatorExample,
  updateSlimExample,
} from './examples.js';

const timestamp = {
  type: 'string',
  format: 'date-time',
} as const;

const nullableString = {
  type: 'string',
  nullable: true,
} as const;

const nullableInteger = {
  type: 'integer',
  nullable: true,
} as const;

export const openApiEntitySchemas = [
  {
    $id: 'ApiError',
    description: 'Erreur API (`application/json`).',
    type: 'object',
    required: ['error'],
    properties: {
      error: { type: 'string', description: 'Message d’erreur lisible.' },
    },
    example: apiErrorExample,
  },
  {
    $id: 'HealthOk',
    description: 'Sonde opérationnelle.',
    type: 'object',
    required: ['status', 'database', 'timestamp'],
    properties: {
      status: { type: 'string', enum: ['ok'] },
      database: { type: 'string', enum: ['up'] },
      timestamp,
    },
    example: healthOkExample,
  },
  {
    $id: 'HealthUnavailable',
    description: 'Base de données inaccessible.',
    type: 'object',
    required: ['status', 'database'],
    properties: {
      status: { type: 'string', enum: ['error'] },
      database: { type: 'string', enum: ['down'] },
    },
    example: healthUnavailableExample,
  },
  {
    $id: 'Translation',
    description: 'Traduction publique d’un jeu.',
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      gameId: { type: 'string', format: 'uuid' },
      translationName: nullableString,
      version: nullableString,
      status: { type: 'string' },
      tversion: { type: 'string' },
      tlink: { type: 'string' },
      tname: { type: 'string' },
      translatorId: nullableString,
      translatorAlertsEnabled: { type: 'boolean' },
      proofreaderId: nullableString,
      ttype: { type: 'string' },
      gameType: { type: 'string' },
      ac: { type: 'boolean' },
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    example: translationExample,
  },
  {
    $id: 'Game',
    description: 'Jeu tel que stocké en base.',
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: { type: 'string' },
      tags: { type: 'string' },
      image: { type: 'string' },
      createdAt: timestamp,
      updatedAt: timestamp,
      description: nullableString,
      descriptionFr: nullableString,
      website: { type: 'string' },
      threadId: nullableInteger,
      link: { type: 'string' },
      gameAutoCheck: { type: 'boolean' },
      gameVersion: nullableString,
    },
    example: gameExample,
  },
  {
    $id: 'GameWithTranslations',
    description: 'Jeu avec ses traductions (`include=translations`).',
    allOf: [
      { $ref: 'Game#' },
      {
        type: 'object',
        required: ['translations'],
        properties: {
          translations: {
            type: 'array',
            items: { $ref: 'Translation#' },
          },
        },
      },
    ],
    example: { ...gameExample, translations: [translationExample] },
  },
  {
    $id: 'TranslatorPublic',
    description: 'Projection publique d’un traducteur (sans `userId`).',
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: { type: 'string' },
      discordId: nullableString,
      pages: { type: 'string' },
      tradCount: { type: 'integer', minimum: 0 },
      readCount: { type: 'integer', minimum: 0 },
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    example: translatorExample,
  },
  {
    $id: 'UpdateSlim',
    description: 'Mise à jour sans inclusion (`game` absent).',
    type: 'object',
    properties: {
      updateId: { type: 'string', format: 'uuid' },
      updateStatus: { type: 'string' },
      updateCreatedAt: timestamp,
      updateUpdatedAt: timestamp,
      gameId: { type: 'string', format: 'uuid' },
    },
    example: updateSlimExample,
  },
  {
    $id: 'EmbeddedGame',
    description: 'Jeu enrichi embarqué dans une mise à jour (`include=game`).',
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: { type: 'string' },
      image: { type: 'string' },
      link: { type: 'string' },
      website: { type: 'string' },
      threadId: nullableInteger,
      gameVersion: nullableString,
      type: { type: 'string', description: 'Premier moteur de `engineTypes`, ou `other`.' },
      engineTypes: {
        type: 'array',
        items: { type: 'string' },
      },
      tags: { type: 'string' },
    },
    example: embeddedGameExample,
  },
  {
    $id: 'GameMinimalWithTranslations',
    description: 'Jeu minimal avec traductions (`include=translations` sans `game`).',
    type: 'object',
    required: ['id', 'translations'],
    properties: {
      id: { type: 'string', format: 'uuid' },
      translations: {
        type: 'array',
        items: { $ref: 'Translation#' },
      },
    },
    example: { id: gameExample.id, translations: [translationExample] },
  },
  {
    $id: 'EmbeddedGameWithTranslations',
    description: 'Jeu enrichi avec traductions (`include=game,translations`).',
    allOf: [
      { $ref: 'EmbeddedGame#' },
      {
        type: 'object',
        required: ['translations'],
        properties: {
          translations: {
            type: 'array',
            items: { $ref: 'Translation#' },
          },
        },
      },
    ],
    example: { ...embeddedGameExample, translations: [translationExample] },
  },
  {
    $id: 'UpdateWithEmbeddedGame',
    description: 'Mise à jour avec jeu enrichi (`include=game`).',
    allOf: [
      { $ref: 'UpdateSlim#' },
      {
        type: 'object',
        required: ['game'],
        properties: {
          game: { $ref: 'EmbeddedGame#' },
        },
      },
    ],
    example: { ...updateSlimExample, game: embeddedGameExample },
  },
  {
    $id: 'UpdateWithGameTranslations',
    description: 'Mise à jour avec jeu minimal et traductions (`include=translations`).',
    allOf: [
      { $ref: 'UpdateSlim#' },
      {
        type: 'object',
        required: ['game'],
        properties: {
          game: { $ref: 'GameMinimalWithTranslations#' },
        },
      },
    ],
    example: {
      ...updateSlimExample,
      game: { id: gameExample.id, translations: [translationExample] },
    },
  },
  {
    $id: 'UpdateWithFullGame',
    description: 'Mise à jour avec jeu enrichi et traductions (`include=game,translations`).',
    allOf: [
      { $ref: 'UpdateSlim#' },
      {
        type: 'object',
        required: ['game'],
        properties: {
          game: { $ref: 'EmbeddedGameWithTranslations#' },
        },
      },
    ],
    example: {
      ...updateSlimExample,
      game: { ...embeddedGameExample, translations: [translationExample] },
    },
  },
] as const;
