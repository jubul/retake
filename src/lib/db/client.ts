import { createClient, type Client } from '@libsql/client';
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import { getEnv } from '@/lib/env';
import * as schema from './schema';

export type Db = LibSQLDatabase<typeof schema>;

/** Crea un cliente nuevo. Usado por getDb(), scripts y tests (url ':memory:'). */
export function createDb(url: string, authToken?: string): { db: Db; client: Client } {
  const client = createClient({ url, authToken });
  const db = drizzle(client, { schema });
  return { db, client };
}

declare global {
  // singleton que sobrevive al HMR de next dev
  var __retakeDb: Db | undefined;
}

/** Singleton del proceso (lazy: no toca env al importar). */
export function getDb(): Db {
  if (!globalThis.__retakeDb) {
    const env = getEnv();
    globalThis.__retakeDb = createDb(env.DATABASE_URL, env.DATABASE_AUTH_TOKEN).db;
  }
  return globalThis.__retakeDb;
}
