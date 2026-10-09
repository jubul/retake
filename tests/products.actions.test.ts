import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Db } from '@/lib/db/client';
import { productImages, products } from '@/lib/db/schema';
import { testDb } from './helpers/db';

const holder = vi.hoisted(() => ({ db: undefined as unknown as Db }));

class RedirectError extends Error {
  constructor(public url: string) {
    super(`NEXT_REDIRECT:${url}`);
  }
}

vi.mock('@/lib/auth/server', () => ({
  requireSession: vi.fn(async () => ({ sub: 'admin', iat: 0, exp: 0 })),
  getSession: vi.fn(async () => ({ sub: 'admin', iat: 0, exp: 0 })),
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new RedirectError(url);
  }),
}));
vi.mock('@/lib/db/client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/db/client')>()),
  getDb: () => holder.db,
}));

import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/auth/server';
import {
  addProductImages,
  createProduct,
  deleteProduct,
  removeProductImage,
  reorderProductImages,
  updateProduct,
} from '@/lib/products/actions';
import { getProductById, listProducts } from '@/lib/products/queries';
import { insertProduct } from '@/lib/products/repo';
import { productInputSchema } from '@/lib/products/schemas';

const UPLOADS_ROOT = path.resolve(process.cwd(), 'data/uploads-test');

function form(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) fd.set(k, v);
  return fd;
}

const VALID = { name: 'Nintendo DS Lite', category: 'consolas', price: '90000' };

async function seedProduct(name: string, slug?: string) {
  return insertProduct(
    productInputSchema.parse({ name, slug, category: 'consolas', price: '1000' }),
    holder.db,
  );
}

async function png(): Promise<File> {
  const buf = await sharp({
    create: { width: 40, height: 30, channels: 3, background: { r: 255, g: 45, b: 138 } },
  })
    .png()
    .toBuffer();
  return new File([new Uint8Array(buf)], 'foto.png', { type: 'image/png' });
}

function imagesForm(files: File[]): FormData {
  const fd = new FormData();
  for (const f of files) fd.append('images', f);
  return fd;
}

async function redirectOf(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof RedirectError) return error.url;
    throw error;
  }
  throw new Error('expected a redirect');
}

beforeEach(async () => {
  holder.db = await testDb();
  vi.clearAllMocks();
});

afterAll(async () => {
  await rm(UPLOADS_ROOT, { recursive: true, force: true });
});

