import { sql, type SQL } from 'drizzle-orm';

import * as table from '../db/schema.js';

export function translatorTradCountExpr(): SQL<number> {
  return sql<number>`coalesce((
    select count(*)
    from ${table.gameTranslation}
    where ${table.gameTranslation.translatorId} = ${table.translator.id}
  ), 0)`;
}

export function translatorReadCountExpr(): SQL<number> {
  return sql<number>`coalesce((
    select count(*)
    from ${table.gameTranslation}
    where ${table.gameTranslation.proofreaderId} = ${table.translator.id}
  ), 0)`;
}
