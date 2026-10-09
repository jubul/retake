import { describe, expect, it } from 'vitest';
import {
  countsByStatus,
  escapeLike,
  getProductById,
  getProductBySlug,
  latestProducts,
  limitedProducts,
  listProducts,
  recentProducts,
  slugExists,
} from '@/lib/products/queries';
import { insertImages, insertProduct, reorderImages } from '@/lib/products/repo';
import { testDb } from './helpers/db';
import { makeImage, makeProductInput, seedProducts, setCreatedAt } from './helpers/fixtures';

describe('escapeLike', () => {
  it('escapa %, _ y \\', () => {
    expect(escapeLike('50%')).toBe('50\\%');
    expect(escapeLike('a_b')).toBe('a\\_b');
    expect(escapeLike('a\\b')).toBe('a\\\\b');
  });
  it('no toca texto normal', () => {
    expect(escapeLike('Pokémon DS')).toBe('Pokémon DS');
    expect(escapeLike('')).toBe('');
  });
  it('escapa todas las ocurrencias', () => {
    expect(escapeLike('%_%_')).toBe('\\%\\_\\%\\_');
  });
});

describe('listProducts: búsqueda', () => {
  it('"%" es literal y no matchea todo', async () => {
    const db = await testDb();
    await seedProducts(db);
    await insertProduct(makeProductInput({ name: 'Oferta 50% off' }), db);
    const res = await listProducts({ q: '%' }, db);
    expect(res.map((p) => p.name)).toEqual(['Oferta 50% off']);
  });

  it('"_" es literal y no es comodín de un carácter', async () => {
    const db = await testDb();
    await seedProducts(db);
    await insertProduct(makeProductInput({ name: 'snake_case' }), db);
    expect((await listProducts({ q: '_' }, db)).map((p) => p.name)).toEqual(['snake_case']);
    expect(await listProducts({ q: 'snake_c' }, db)).toHaveLength(1);
    expect(await listProducts({ q: 'snakeXcase' }, db)).toHaveLength(0);
  });

  it('una barra invertida es literal', async () => {
    const db = await testDb();
    await seedProducts(db);
    await insertProduct(makeProductInput({ name: 'a\\b' }), db);
    expect(await listProducts({ q: '\\' }, db)).toHaveLength(1);
  });

  it('busca en name y en note, sin distinguir mayúsculas (ASCII)', async () => {
    const db = await testDb();
    await seedProducts(db);
    expect((await listProducts({ q: 'GLOSS' }, db)).map((p) => p.slug)).toEqual(['nintendo-3ds-gloss-pink']);
    expect((await listProducts({ q: 'bisagra' }, db)).map((p) => p.slug)).toEqual(['ds-lite-crimson-black']);
  });

  it('q vacío o en blanco no filtra', async () => {
    const db = await testDb();
    await seedProducts(db);
    expect(await listProducts({ q: '   ' }, db)).toHaveLength(4);
    expect(await listProducts({ q: '' }, db)).toHaveLength(4);
  });

  it('sin resultados devuelve []', async () => {
    const db = await testDb();
    await seedProducts(db);
    expect(await listProducts({ q: 'zzzz' }, db)).toEqual([]);
  });
});

