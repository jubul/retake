import { defineConfig } from 'drizzle-kit';

const url = process.env.DATABASE_URL ?? 'file:./data/retake.db';
const remote = url.startsWith('libsql://');

export default defineConfig({
  dialect: remote ? 'turso' : 'sqlite',
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dbCredentials: remote ? { url, authToken: process.env.DATABASE_AUTH_TOKEN } : { url },
  strict: true,
  verbose: true,
});
