import { describe, expect, it } from 'vitest';
import { SEED_PRODUCTS } from '../scripts/seed';
import { products } from '@/lib/db/schema';
import { listProducts } from '@/lib/products/queries';
import { testDb } from './helpers/db';
import { seedProducts } from './helpers/fixtures';

const SLUGS = [
  'nintendo-3ds-gloss-pink',
  'nintendo-3ds-cosmo-black',
  'ds-lite-crimson-black',
  'pokemon-soulsilver-jp',
];
const DAY_MS = 24 * 60 * 60 * 1000;

/** Replica la inserción de scripts/seed.ts (main() no es importable sin efectos). */
async function seedFromScript() {
  const db = await testDb();
  const now = Date.now();
  await db.insert(products).values(
    SEED_PRODUCTS.map((p, i) => ({
      ...p,
      id: `seed-${i}`,
      status: 'available' as const,
      origin: 'JP',
      createdAt: new Date(now - i * DAY_MS),
      updatedAt: new Date(now - i * DAY_MS),
    })),
  );
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
