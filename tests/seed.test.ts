import { describe, expect, it } from 'vitest';
import { SEED_PRODUCTS, seedDb } from '../scripts/seed';
import { products } from '@/lib/db/schema';
import { listProducts } from '@/lib/products/queries';
import { insertImages } from '@/lib/products/repo';
import { getStorage } from '@/lib/storage';
import { testDb } from './helpers/db';
import { seedProducts } from './helpers/fixtures';

const SLUGS = [
  'nintendo-3ds-gloss-pink',
  'nintendo-3ds-cosmo-black',
  'ds-lite-crimson-black',
  'pokemon-soulsilver-jp',
];

async function seedFromScript() {
  const db = await testDb();
  await seedDb(db);
  return db;
}

describe('SEED_PRODUCTS en una DB limpia', () => {
  it('son 4 con los slugs esperados, en orden', () => {
    expect(SEED_PRODUCTS.map((p) => p.slug)).toEqual(SLUGS);
  });

  it('se insertan 4 productos', async () => {
    const db = await seedFromScript();
    expect(await db.select().from(products)).toHaveLength(4);
  });

  it('listProducts devuelve createdAt desc = orden del seed', async () => {
    const db = await seedFromScript();
    const list = await listProducts({}, db);
    expect(list.map((p) => p.slug)).toEqual(SLUGS);
    const times = list.map((p) => p.createdAt.getTime());
    expect([...times].sort((a, b) => b - a)).toEqual(times);
  });

  it('todos available, origin JP, sin slugs duplicados', async () => {
    const db = await seedFromScript();
    const list = await listProducts({}, db);
    expect(list.every((p) => p.status === 'available' && p.origin === 'JP')).toBe(true);
    expect(new Set(list.map((p) => p.slug)).size).toBe(4);
  });

  it('precios, categorías y flags del mockup', async () => {
    const db = await seedFromScript();
    const by = Object.fromEntries((await listProducts({}, db)).map((p) => [p.slug, p]));
    expect(by['nintendo-3ds-gloss-pink']).toMatchObject({
      price: 350000,
      category: 'consolas',
      featured: true,
      year: 2013,
    });
    expect(by['nintendo-3ds-cosmo-black']).toMatchObject({ price: 250000, featured: false });
    expect(by['ds-lite-crimson-black']).toMatchObject({ price: 180000, limited: true });
    expect(by['pokemon-soulsilver-jp']).toMatchObject({ price: 90000, category: 'cartuchos' });
  });
});

describe('seedProducts (fixtures)', () => {
  it('genera los mismos 4 slugs y orden que el seed', async () => {
    const db = await testDb();
    await seedProducts(db);
    expect((await listProducts({}, db)).map((p) => p.slug)).toEqual(SLUGS);
  });

  it('coincide con SEED_PRODUCTS en nombre, precio y nota', async () => {
    const db = await testDb();
    await seedProducts(db);
    const list = await listProducts({}, db);
    expect(list.map((p) => [p.name, p.price, p.note])).toEqual(
      SEED_PRODUCTS.map((p) => [p.name, p.price, p.note]),
    );
  });
});

describe('seedDb', () => {
  it('sin reset omite si ya hay productos', async () => {
    const db = await testDb();
    expect(await seedDb(db)).toEqual({ inserted: 4, skipped: false });
    expect(await seedDb(db)).toEqual({ inserted: 0, skipped: true });
    expect(await db.select().from(products)).toHaveLength(4);
  });

  it('con reset vuelve a sembrar sin duplicar y borra los archivos de las fotos', async () => {
    const db = await testDb();
    const storage = getStorage();
    const [first] = await seedProducts(db);
    const main = `products/${first!.id}/a.webp`;
    const thumb = `products/${first!.id}/a-thumb.webp`;
    await storage.put(main, Buffer.from('x'), 'image/webp');
    await storage.put(thumb, Buffer.from('x'), 'image/webp');
    await insertImages(first!.id, [{ path: main, thumbPath: thumb, width: 1, height: 1, alt: 'a' }], db);

    expect(await seedDb(db, { reset: true })).toEqual({ inserted: 4, skipped: false });
    expect(await db.select().from(products)).toHaveLength(4);
    expect(await storage.get(main)).toBeNull();
    expect(await storage.get(thumb)).toBeNull();
  });
});
