import fs from 'node:fs';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { GET } from '@/app/uploads/[...path]/route';
import { getStorage } from '@/lib/storage';

const uploadsRoot = path.resolve(process.cwd(), process.env.UPLOADS_DIR ?? 'data/uploads-test');

function call(...segments: string[]) {
  return GET(new Request(`http://x/uploads/${segments.join('/')}`), {
    params: Promise.resolve({ path: segments }),
  });
}

afterAll(() => {
  fs.rmSync(uploadsRoot, { recursive: true, force: true });
});

describe('GET /uploads/[...path]', () => {
  it('sirve un webp con headers inmutables', async () => {
    const data = Buffer.from('fake-webp-bytes');
    await getStorage().put('a/b.webp', data, 'image/webp');
    const res = await call('a', 'b.webp');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('image/webp');
    expect(res.headers.get('content-length')).toBe(String(data.length));
    expect(res.headers.get('cache-control')).toContain('immutable');
    expect(res.headers.get('cache-control')).toContain('max-age=31536000');
    expect(Buffer.from(await res.arrayBuffer()).equals(data)).toBe(true);
  });

  it('traversal → 400', async () => {
    expect((await call('..', 'x.webp')).status).toBe(400);
  });

  it('extensión no permitida → 400', async () => {
    expect((await call('a', 'b.gif')).status).toBe(400);
  });

  it('inexistente → 404', async () => {
    expect((await call('a', 'no-existe.webp')).status).toBe(404);
  });
});
