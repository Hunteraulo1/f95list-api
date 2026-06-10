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
import { prop } from './property-schemas.js';

export const openApiEntitySchemas = [
  {
    $id: 'ApiError',
    description: 'Erreur API (`application/json`).',
    type: 'object',
    required: ['error'],
    properties: {
      error: prop.string('Message d’erreur lisible.'),
    },
    example: apiErrorExample,
  },
  {
    $id: 'HealthOk',
    description: 'Sonde opérationnelle.',
    type: 'object',
    required: ['status', 'database', 'timestamp'],
    properties: {
      status: prop.enumString('État global de l’application.', ['ok']),
      database: prop.enumString('État de la connexion PostgreSQL.', ['up']),
      timestamp: prop.timestamp('Horodatage ISO 8601 de la sonde.'),
    },
    example: healthOkExample,
  },
  {
    $id: 'HealthUnavailable',
    description: 'Base de données inaccessible.',
    type: 'object',
    required: ['status', 'database'],
    properties: {
      status: prop.enumString('État global de l’application.', ['error']),
      database: prop.enumString('État de la connexion PostgreSQL.', ['down']),
    },
    example: healthUnavailableExample,
  },
  {
    $id: 'Translation',
    description: 'Traduction publique d’un jeu.',
    type: 'object',
    properties: {
      id: prop.uuid('Identifiant UUID de la traduction.'),
      gameId: prop.uuid('Identifiant UUID du jeu parent.'),
      translationName: prop.nullableString('Nom affiché de la traduction, si renseigné.'),
      version: prop.nullableString(
        'Version effective de la traduction (peut être dérivée de la version du jeu).',
      ),
      status: prop.string('Statut en base (ex. `in_progress`, `completed`).'),
      tversion: prop.string('Version du jeu ciblée par la traduction.'),
      tlink: prop.string('Lien vers le patch ou l’archive de traduction.'),
      tname: prop.string('Libellé court du type de traduction (ex. `no_translation`).'),
      translatorId: prop.nullableString('UUID du traducteur assigné, ou `null`.'),
      translatorAlertsEnabled: prop.boolean('Alertes activées pour le traducteur.'),
      proofreaderId: prop.nullableString('UUID du relecteur assigné, ou `null`.'),
      ttype: prop.string('Type de livrable (ex. `patch`, `integrated`).'),
      gameType: prop.string('Moteur du jeu pour cette traduction (ex. `renpy`, `unity`).'),
      ac: prop.boolean('Traduction marquée AC (adult content) en base.'),
      createdAt: prop.timestamp('Date de création de l’entrée.'),
      updatedAt: prop.timestamp('Date de dernière modification.'),
    },
    example: translationExample,
  },
  {
    $id: 'Game',
    description: 'Jeu tel que stocké en base.',
    type: 'object',
    properties: {
      id: prop.uuid('Identifiant UUID du jeu.'),
      name: prop.string('Titre du jeu.'),
      tags: prop.string('Étiquettes sérialisées (souvent séparées par des virgules).'),
      image: prop.string('URL de l’image de couverture.'),
      createdAt: prop.timestamp('Date d’ajout du jeu.'),
      updatedAt: prop.timestamp('Date de dernière modification.'),
      description: prop.nullableString('Description originale, ou `null`.'),
      descriptionFr: prop.nullableString('Description en français, ou `null`.'),
      website: prop.string('Code site d’origine (ex. `f95z`, `lc`).'),
      threadId: prop.nullableInteger('Identifiant du fil sur le forum source, ou `null`.'),
      link: prop.string('URL du fil ou de la fiche du jeu.'),
      gameAutoCheck: prop.boolean('Suivi automatique des mises à jour activé.'),
      gameVersion: prop.nullableString('Version actuelle du jeu, ou `null`.'),
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
            description: 'Traductions du jeu, triées par `updatedAt` décroissant.',
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
      id: prop.uuid('Identifiant UUID du profil traducteur.'),
      name: prop.string('Nom public du traducteur.'),
      discordId: prop.nullableString('Identifiant Discord, ou `null`.'),
      pages: prop.string('Liens ou pages associées au profil (texte libre).'),
      tradCount: prop.integer('Nombre de traductions actives.', 0),
      readCount: prop.integer('Nombre de relectures actives.', 0),
      createdAt: prop.timestamp('Date de création du profil.'),
      updatedAt: prop.timestamp('Date de dernière modification.'),
    },
    example: translatorExample,
  },
  {
    $id: 'UpdateSlim',
    description: 'Mise à jour sans inclusion (`game` absent).',
    type: 'object',
    properties: {
      updateId: prop.uuid('Identifiant UUID de l’entrée `update`.'),
      updateStatus: prop.string('Type d’événement : `adding` (ajout) ou `update` (mise à jour).'),
      updateCreatedAt: prop.timestamp('Date de création de l’entrée.'),
      updateUpdatedAt: prop.timestamp('Date de dernière modification.'),
      gameId: prop.uuid('Identifiant UUID du jeu concerné.'),
    },
    example: updateSlimExample,
  },
  {
    $id: 'EmbeddedGame',
    description: 'Jeu enrichi embarqué dans une mise à jour (`include=game`).',
    type: 'object',
    properties: {
      id: prop.uuid('Identifiant UUID du jeu.'),
      name: prop.string('Titre du jeu.'),
      image: prop.string('URL de l’image de couverture.'),
      link: prop.string('URL du fil ou de la fiche.'),
      website: prop.string('Code site d’origine.'),
      threadId: prop.nullableInteger('Identifiant du fil source, ou `null`.'),
      gameVersion: prop.nullableString('Version actuelle du jeu, ou `null`.'),
      type: prop.string('Premier moteur de `engineTypes`, ou `other` par défaut.'),
      engineTypes: prop.stringArray('Moteurs distincts agrégés depuis les traductions.'),
      tags: prop.string('Étiquettes du jeu.'),
    },
    example: embeddedGameExample,
  },
  {
    $id: 'GameMinimalWithTranslations',
    description: 'Jeu minimal avec traductions (`include=translations` sans `game`).',
    type: 'object',
    required: ['id', 'translations'],
    properties: {
      id: prop.uuid('Identifiant UUID du jeu.'),
      translations: {
        type: 'array',
        description: 'Traductions du jeu.',
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
            description: 'Traductions du jeu.',
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
          game: {
            description: 'Jeu enrichi (sans tableau `translations`).',
            $ref: 'EmbeddedGame#',
          },
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
          game: {
            description: 'Jeu minimal (`id` + `translations` uniquement).',
            $ref: 'GameMinimalWithTranslations#',
          },
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
          game: {
            description: 'Jeu enrichi avec ses traductions.',
            $ref: 'EmbeddedGameWithTranslations#',
          },
        },
      },
    ],
    example: {
      ...updateSlimExample,
      game: { ...embeddedGameExample, translations: [translationExample] },
    },
  },
] as const;
