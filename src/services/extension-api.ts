import { desc, eq, inArray } from 'drizzle-orm';

import type { Database } from '../db/index.js';
import { game, gameTranslation, translator, update as updateTable } from '../db/schema.js';
import { translatorReadCountExpr, translatorTradCountExpr } from './translator-activity-counts.js';

type Domain = 'F95z' | 'LewdCorner' | 'Autre' | 'Unknown';
type Hostname = 'f95zone.to' | 'lewdcorner.com' | null;
type TName = 'Traduction' | 'Traduction (mod inclus)' | 'Intégrée' | 'Pas de traduction';
type Status = 'EN COURS' | 'TERMINÉ' | 'ABANDONNÉ';
type GameType =
  | 'RenPy'
  | 'RPGM'
  | 'Unity'
  | 'Unreal'
  | 'Flash'
  | 'HTML'
  | 'QSP'
  | 'Autre'
  | 'RenPy/RPGM'
  | 'RenPy/Unity';
type TType =
  | 'Traduction Humaine'
  | 'Traduction Automatique'
  | 'Traduction Semi-Automatique'
  | 'VO Française'
  | 'À tester'
  | 'Lien Trad HS';
type UpdateType = 'AJOUT DE JEU' | 'MISE À JOUR';

const mapDomain = (website: string | null | undefined): Domain => {
  switch ((website ?? '').trim().toLowerCase()) {
    case 'f95z':
      return 'F95z';
    case 'lc':
      return 'LewdCorner';
    case 'other':
      return 'Autre';
    default:
      return 'Unknown';
  }
};

const mapHostname = (website: string | null | undefined): Hostname => {
  switch ((website ?? '').trim().toLowerCase()) {
    case 'f95z':
      return 'f95zone.to';
    case 'lc':
      return 'lewdcorner.com';
    default:
      return null;
  }
};

const mapTName = (v: string | null | undefined): TName => {
  switch ((v ?? '').trim().toLowerCase()) {
    case 'translation_with_mods':
      return 'Traduction (mod inclus)';
    case 'integrated':
      return 'Intégrée';
    case 'no_translation':
      return 'Pas de traduction';
    default:
      return 'Traduction';
  }
};

const mapStatus = (v: string | null | undefined): Status => {
  switch ((v ?? '').trim().toLowerCase()) {
    case 'completed':
      return 'TERMINÉ';
    case 'abandoned':
      return 'ABANDONNÉ';
    default:
      return 'EN COURS';
  }
};

const mapType = (v: string | null | undefined): GameType => {
  switch ((v ?? '').trim().toLowerCase()) {
    case 'renpy':
      return 'RenPy';
    case 'rpgm':
      return 'RPGM';
    case 'unity':
      return 'Unity';
    case 'unreal':
      return 'Unreal';
    case 'flash':
      return 'Flash';
    case 'html':
      return 'HTML';
    case 'qsp':
      return 'QSP';
    case 'renpy/rpgm':
      return 'RenPy/RPGM';
    case 'renpy/unity':
      return 'RenPy/Unity';
    default:
      return 'Autre';
  }
};

const mapTType = (v: string | null | undefined): TType => {
  switch ((v ?? '').trim().toLowerCase()) {
    case 'manual':
      return 'Traduction Humaine';
    case 'auto':
      return 'Traduction Automatique';
    case 'semi-auto':
      return 'Traduction Semi-Automatique';
    case 'vf':
      return 'VO Française';
    case 'to_tested':
      return 'À tester';
    default:
      return 'Lien Trad HS';
  }
};

const splitTags = (raw: string | null | undefined): string[] =>
  (raw ?? '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

type ParsedPage = { title: string; link: string };

const parsePages = (raw: string | null | undefined): ParsedPage[] => {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((p) => {
        if (!p || typeof p !== 'object') return null;
        const obj = p as Record<string, unknown>;
        const title =
          (typeof obj.title === 'string' && obj.title.trim()) ||
          (typeof obj.name === 'string' && obj.name.trim()) ||
          (typeof obj.label === 'string' && obj.label.trim()) ||
          '';
        const link = (typeof obj.link === 'string' && obj.link.trim()) || '';
        if (!title && !link) return null;
        return { title: title || link, link };
      })
      .filter((v): v is ParsedPage => v !== null);
  } catch {
    return [];
  }
};

const firstPageLink = (raw: string | null | undefined): string | null => {
  const first = parsePages(raw)[0];
  return first?.link?.trim() ? first.link.trim() : null;
};

