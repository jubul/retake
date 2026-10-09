import path from 'node:path';
import { migrate } from 'drizzle-orm/libsql/migrator';
import type { Db } from './client';

export const MIGRATIONS_FOLDER = path.join(process.cwd(), 'drizzle');

/** Aplica las migraciones de ./drizzle (idempotente). */
export async function runMigrations(db: Db, migrationsFolder: string = MIGRATIONS_FOLDER): Promise<void> {
  await migrate(db, { migrationsFolder });
}
