import { and, eq, isNotNull, ne, sql } from 'drizzle-orm';

import type { Database } from '../db/index.js';
import { apiLog, user } from '../db/schema.js';

const MANY_IPS_THRESHOLD = 10;

function toIsoString(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return new Date(value).toISOString();
}

export type UserIpEntry = {
  ip: string;
  use: number;
  start: string;
  end: string;
};

export type UserIpAggregate = {
  idUser: string;
  NomUser: string;
  manyIps: boolean;
  ips: UserIpEntry[];
};

export async function listUserIpAggregates(db: Database): Promise<UserIpAggregate[]> {
  const rows = await db
    .select({
      idUser: user.id,
      nomUser: user.username,
      ip: apiLog.ipAddress,
      use: sql<number>`cast(count(*) as signed)`.as('use'),
      start: sql<string>`min(${apiLog.createdAt})`.as('start'),
      end: sql<string>`max(${apiLog.createdAt})`.as('end'),
    })
    .from(apiLog)
    .innerJoin(user, eq(apiLog.userId, user.id))
    .where(and(isNotNull(apiLog.ipAddress), ne(apiLog.ipAddress, '')))
    .groupBy(user.id, user.username, apiLog.ipAddress);

  const byUser = new Map<string, UserIpAggregate>();

  for (const row of rows) {
    if (!row.ip) continue;

    let aggregate = byUser.get(row.idUser);
    if (!aggregate) {
      aggregate = {
        idUser: row.idUser,
        NomUser: row.nomUser,
        manyIps: false,
        ips: [],
      };
      byUser.set(row.idUser, aggregate);
    }

    aggregate.ips.push({
      ip: row.ip,
      use: Number(row.use),
      start: toIsoString(row.start),
      end: toIsoString(row.end),
    });
  }

  const result = Array.from(byUser.values());
  for (const aggregate of result) {
    aggregate.ips.sort((a, b) => a.ip.localeCompare(b.ip));
    aggregate.manyIps = aggregate.ips.length > MANY_IPS_THRESHOLD;
  }

  result.sort((a, b) => a.NomUser.localeCompare(b.NomUser, 'fr'));
  return result;
}
