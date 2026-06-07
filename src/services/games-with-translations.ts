import { inArray } from 'drizzle-orm';

import type { Database } from '../db/index.js';
import { gameTranslation } from '../db/schema.js';
import { type GameTranslationRow, mapTranslationsForPublicApi } from './translation-public.js';

export async function translationsByGameIds(
  db: Database,
  gameIds: string[],
  options?: { skipPublicApiMapping?: boolean },
): Promise<Map<string, GameTranslationRow[]>> {
  const map = new Map<string, GameTranslationRow[]>();
  for (const id of gameIds) map.set(id, []);
  if (gameIds.length === 0) return map;

  const rows = await db
    .select()
    .from(gameTranslation)
    .where(inArray(gameTranslation.gameId, gameIds));

  for (const row of rows) {
    const list = map.get(row.gameId);
    if (list) list.push(row);
  }

  for (const list of map.values()) {
    list.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  if (!options?.skipPublicApiMapping) {
    const allRows = Array.from(map.values()).flat();
    const mapped = await mapTranslationsForPublicApi(db, allRows);
    const mappedById = new Map(mapped.map((row) => [row.id, row]));
    for (const [gameId, list] of map) {
      map.set(
        gameId,
        list.map((row) => mappedById.get(row.id) ?? row),
      );
    }
  }

  return map;
}