describe('createProduct', () => {
  it('returns field errors for an invalid payload', async () => {
    const result = await createProduct(null, form({ name: '', category: 'consolas', price: '10' }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.fields?.name?.length).toBeGreaterThan(0);
    expect(await listProducts({}, holder.db)).toHaveLength(0);
  });

  it('requires a session first', async () => {
    await createProduct(null, form(VALID)).catch(() => undefined);
    expect(requireSession).toHaveBeenCalled();
  });

  it('inserts, revalidates and redirects to the edit page', async () => {
    const url = await redirectOf(createProduct(null, form(VALID)));
    const [created] = await listProducts({}, holder.db);
    expect(created).toBeDefined();
    expect(url).toBe(`/admin/productos/${created!.id}`);
    expect(created!.slug).toBe('nintendo-ds-lite');
    expect(revalidatePath).toHaveBeenCalledWith('/botin/nintendo-ds-lite');
    expect(revalidatePath).toHaveBeenCalledWith('/admin/productos');
  });
});

describe('updateProduct', () => {
  it('maps a taken slug to fields.slug', async () => {
    await seedProduct('Uno', 'uno');
    const other = await seedProduct('Dos', 'dos');
    const result = await updateProduct(other.id, null, form({ ...VALID, slug: 'uno' }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.fields?.slug).toEqual(['Ese slug ya existe']);
  });

  it('updates and revalidates old and new slug', async () => {
    const p = await seedProduct('Uno', 'uno');
    const result = await updateProduct(p.id, null, form({ ...VALID, slug: 'nuevo-slug' }));
    expect(result).toEqual({ ok: true, id: p.id });
    expect((await getProductById(p.id, holder.db))?.slug).toBe('nuevo-slug');
    expect(revalidatePath).toHaveBeenCalledWith('/botin/uno');
    expect(revalidatePath).toHaveBeenCalledWith('/botin/nuevo-slug');
  });

  it('reports a missing product in Spanish', async () => {
    const result = await updateProduct('nope', null, form(VALID));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.form?.[0]).toMatch(/No encontré/);
  });
});

describe('addProductImages', () => {
  it('rejects a gif', async () => {
    const p = await seedProduct('Uno');
    const gif = new File([new Uint8Array([71, 73, 70, 56, 57, 97])], 'a.gif', { type: 'image/gif' });
    const result = await addProductImages(p.id, null, imagesForm([gif]));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.form).toContain('Solo JPG, PNG o WebP');
  });

  it('rejects 9 files with the max message', async () => {
    const p = await seedProduct('Uno');
    const file = await png();
    const result = await addProductImages(p.id, null, imagesForm(Array.from({ length: 9 }, () => file)));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.form?.join(' ')).toMatch(/Máximo 8 fotos/);
  });

  it('rejects when the product would exceed the total cap', async () => {
    const p = await seedProduct('Uno');
    const file = await png();
    expect((await addProductImages(p.id, null, imagesForm(Array.from({ length: 5 }, () => file)))).ok).toBe(
      true,
    );
    const result = await addProductImages(p.id, null, imagesForm(Array.from({ length: 4 }, () => file)));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.form?.join(' ')).toMatch(/Máximo 8 fotos/);
  });

  it('processes a valid PNG, inserts the row and writes both files', async () => {
    const p = await seedProduct('Uno');
    const result = await addProductImages(p.id, null, imagesForm([await png()]));
    expect(result).toEqual({ ok: true, id: p.id });
    const rows = await holder.db.select().from(productImages);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.path).toMatch(new RegExp(`^products/${p.id}/.+\\.webp$`));
    expect(existsSync(path.join(UPLOADS_ROOT, rows[0]!.path))).toBe(true);
    expect(existsSync(path.join(UPLOADS_ROOT, rows[0]!.thumbPath))).toBe(true);
  });

  it('reports a missing product', async () => {
    const result = await addProductImages('nope', null, imagesForm([await png()]));
    expect(result.ok).toBe(false);
  });
});

describe('removeProductImage', () => {
  it('deletes the row and both files', async () => {
    const p = await seedProduct('Uno');
    await addProductImages(p.id, null, imagesForm([await png()]));
    const [row] = await holder.db.select().from(productImages);
    const result = await removeProductImage(p.id, row!.id);
    expect(result.ok).toBe(true);
    expect(await holder.db.select().from(productImages)).toHaveLength(0);
    expect(existsSync(path.join(UPLOADS_ROOT, row!.path))).toBe(false);
    expect(existsSync(path.join(UPLOADS_ROOT, row!.thumbPath))).toBe(false);
  });

  it('fails cleanly for an unknown image', async () => {
    const p = await seedProduct('Uno');
    const result = await removeProductImage(p.id, 'nope');
    expect(result.ok).toBe(false);
  });
});

describe('reorderProductImages', () => {
  it('reorders by ids', async () => {
    const p = await seedProduct('Uno');
    await addProductImages(p.id, null, imagesForm([await png(), await png()]));
    const before = (await getProductById(p.id, holder.db))!.images.map((i) => i.id);
    const result = await reorderProductImages(p.id, [...before].reverse());
    expect(result.ok).toBe(true);
    const after = (await getProductById(p.id, holder.db))!.images.map((i) => i.id);
    expect(after).toEqual([...before].reverse());
  });

  it('rejects a set that does not match', async () => {
    const p = await seedProduct('Uno');
    await addProductImages(p.id, null, imagesForm([await png()]));
    const result = await reorderProductImages(p.id, ['bogus']);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.form?.[0]).toMatch(/orden/);
  });
});

describe('deleteProduct', () => {
  it('deletes rows and files, then redirects to the list', async () => {
    const p = await seedProduct('Uno');
    await addProductImages(p.id, null, imagesForm([await png()]));
    const [row] = await holder.db.select().from(productImages);
    const url = await redirectOf(deleteProduct(p.id));
    expect(url).toBe('/admin/productos');
    expect(await holder.db.select().from(products)).toHaveLength(0);
    expect(existsSync(path.join(UPLOADS_ROOT, row!.path))).toBe(false);
  });

  it('returns an error for an unknown id', async () => {
    const result = await deleteProduct('nope');
    expect(result.ok).toBe(false);
  });
});
