import { createDb } from '../src/lib/db/client';
import { runMigrations } from '../src/lib/db/migrate';
import { getEnv } from '../src/lib/env';

async function main(): Promise<void> {
  const env = getEnv();
  const { db, client } = createDb(env.DATABASE_URL, env.DATABASE_AUTH_TOKEN);
  try {
    await runMigrations(db);
    console.log('migrations applied');
  } finally {
    client.close();
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
