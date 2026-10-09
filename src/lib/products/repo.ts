import { createId } from '@paralleldrive/cuid2';
import { asc, eq, sql } from 'drizzle-orm';
import { getDb, type Db } from '@/lib/db/client';
import { productImages, products } from '@/lib/db/schema';
import { slugify } from '@/lib/utils/slugify';
import { IMAGES_MAX_PER_PRODUCT, type NewImageData } from './constants';
import { slugExists } from './queries';
import type { ProductInput } from './schemas';
import type { Product, ProductImage } from './types';

export type { NewImageData };

export type RepoErrorCode = 'not_found' | 'too_many_images' | 'bad_order' | 'slug_taken';

export class RepoError extends Error {
  code: RepoErrorCode;
  constructor(code: RepoErrorCode, message?: string) {
    super(message ?? code);
    this.name = 'RepoError';
    this.code = code;
  }
}

/** Genera un slug único: base, base-2, base-3... (excluyendo excludeId al comparar). */
export async function ensureUniqueSlug(base: string, excludeId?: string, db: Db = getDb()): Promise<string> {
  const root = base || 'producto';
  let candidate = root;
  for (let n = 2; await slugExists(candidate, excludeId, db); n++) {
    candidate = `${root}-${n}`;
  }
  return candidate;
}

/** id = createId(); slug = input.slug ?? slugify(input.name), luego ensureUniqueSlug. */
export async function insertProduct(input: ProductInput, db: Db = getDb()): Promise<Product> {
  const slug = await ensureUniqueSlug(input.slug ?? slugify(input.name), undefined, db);
  const now = new Date();
  const [row] = await db
    .insert(products)
    .values({
      id: createId(),
      slug,
      name: input.name,
      category: input.category,
      price: input.price,
      status: input.status,
      note: input.note,
      description: input.description,
      year: input.year,
      origin: input.origin,
      featured: input.featured,
      limited: input.limited,
      sortOrder: input.sortOrder,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return row!;
}

/** Actualiza campos + updatedAt. Slug: si viene, se respeta (RepoError 'slug_taken' si lo usa otro); si no, se mantiene el actual. null si no existe. */
export async function updateProductById(
  id: string,
  input: ProductInput,
  db: Db = getDb(),
): Promise<Product | null> {
  const [existing] = await db.select({ id: products.id }).from(products).where(eq(products.id, id));
  if (!existing) return null;
  if (input.slug !== undefined && (await slugExists(input.slug, id, db))) {
    throw new RepoError('slug_taken', 'Ese slug ya existe');
  }
  const [row] = await db
    .update(products)
    .set({
      ...(input.slug !== undefined ? { slug: input.slug } : {}),
      name: input.name,
      category: input.category,
      price: input.price,
      status: input.status,
      note: input.note,
      description: input.description,
      year: input.year,
      origin: input.origin,
      featured: input.featured,
      limited: input.limited,
      sortOrder: input.sortOrder,
      updatedAt: new Date(),
    })
    .where(eq(products.id, id))
    .returning();
  return row ?? null;
}

/** Borra imágenes (filas) y producto en una transacción. Devuelve las keys de storage a borrar. */
export async function deleteProductById(
  id: string,
  db: Db = getDb(),
): Promise<{ deleted: boolean; storageKeys: string[] }> {
  return db.transaction(async (tx) => {
    const images = await tx.select().from(productImages).where(eq(productImages.productId, id));
    await tx.delete(productImages).where(eq(productImages.productId, id));
    const removed = await tx.delete(products).where(eq(products.id, id)).returning({ id: products.id });
    return {
      deleted: removed.length > 0,
      storageKeys: images.flatMap((i) => [i.path, i.thumbPath]),
    };
  });
}

/** Inserta al final (position = max+1...). RepoError 'too_many_images' si supera IMAGES_MAX_PER_PRODUCT; 'not_found' si no existe el producto. */
export async function insertImages(
  productId: string,
  images: NewImageData[],
  db: Db = getDb(),
): Promise<ProductImage[]> {
  return db.transaction(async (tx) => {
    const [product] = await tx.select({ id: products.id }).from(products).where(eq(products.id, productId));
    if (!product) throw new RepoError('not_found', 'Producto inexistente');

    const [agg] = await tx
      .select({
        n: sql<number>`count(*)`,
        maxPos: sql<number | null>`max(${productImages.position})`,
      })
      .from(productImages)
      .where(eq(productImages.productId, productId));
    const count = Number(agg?.n ?? 0);
    if (count + images.length > IMAGES_MAX_PER_PRODUCT) {
      throw new RepoError('too_many_images', `Máximo ${IMAGES_MAX_PER_PRODUCT} fotos por producto`);
    }
    if (images.length === 0) return [];

    const start = agg?.maxPos === null || agg?.maxPos === undefined ? 0 : Number(agg.maxPos) + 1;
    return tx
      .insert(productImages)
      .values(
        images.map((img, i) => ({
          id: createId(),
          productId,
          path: img.path,
          thumbPath: img.thumbPath,
          width: img.width,
          height: img.height,
          alt: img.alt,
          position: start + i,
        })),
      )
      .returning();
  });
}

/** Borra una imagen y compacta positions (0..n-1). Devuelve la fila borrada (para borrar archivos) o null. */
export async function deleteImage(
  productId: string,
  imageId: string,
  db: Db = getDb(),
): Promise<ProductImage | null> {
  return db.transaction(async (tx) => {
    const all = await tx
      .select()
      .from(productImages)
      .where(eq(productImages.productId, productId))
      .orderBy(asc(productImages.position));
    const target = all.find((i) => i.id === imageId);
    if (!target) return null;
    await tx.delete(productImages).where(eq(productImages.id, imageId));
    const rest = all.filter((i) => i.id !== imageId);
    for (const [index, img] of rest.entries()) {
      if (img.position !== index) {
        await tx.update(productImages).set({ position: index }).where(eq(productImages.id, img.id));
      }
    }
    return target;
  });
}

/** orderedIds debe ser exactamente el conjunto de ids del producto; si no, RepoError 'bad_order'. Asigna position = índice. */
export async function reorderImages(
  productId: string,
  orderedIds: string[],
  db: Db = getDb(),
): Promise<void> {
  await db.transaction(async (tx) => {
    const existing = await tx
      .select({ id: productImages.id })
      .from(productImages)
      .where(eq(productImages.productId, productId));
    const ids = new Set(existing.map((i) => i.id));
    const given = new Set(orderedIds);
    if (
      given.size !== orderedIds.length ||
      given.size !== ids.size ||
      orderedIds.some((id) => !ids.has(id))
    ) {
      throw new RepoError('bad_order', 'El orden no coincide con las fotos del producto');
    }
    for (const [index, id] of orderedIds.entries()) {
      await tx.update(productImages).set({ position: index }).where(eq(productImages.id, id));
    }
  });
}
