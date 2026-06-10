/** Exemples documentés pour Swagger UI (évite les placeholders `string` / `0`). */

export const gameExample = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  name: 'Summer Clover',
  tags: '3dcg,animated,male protagonist',
  image: 'https://cdn.example/f95/summer-clover.jpg',
  createdAt: '2024-06-15T10:30:00.000Z',
  updatedAt: '2025-01-20T14:00:00.000Z',
  description: null,
  descriptionFr: 'Jeu de simulation avec traduction communautaire.',
  website: 'f95z',
  threadId: 123456,
  link: 'https://f95zone.to/threads/123456/',
  gameAutoCheck: true,
  gameVersion: '1.2.0',
} as const;

export const translationExample = {
  id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  gameId: gameExample.id,
  translationName: 'Patch FR v1.2',
  version: '1.2.0',
  status: 'completed',
  tversion: '1.2.0',
  tlink: 'https://example.com/patch-fr.zip',
  tname: 'Traduction communautaire',
  translatorId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
  translatorAlertsEnabled: true,
  proofreaderId: null,
  ttype: 'patch',
  gameType: 'renpy',
  ac: false,
  createdAt: '2024-08-01T12:00:00.000Z',
  updatedAt: '2025-01-18T09:15:00.000Z',
} as const;

export const translatorExample = {
  id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
  name: 'TraducteurExemple',
  discordId: '123456789012345678',
  pages: 'https://example.com/traducteur',
  tradCount: 12,
  readCount: 3,
  createdAt: '2023-01-10T08:00:00.000Z',
  updatedAt: '2025-02-01T16:30:00.000Z',
} as const;

export const updateSlimExample = {
  updateId: 'd4e5f6a7-b8c9-0123-def0-234567890123',
  updateStatus: 'update',
  updateCreatedAt: '2025-03-01T11:00:00.000Z',
  updateUpdatedAt: '2025-03-01T11:00:00.000Z',
  gameId: gameExample.id,
} as const;

export const embeddedGameExample = {
  id: gameExample.id,
  name: gameExample.name,
  image: gameExample.image,
  link: gameExample.link,
  website: gameExample.website,
  threadId: gameExample.threadId,
  gameVersion: gameExample.gameVersion,
  type: 'renpy',
  engineTypes: ['renpy'],
  tags: gameExample.tags,
} as const;

export const apiErrorExample = {
  error: 'Jeu introuvable.',
} as const;

export const healthOkExample = {
  status: 'ok',
  database: 'up',
  timestamp: '2025-06-10T13:35:22.425Z',
} as const;

export const healthUnavailableExample = {
  status: 'error',
  database: 'down',
} as const;
