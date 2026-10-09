import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    env: {
      DATABASE_URL: ':memory:',
      ADMIN_PASSWORD: 'test-password',
      SESSION_SECRET: 'test-secret-test-secret-test-secret-1234',
      UPLOADS_DIR: 'data/uploads-test',
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
      NEXT_PUBLIC_WHATSAPP_NUMBER: '5491100000000',
      NEXT_PUBLIC_INSTAGRAM: 'retake.ar',
    },
  },
});
