import { eq } from 'drizzle-orm';
import type { Db } from '@/lib/db/client';
import { products } from '@/lib/db/schema';
import { insertProduct } from '@/lib/products/repo';
import { productInputSchema, type ProductInput } from '@/lib/products/schemas';
import type { Product } from '@/lib/products/types';

const DAY_MS = 24 * 60 * 60 * 1000;

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

/** Los 4 productos del mockup; createdAt escalonado (el primero es el más nuevo). */
export async function seedProducts(db: Db): Promise<Product[]> {
  const defs = [
    {
      name: 'Nintendo 3DS Gloss Pink',
      category: 'consolas',
      price: 350000,
      note: 'pantalla sin rayones, con cargador',
      year: 2013,
      featured: 'on',
    },
    {
      name: 'Nintendo 3DS Cosmo Black',
      category: 'consolas',
      price: 250000,
      note: 'la clásica. el 3D todavía marea',
      year: 2011,
    },
    {
      name: 'DS Lite Crimson / Black',
      category: 'consolas',
      price: 180000,
      note: 'bisagra firme, cosa rara',
      year: 2007,
      limited: 'on',
    },
    {
      name: 'Pokémon SoulSilver (JP)',
      category: 'cartuchos',
      price: 90000,
      note: 'en japonés, pero ya sabés qué hace',
      year: 2009,
    },
  ];
  const now = Date.now();
  const out: Product[] = [];
  for (const [i, d] of defs.entries()) {
    const p = await insertProduct(makeProductInput(d), db);
    await setCreatedAt(db, p.id, now - i * DAY_MS);
    out.push({ ...p, createdAt: new Date(now - i * DAY_MS) });
  }
  return out;
}
