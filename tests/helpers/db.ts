import { createDb, type Db } from '@/lib/db/client';
import { runMigrations } from '@/lib/db/migrate';

export async function testDb(): Promise<Db> {
  const { db } = createDb(':memory:');
  await runMigrations(db);
  return db;
}
