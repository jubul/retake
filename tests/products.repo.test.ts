import { describe, expect, it } from 'vitest';
import type { Db } from '@/lib/db/client';
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
import {
  RepoError,
  deleteImage,
  deleteProductById,
  ensureUniqueSlug,
  insertImages,
  insertProduct,
  reorderImages,
  updateProductById,
} from '@/lib/products/repo';
import { productInputSchema, type ProductInput } from '@/lib/products/schemas';
import { products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { testDb } from './helpers/db';

function input(over: Record<string, unknown> = {}): ProductInput {
  return productInputSchema.parse({
    name: 'Foo',
    category: 'consolas',
    price: '1000',
    ...over,
  });
}

function img(n: number) {
  return { path: `p/${n}.webp`, thumbPath: `p/${n}-thumb.webp`, width: 10, height: 10, alt: '' };
}

async function setCreatedAt(db: Db, id: string, ms: number) {
  await db
    .update(products)
    .set({ createdAt: new Date(ms) })
    .where(eq(products.id, id));
}

describe('insertProduct / slugs', () => {
  it('genera id y slug', async () => {
    const db = await testDb();
    const p = await insertProduct(input({ name: 'Pokémon SoulSilver (JP)' }), db);
    expect(p.id).toBeTruthy();
    expect(p.slug).toBe('pokemon-soulsilver-jp');
    expect(await slugExists('pokemon-soulsilver-jp', undefined, db)).toBe(true);
    expect(await slugExists('pokemon-soulsilver-jp', p.id, db)).toBe(false);
  });

  it('respeta el slug dado y deduplica con sufijo', async () => {
    const db = await testDb();
    const a = await insertProduct(input({ name: 'Foo' }), db);
    const b = await insertProduct(input({ name: 'Foo' }), db);
    const c = await insertProduct(input({ name: 'Foo' }), db);
    expect([a.slug, b.slug, c.slug]).toEqual(['foo', 'foo-2', 'foo-3']);
    const d = await insertProduct(input({ name: 'Otro', slug: 'custom' }), db);
    expect(d.slug).toBe('custom');
    expect(await ensureUniqueSlug('custom', undefined, db)).toBe('custom-2');
  });

  it('getProductBySlug / getProductById', async () => {
    const db = await testDb();
    const p = await insertProduct(input(), db);
    expect((await getProductBySlug('foo', db))?.id).toBe(p.id);
    expect((await getProductById(p.id, db))?.images).toEqual([]);
    expect(await getProductBySlug('nope', db)).toBeNull();
    expect(await getProductById('nope', db)).toBeNull();
  });
});

describe('updateProductById', () => {
  it('slug ajeno lanza slug_taken', async () => {
    const db = await testDb();
    await insertProduct(input({ name: 'Foo' }), db);
    const b = await insertProduct(input({ name: 'Bar' }), db);
    await expect(updateProductById(b.id, input({ name: 'Bar', slug: 'foo' }), db)).rejects.toMatchObject({
      name: 'RepoError',
      code: 'slug_taken',
    });
    await expect(updateProductById(b.id, input({ name: 'Bar', slug: 'foo' }), db)).rejects.toBeInstanceOf(
      RepoError,
    );
  });

  it('mantiene el slug si no viene y actualiza updatedAt', async () => {
    const db = await testDb();
    const p = await insertProduct(input({ name: 'Foo' }), db);
    await new Promise((r) => setTimeout(r, 5));
    const u = await updateProductById(p.id, input({ name: 'Renombrado', price: '5' }), db);
    expect(u?.slug).toBe('foo');
    expect(u?.name).toBe('Renombrado');
    expect(u?.price).toBe(5);
    expect(u!.updatedAt.getTime()).toBeGreaterThan(p.updatedAt.getTime());
  });

  it('permite conservar su propio slug y devuelve null si no existe', async () => {
    const db = await testDb();
    const p = await insertProduct(input({ name: 'Foo' }), db);
    expect((await updateProductById(p.id, input({ slug: 'foo' }), db))?.slug).toBe('foo');
    expect(await updateProductById('nope', input(), db)).toBeNull();
  });
});

describe('listados', () => {
  async function seed(db: Db) {
    const a = await insertProduct(input({ name: 'Alfa', status: 'sold' }), db);
    const b = await insertProduct(input({ name: 'Beta', sortOrder: '0' }), db);
    const c = await insertProduct(input({ name: 'Gamma', sortOrder: '5', limited: 'on' }), db);
    const d = await insertProduct(
      input({
        name: 'Pokémon',
        category: 'cartuchos',
        status: 'reserved',
        note: 'En japonés',
        limited: 'on',
      }),
      db,
    );
    const e = await insertProduct(input({ name: 'Zeta', status: 'sold', limited: 'on' }), db);
    await setCreatedAt(db, a.id, 1000);
    await setCreatedAt(db, b.id, 2000);
    await setCreatedAt(db, c.id, 3000);
    await setCreatedAt(db, d.id, 4000);
    await setCreatedAt(db, e.id, 5000);
  }

  it('sold al final, luego sortOrder desc y createdAt desc', async () => {
    const db = await testDb();
    await seed(db);
    const names = (await listProducts({}, db)).map((p) => p.name);
    expect(names).toEqual(['Gamma', 'Pokémon', 'Beta', 'Zeta', 'Alfa']);
  });

  it('q: LIKE sobre ASCII, sin normalizar acentos', async () => {
    const db = await testDb();
    await seed(db);
    expect(await listProducts({ q: 'pokemon' }, db)).toHaveLength(0);
    expect((await listProducts({ q: 'pok' }, db)).map((p) => p.name)).toEqual(['Pokémon']);
    expect((await listProducts({ q: 'POK' }, db)).map((p) => p.name)).toEqual(['Pokémon']);
    expect((await listProducts({ q: 'japones' }, db)).length).toBe(0);
    expect((await listProducts({ q: 'JAP' }, db)).map((p) => p.name)).toEqual(['Pokémon']);
  });

  it('q escapa % y _', async () => {
    const db = await testDb();
    await seed(db);
    expect(await listProducts({ q: '%' }, db)).toHaveLength(0);
    expect(await listProducts({ q: '_' }, db)).toHaveLength(0);
    expect(escapeLike('a%b_c\\')).toBe('a\\%b\\_c\\\\');
  });

  it('filtros por category, status y limit', async () => {
    const db = await testDb();
    await seed(db);
    expect((await listProducts({ category: 'cartuchos' }, db)).map((p) => p.name)).toEqual(['Pokémon']);
    expect((await listProducts({ status: 'sold' }, db)).map((p) => p.name)).toEqual(['Zeta', 'Alfa']);
    expect(await listProducts({ limit: 2 }, db)).toHaveLength(2);
  });

  it('latestProducts solo available, limitedProducts excluye sold, recentProducts todo', async () => {
    const db = await testDb();
    await seed(db);
    expect((await latestProducts(2, db)).map((p) => p.name)).toEqual(['Gamma', 'Beta']);
    expect((await limitedProducts(5, db)).map((p) => p.name)).toEqual(['Pokémon', 'Gamma']);
    expect((await recentProducts(3, db)).map((p) => p.name)).toEqual(['Zeta', 'Pokémon', 'Gamma']);
  });

  it('countsByStatus', async () => {
    const db = await testDb();
    expect(await countsByStatus(db)).toEqual({ available: 0, reserved: 0, sold: 0, total: 0 });
    await seed(db);
    expect(await countsByStatus(db)).toEqual({ available: 2, reserved: 1, sold: 2, total: 5 });
  });
});

describe('imágenes', () => {
  it('insertImages asigna positions y la 9.ª falla', async () => {
    const db = await testDb();
    const p = await insertProduct(input(), db);
    const first = await insertImages(p.id, [img(0), img(1), img(2)], db);
    expect(first.map((i) => i.position)).toEqual([0, 1, 2]);
    const more = await insertImages(p.id, [img(3), img(4), img(5), img(6), img(7)], db);
    expect(more.map((i) => i.position)).toEqual([3, 4, 5, 6, 7]);
    await expect(insertImages(p.id, [img(8)], db)).rejects.toMatchObject({ code: 'too_many_images' });
    expect((await getProductById(p.id, db))?.images).toHaveLength(8);
  });

  it('insertImages en producto inexistente: not_found', async () => {
    const db = await testDb();
    await expect(insertImages('nope', [img(0)], db)).rejects.toMatchObject({ code: 'not_found' });
  });

  it('reorderImages reordena y rechaza sets incompletos', async () => {
    const db = await testDb();
    const p = await insertProduct(input(), db);
    const [a, b, c] = await insertImages(p.id, [img(0), img(1), img(2)], db);
    await reorderImages(p.id, [c!.id, a!.id, b!.id], db);
    expect((await getProductById(p.id, db))?.images.map((i) => i.id)).toEqual([c!.id, a!.id, b!.id]);
    await expect(reorderImages(p.id, [a!.id, b!.id], db)).rejects.toMatchObject({ code: 'bad_order' });
    await expect(reorderImages(p.id, [a!.id, a!.id, b!.id], db)).rejects.toMatchObject({
      code: 'bad_order',
    });
    await expect(reorderImages(p.id, [a!.id, b!.id, 'x'], db)).rejects.toMatchObject({
      code: 'bad_order',
    });
  });

  it('deleteImage compacta positions', async () => {
    const db = await testDb();
    const p = await insertProduct(input(), db);
    const [a, b, c] = await insertImages(p.id, [img(0), img(1), img(2)], db);
    const removed = await deleteImage(p.id, a!.id, db);
    expect(removed?.id).toBe(a!.id);
    const rest = (await getProductById(p.id, db))!.images;
    expect(rest.map((i) => [i.id, i.position])).toEqual([
      [b!.id, 0],
      [c!.id, 1],
    ]);
    expect(await deleteImage(p.id, 'nope', db)).toBeNull();
  });

  it('deleteProductById borra imágenes y devuelve 2 keys por imagen', async () => {
    const db = await testDb();
    const p = await insertProduct(input(), db);
    await insertImages(p.id, [img(0), img(1)], db);
    const r = await deleteProductById(p.id, db);
    expect(r.deleted).toBe(true);
    expect(r.storageKeys).toHaveLength(4);
    expect(await getProductById(p.id, db)).toBeNull();
    const orphans = await db.query.productImages.findMany();
    expect(orphans).toHaveLength(0);
    expect(await deleteProductById(p.id, db)).toEqual({ deleted: false, storageKeys: [] });
  });
});
