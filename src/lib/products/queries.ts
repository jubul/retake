import { and, asc, desc, eq, ne, or, sql, type SQL } from 'drizzle-orm';
import { getDb, type Db } from '@/lib/db/client';
import { productImages, products } from '@/lib/db/schema';
import type { ListFilters, ProductWithImages, StatusCounts } from './types';

const withImages = { images: { orderBy: asc(productImages.position) } } as const;

/** Escapa \ % _ para usar en LIKE con ESCAPE '\'. */
export function escapeLike(q: string): string {
  return q.replace(/[\\%_]/g, (c) => `\\${c}`);
}

/**
 * Lista productos con imágenes. Orden: no vendidos primero (available/reserved), vendidos al final;
 * dentro de cada grupo sortOrder desc, createdAt desc. Filtros opcionales.
 * q: LIKE %q% sobre name y note. SQLite LIKE es case-insensitive solo para ASCII: no normaliza acentos.
 */
export async function listProducts(
  filters: ListFilters = {},
  db: Db = getDb(),
): Promise<ProductWithImages[]> {
  const conds: SQL[] = [];
  if (filters.category) conds.push(eq(products.category, filters.category));
  if (filters.status) conds.push(eq(products.status, filters.status));
  const q = filters.q?.trim();
  if (q) {
    const pattern = `%${escapeLike(q)}%`;
    const cond = or(
      sql`${products.name} LIKE ${pattern} ESCAPE '\\'`,
      sql`${products.note} LIKE ${pattern} ESCAPE '\\'`,
    );
    if (cond) conds.push(cond);
  }
  return db.query.products.findMany({
    where: conds.length ? and(...conds) : undefined,
    orderBy: [
      sql`case when ${products.status} = 'sold' then 1 else 0 end`,
      desc(products.sortOrder),
      desc(products.createdAt),
    ],
    limit: filters.limit,
    with: withImages,
  });
}

/** Por slug, con imágenes ordenadas por position asc. null si no existe. */
export async function getProductBySlug(slug: string, db: Db = getDb()): Promise<ProductWithImages | null> {
  const row = await db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: withImages,
  });
  return row ?? null;
}

/** Por id, idem. */
export async function getProductById(id: string, db: Db = getDb()): Promise<ProductWithImages | null> {
  const row = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: withImages,
  });
  return row ?? null;
}

/** Últimos `n` con status 'available', createdAt desc. (Home: "El botín de esta semana".) */
export async function latestProducts(n: number, db: Db = getDb()): Promise<ProductWithImages[]> {
  return db.query.products.findMany({
    where: eq(products.status, 'available'),
    orderBy: [desc(products.createdAt)],
    limit: n,
    with: withImages,
  });
}

/** Hasta `n` con limited = true y status != 'sold', createdAt desc. */
export async function limitedProducts(n: number, db: Db = getDb()): Promise<ProductWithImages[]> {
  return db.query.products.findMany({
    where: and(eq(products.limited, true), ne(products.status, 'sold')),
    orderBy: [desc(products.createdAt)],
    limit: n,
    with: withImages,
  });
}

/** Últimos `n` de cualquier status, createdAt desc. (Dashboard admin.) */
export async function recentProducts(n: number, db: Db = getDb()): Promise<ProductWithImages[]> {
  return db.query.products.findMany({
    orderBy: [desc(products.createdAt)],
    limit: n,
    with: withImages,
  });
}

/** { available, reserved, sold, total } */
export async function countsByStatus(db: Db = getDb()): Promise<StatusCounts> {
  const rows = await db
    .select({ status: products.status, n: sql<number>`count(*)` })
    .from(products)
    .groupBy(products.status);
  const counts: StatusCounts = { available: 0, reserved: 0, sold: 0, total: 0 };
  for (const r of rows) {
    const n = Number(r.n);
    counts[r.status] = n;
    counts.total += n;
  }
  return counts;
}

/** true si existe un producto con ese slug (opcionalmente excluyendo un id). */
export async function slugExists(slug: string, excludeId?: string, db: Db = getDb()): Promise<boolean> {
  const rows = await db
    .select({ id: products.id })
    .from(products)
    .where(excludeId ? and(eq(products.slug, slug), ne(products.id, excludeId)) : eq(products.slug, slug))
    .limit(1);
  return rows.length > 0;
}