describe('listProducts: filtros y orden', () => {
  it('filtra por category y status', async () => {
    const db = await testDb();
    await seedProducts(db);
    await insertProduct(makeProductInput({ name: 'Vendido', category: 'cartuchos', status: 'sold' }), db);
    expect(await listProducts({ category: 'consolas' }, db)).toHaveLength(3);
    expect(await listProducts({ category: 'cartuchos' }, db)).toHaveLength(2);
    expect(await listProducts({ status: 'sold' }, db)).toHaveLength(1);
    expect(await listProducts({ category: 'consolas', status: 'sold' }, db)).toHaveLength(0);
  });

  it('respeta limit', async () => {
    const db = await testDb();
    await seedProducts(db);
    expect(await listProducts({ limit: 2 }, db)).toHaveLength(2);
  });

  it('vendidos al final aunque tengan sortOrder alto y sean más nuevos', async () => {
    const db = await testDb();
    const sold = await insertProduct(makeProductInput({ name: 'SS', status: 'sold', sortOrder: '999' }), db);
    const a = await insertProduct(makeProductInput({ name: 'AA' }), db);
    const r = await insertProduct(makeProductInput({ name: 'RR', status: 'reserved' }), db);
    await setCreatedAt(db, sold.id, 3000);
    await setCreatedAt(db, a.id, 1000);
    await setCreatedAt(db, r.id, 2000);
    expect((await listProducts({}, db)).map((p) => p.name)).toEqual(['RR', 'AA', 'SS']);
  });

  it('sortOrder desc primero, luego createdAt desc', async () => {
    const db = await testDb();
    const old = await insertProduct(makeProductInput({ name: 'old', sortOrder: '5' }), db);
    const mid = await insertProduct(makeProductInput({ name: 'mid' }), db);
    const nu = await insertProduct(makeProductInput({ name: 'new' }), db);
    const neg = await insertProduct(makeProductInput({ name: 'neg', sortOrder: '-1' }), db);
    await setCreatedAt(db, old.id, 1000);
    await setCreatedAt(db, mid.id, 2000);
    await setCreatedAt(db, nu.id, 3000);
    await setCreatedAt(db, neg.id, 4000);
    expect((await listProducts({}, db)).map((p) => p.name)).toEqual(['old', 'new', 'mid', 'neg']);
  });

  it('entre vendidos también ordena por sortOrder y createdAt', async () => {
    const db = await testDb();
    const s1 = await insertProduct(makeProductInput({ name: 's1', status: 'sold' }), db);
    const s2 = await insertProduct(makeProductInput({ name: 's2', status: 'sold' }), db);
    const s3 = await insertProduct(makeProductInput({ name: 's3', status: 'sold', sortOrder: '1' }), db);
    await setCreatedAt(db, s1.id, 1000);
    await setCreatedAt(db, s2.id, 2000);
    await setCreatedAt(db, s3.id, 500);
    expect((await listProducts({}, db)).map((p) => p.name)).toEqual(['s3', 's2', 's1']);
  });

  it('incluye imágenes ordenadas por position', async () => {
    const db = await testDb();
    const p = await insertProduct(makeProductInput(), db);
    await insertImages(p.id, [makeImage(1), makeImage(2)], db);
    const [row] = await listProducts({}, db);
    expect(row?.images.map((i) => i.position)).toEqual([0, 1]);
  });
});

describe('getProductBySlug / getProductById', () => {
  it('devuelve imágenes ordenadas por position, también tras reordenar', async () => {
    const db = await testDb();
    const p = await insertProduct(makeProductInput({ name: 'Con fotos' }), db);
    const imgs = await insertImages(p.id, [makeImage(1), makeImage(2), makeImage(3)], db);
    let got = await getProductBySlug(p.slug, db);
    expect(got?.images.map((i) => i.path)).toEqual(['p/1.webp', 'p/2.webp', 'p/3.webp']);
    await reorderImages(p.id, [imgs[2]!.id, imgs[0]!.id, imgs[1]!.id], db);
    got = await getProductBySlug(p.slug, db);
    expect(got?.images.map((i) => i.path)).toEqual(['p/3.webp', 'p/1.webp', 'p/2.webp']);
    expect(got?.images.map((i) => i.position)).toEqual([0, 1, 2]);
  });

  it('producto sin imágenes → images []', async () => {
    const db = await testDb();
    const p = await insertProduct(makeProductInput(), db);
    expect((await getProductBySlug(p.slug, db))?.images).toEqual([]);
  });

  it('slug inexistente → null', async () => {
    const db = await testDb();
    expect(await getProductBySlug('nada', db)).toBeNull();
  });

  it('getProductById devuelve el producto o null', async () => {
    const db = await testDb();
    const p = await insertProduct(makeProductInput(), db);
    await insertImages(p.id, [makeImage(1)], db);
    expect((await getProductById(p.id, db))?.images).toHaveLength(1);
    expect(await getProductById('nope', db)).toBeNull();
  });
});

