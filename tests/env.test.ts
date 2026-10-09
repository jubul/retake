import { afterEach, describe, expect, it, vi } from 'vitest';

describe('getEnv', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('parsea el env de vitest', async () => {
    const { getEnv } = await import('@/lib/env');
    expect(getEnv().UPLOADS_DIR).toBe('data/uploads-test');
  });

  it('lanza si SESSION_SECRET es corto', async () => {
    vi.stubEnv('SESSION_SECRET', 'corto');
    vi.resetModules();
    const { getEnv } = await import('@/lib/env');
    expect(() => getEnv()).toThrow(/SESSION_SECRET/);
  });
});
