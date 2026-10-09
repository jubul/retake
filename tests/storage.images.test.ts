import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { processImage } from '@/lib/storage/images';

async function png(width: number, height: number): Promise<Buffer> {
  return sharp({ create: { width, height, channels: 3, background: '#ff2d8a' } })
    .png()
    .toBuffer();
}

describe('processImage', () => {
  it('2400x1200 → main 1600x800 y thumb 480x240, ambos webp', async () => {
    const out = await processImage(await png(2400, 1200));
    expect([out.main.width, out.main.height]).toEqual([1600, 800]);
    expect([out.thumb.width, out.thumb.height]).toEqual([480, 240]);
    expect((await sharp(out.main.data).metadata()).format).toBe('webp');
    expect((await sharp(out.thumb.data).metadata()).format).toBe('webp');
    const meta = await sharp(out.main.data).metadata();
    expect([meta.width, meta.height]).toEqual([1600, 800]);
  });

  it('300x300 no se agranda en main', async () => {
    const out = await processImage(await png(300, 300));
    expect([out.main.width, out.main.height]).toEqual([300, 300]);
    expect([out.thumb.width, out.thumb.height]).toEqual([300, 300]);
  });

  it('respeta la orientación EXIF', async () => {
    const rotated = await sharp(await png(400, 200))
      .withMetadata({ orientation: 6 })
      .jpeg()
      .toBuffer();
    const out = await processImage(rotated);
    expect([out.main.width, out.main.height]).toEqual([200, 400]);
  });

  it('input que no es imagen → lanza', async () => {
    await expect(processImage(Buffer.from('no soy una imagen'))).rejects.toThrow();
  });
});
