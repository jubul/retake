import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { afterAll, describe, expect, it } from 'vitest';
import { getStorage } from '@/lib/storage';
import { saveProductImage } from '@/lib/storage/upload';

const UPLOADS = path.resolve(process.cwd(), process.env.UPLOADS_DIR ?? 'data/uploads-test');
const PID = 'prodtest8upload';

async function pngFile(w: number, h: number, name = 'foto.png'): Promise<File> {
  const buf = await sharp({ create: { width: w, height: h, channels: 3, background: '#00ffd0' } })
    .png()
    .toBuffer();
  return new File([new Uint8Array(buf)], name, { type: 'image/png' });
}

afterAll(() => {
  fs.rmSync(path.join(UPLOADS, 'products', PID), { recursive: true, force: true });
  fs.rmSync(path.join(UPLOADS, 'products', `${PID}bad`), { recursive: true, force: true });
});

describe('saveProductImage', () => {
  it('devuelve keys products/<pid>/<id>.webp y -thumb.webp existentes en UPLOADS_DIR', async () => {
    const res = await saveProductImage(PID, await pngFile(2000, 1000), 'alt de prueba');
    expect(res.path).toMatch(new RegExp(`^products/${PID}/[a-z0-9]+\\.webp$`));
    expect(res.thumbPath).toMatch(new RegExp(`^products/${PID}/[a-z0-9]+-thumb\\.webp$`));
    expect(res.thumbPath).toBe(res.path.replace(/\.webp$/, '-thumb.webp'));
    expect(fs.existsSync(path.join(UPLOADS, res.path))).toBe(true);
    expect(fs.existsSync(path.join(UPLOADS, res.thumbPath))).toBe(true);
    expect(res.alt).toBe('alt de prueba');
    expect([res.width, res.height]).toEqual([1600, 800]);
  });

  it('los archivos guardados son webp válidos con el tamaño correcto', async () => {
    const res = await saveProductImage(PID, await pngFile(1000, 500), '');
    const main = await sharp(path.join(UPLOADS, res.path)).metadata();
    const thumb = await sharp(path.join(UPLOADS, res.thumbPath)).metadata();
    expect(main.format).toBe('webp');
    expect(thumb.format).toBe('webp');
    expect([main.width, main.height]).toEqual([1000, 500]);
    expect([thumb.width, thumb.height]).toEqual([480, 240]);
  });

  it('se pueden leer vía getStorage() con content-type image/webp', async () => {
    const res = await saveProductImage(PID, await pngFile(100, 100), '');
    const obj = await getStorage().get(res.path);
    expect(obj?.contentType).toBe('image/webp');
    expect(obj?.body.length).toBeGreaterThan(0);
  });

  it('dos subidas generan keys distintas', async () => {
    const a = await saveProductImage(PID, await pngFile(50, 50), '');
    const b = await saveProductImage(PID, await pngFile(50, 50), '');
    expect(a.path).not.toBe(b.path);
  });

  it('un archivo que no es imagen rechaza y no deja archivos', async () => {
    const pid = `${PID}bad`;
    const bad = new File(['esto no es una imagen'], 'x.png', { type: 'image/png' });
    await expect(saveProductImage(pid, bad, '')).rejects.toThrow();
    expect(fs.existsSync(path.join(UPLOADS, 'products', pid))).toBe(false);
  });

  it('si falla el put del thumb borra el archivo principal y relanza', async () => {
    const real = getStorage();
    const deleted: string[] = [];
    const puts: string[] = [];
    globalThis.__retakeStorage = {
      put: async (key: string, data: Buffer, ct: string) => {
        puts.push(key);
        if (puts.length === 2) throw new Error('disco lleno');
        await real.put(key, data, ct);
      },
      get: (key: string) => real.get(key),
      delete: async (key: string) => {
        deleted.push(key);
        await real.delete(key);
      },
      publicUrl: (key: string) => real.publicUrl(key),
    };
    try {
      await expect(saveProductImage(PID, await pngFile(100, 100), '')).rejects.toThrow('disco lleno');
    } finally {
      globalThis.__retakeStorage = real;
    }
    expect(deleted).toEqual([puts[0]]);
    expect(await real.get(puts[0]!)).toBeNull();
  });
});
