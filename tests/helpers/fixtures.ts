import { desc, eq } from 'drizzle-orm';
import { seedDb } from '../../scripts/seed';
import type { Db } from '@/lib/db/client';
import { products } from '@/lib/db/schema';
import { productInputSchema, type ProductInput } from '@/lib/products/schemas';
import type { Product } from '@/lib/products/types';

/** ProductInput válido (pasa por el schema real, como lo haría un FormData). */
export function makeProductInput(overrides: Record<string, unknown> = {}): ProductInput {
  return productInputSchema.parse({
    name: 'Producto de prueba',
    category: 'consolas',
    price: '1000',
    ...overrides,
  });
}

export function makeImage(n: number) {
  return { path: `p/${n}.webp`, thumbPath: `p/${n}-thumb.webp`, width: 10, height: 10, alt: `img ${n}` };
}

export async function setCreatedAt(db: Db, id: string, ms: number): Promise<void> {
  await db
    .update(products)
    .set({ createdAt: new Date(ms) })
    .where(eq(products.id, id));
}

/** Los 4 productos del mockup (delegado a scripts/seed.ts); createdAt escalonado, el primero es el más nuevo. */
export async function seedProducts(db: Db): Promise<Product[]> {
  await seedDb(db);
  return db.select().from(products).orderBy(desc(products.createdAt));
}