describe('latest / limited / recent', () => {
  it('recentProducts incluye vendidos y reservados, createdAt desc, respeta n', async () => {
    const db = await testDb();
    const a = await insertProduct(makeProductInput({ name: 'aa' }), db);
    const b = await insertProduct(makeProductInput({ name: 'bb', status: 'sold' }), db);
    const c = await insertProduct(makeProductInput({ name: 'cc', status: 'reserved' }), db);
    await setCreatedAt(db, a.id, 1000);
    await setCreatedAt(db, b.id, 3000);
    await setCreatedAt(db, c.id, 2000);
    expect((await recentProducts(5, db)).map((p) => p.name)).toEqual(['bb', 'cc', 'aa']);
    expect((await recentProducts(2, db)).map((p) => p.name)).toEqual(['bb', 'cc']);
  });

  it('recentProducts en DB vacía → []', async () => {
    expect(await recentProducts(5, await testDb())).toEqual([]);
  });

  it('latestProducts solo available, más nuevos primero', async () => {
    const db = await testDb();
    await seedProducts(db);
    await insertProduct(makeProductInput({ name: 'xx', status: 'sold' }), db);
    await insertProduct(makeProductInput({ name: 'yy', status: 'reserved' }), db);
    const res = await latestProducts(3, db);
    expect(res.map((p) => p.slug)).toEqual([
      'nintendo-3ds-gloss-pink',
      'nintendo-3ds-cosmo-black',
      'ds-lite-crimson-black',
    ]);
  });

  it('limitedProducts: limited y no vendidos', async () => {
    const db = await testDb();
    await seedProducts(db);
    await insertProduct(makeProductInput({ name: 'l-sold', limited: 'on', status: 'sold' }), db);
    await insertProduct(makeProductInput({ name: 'l-res', limited: 'on', status: 'reserved' }), db);
    const names = (await limitedProducts(4, db)).map((p) => p.name);
    expect(names).toHaveLength(2);
    expect(names).toContain('l-res');
    expect(names).toContain('DS Lite Crimson / Black');
    expect(names).not.toContain('l-sold');
  });
});

describe('countsByStatus', () => {
  it('DB vacía → ceros', async () => {
    expect(await countsByStatus(await testDb())).toEqual({ available: 0, reserved: 0, sold: 0, total: 0 });
  });
  it('cuenta por estado', async () => {
    const db = await testDb();
    await seedProducts(db);
    await insertProduct(makeProductInput({ name: 'xx', status: 'sold' }), db);
    await insertProduct(makeProductInput({ name: 'yy', status: 'sold' }), db);
    await insertProduct(makeProductInput({ name: 'zz', status: 'reserved' }), db);
    expect(await countsByStatus(db)).toEqual({ available: 4, reserved: 1, sold: 2, total: 7 });
  });
});

describe('slugExists', () => {
  it('true/false según exista', async () => {
    const db = await testDb();
    await insertProduct(makeProductInput({ slug: 'mi-slug' }), db);
    expect(await slugExists('mi-slug', undefined, db)).toBe(true);
    expect(await slugExists('otro', undefined, db)).toBe(false);
  });
  it('excludeId excluye al propio producto', async () => {
    const db = await testDb();
    const p = await insertProduct(makeProductInput({ slug: 'mi-slug' }), db);
    expect(await slugExists('mi-slug', p.id, db)).toBe(false);
  });
  it('excludeId de otro producto no lo excluye', async () => {
    const db = await testDb();
    const p = await insertProduct(makeProductInput({ slug: 'uno' }), db);
    const q = await insertProduct(makeProductInput({ slug: 'dos' }), db);
    expect(await slugExists('uno', q.id, db)).toBe(true);
    expect(await slugExists('dos', p.id, db)).toBe(true);
  });
});