const mapUpdateType = (v: string | null | undefined): UpdateType =>
  (v ?? '').trim().toLowerCase() === 'adding' ? 'AJOUT DE JEU' : 'MISE À JOUR';

export async function buildExtensionApiPayload(db: Database, gameId?: string) {
  const baseQuery = db
    .select({
      game: {
        id: game.id,
        name: game.name,
        description: game.description,
        descriptionFr: game.descriptionFr,
        website: game.website,
        threadId: game.threadId,
        link: game.link,
        tags: game.tags,
        image: game.image,
        gameVersion: game.gameVersion,
      },
      translation: {
        id: gameTranslation.id,
        version: gameTranslation.version,
        status: gameTranslation.status,
        tversion: gameTranslation.tversion,
        tlink: gameTranslation.tlink,
        tname: gameTranslation.tname,
        translationName: gameTranslation.translationName,
        translatorId: gameTranslation.translatorId,
        proofreaderId: gameTranslation.proofreaderId,
        ttype: gameTranslation.ttype,
        gameType: gameTranslation.gameType,
        ac: gameTranslation.ac,
      },
    })
    .from(gameTranslation)
    .innerJoin(game, eq(gameTranslation.gameId, game.id));

  const rows = gameId
    ? await baseQuery
        .where(eq(gameTranslation.gameId, gameId))
        .orderBy(desc(gameTranslation.updatedAt))
    : await baseQuery.orderBy(desc(gameTranslation.updatedAt));

  const translatorIds = Array.from(
    new Set(
      rows.flatMap((row) =>
        [row.translation.translatorId, row.translation.proofreaderId].filter((id): id is string =>
          Boolean(id),
        ),
      ),
    ),
  );

  const translatorRows =
    translatorIds.length > 0
      ? await db
          .select({
            id: translator.id,
            name: translator.name,
            pages: translator.pages,
          })
          .from(translator)
          .where(inArray(translator.id, translatorIds))
      : [];

  const translatorById = new Map(translatorRows.map((tr) => [tr.id, tr]));

  const games = rows
    .filter((row) => (row.translation.tname ?? '').trim().toLowerCase() !== 'no_translation')
    .map((row) => {
      const tr = row.translation.translatorId
        ? translatorById.get(row.translation.translatorId)
        : null;
      const pr = row.translation.proofreaderId
        ? translatorById.get(row.translation.proofreaderId)
        : null;
      return {
        id: row.translation.id,
        gameId: row.game.id,
        threadId: row.game.threadId ?? null,
        domain: mapDomain(row.game.website),
        hostname: mapHostname(row.game.website),
        name: row.translation.translationName
          ? `${row.game.name} - ${row.translation.translationName}`
          : row.game.name,
        version: row.translation.version ?? row.game.gameVersion ?? null,
        tversion: row.translation.tversion,
        tname: mapTName(row.translation.tname),
        description: row.game.descriptionFr ?? row.game.description ?? null,
        status: mapStatus(row.translation.status),
        tags: splitTags(row.game.tags),
        type: mapType(row.translation.gameType),
        traductor: tr?.name ?? null,
        proofreader: pr?.name ?? null,
        ttype: mapTType(row.translation.ttype),
        ac: Boolean(row.translation.ac),
        link: row.game.link,
        tlink: row.translation.tlink?.trim() ? row.translation.tlink : null,
        trlink: firstPageLink(tr?.pages),
        prlink: firstPageLink(pr?.pages),
        image: row.game.image?.trim() ? row.game.image : null,
      };
    });

  const updateRows = await db
    .select({
      date: updateTable.createdAt,
      type: updateTable.status,
      gameId: updateTable.gameId,
    })
    .from(updateTable)
    .orderBy(desc(updateTable.createdAt))
    .limit(200);

  const updates = updateRows.map((u) => ({
    date: u.date,
    type: mapUpdateType(u.type),
    gameId: u.gameId,
  }));

  const traductorsRows = await db
    .select({
      id: translator.id,
      name: translator.name,
      pages: translator.pages,
      discordId: translator.discordId,
      tradCount: translatorTradCountExpr().as('tradCount'),
      readCount: translatorReadCountExpr().as('readCount'),
    })
    .from(translator)
    .orderBy(translator.name);

  const traductors = traductorsRows.map((t) => ({
    id: t.id,
    name: t.name,
    pages: parsePages(t.pages),
    discordId: t.discordId ? Number.parseInt(t.discordId, 10) || null : null,
    tradCount: t.tradCount ?? 0,
    readCount: t.readCount ?? 0,
    score: (t.tradCount ?? 0) + (t.readCount ?? 0),
  }));

  return { games, updates, traductors };
}
