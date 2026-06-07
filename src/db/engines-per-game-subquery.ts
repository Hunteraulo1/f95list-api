import { sql } from 'drizzle-orm';

import { db } from './index.js';
import * as table from './schema.js';

/** Tous les moteurs distincts (`game_type`) par jeu, agrégés depuis les traductions. */
export function enginesPerGameSubquery() {
  return db
    .select({
      gameId: table.gameTranslation.gameId,
      engineTypes: sql<string[]>`array_agg(distinct ${table.gameTranslation.gameType})`.as(
        'engine_types',
      ),
    })
    .from(table.gameTranslation)
    .groupBy(table.gameTranslation.gameId)
    .as('engines_per_game');
}
