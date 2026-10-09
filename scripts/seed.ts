import { pathToFileURL } from 'node:url';
import { createId } from '@paralleldrive/cuid2';
import { count } from 'drizzle-orm';
import { createDb, type Db } from '../src/lib/db/client';
import { productImages, products } from '../src/lib/db/schema';
import { getEnv } from '../src/lib/env';
import { getStorage } from '../src/lib/storage';
import type { NewProduct } from '../src/lib/products/types';

type SeedProduct = Pick<
  NewProduct,
  'name' | 'slug' | 'category' | 'price' | 'note' | 'year' | 'featured' | 'limited'
>;

/** Orden = más nuevo primero (createdAt escalonado: hoy, -1 día, -2, -3). */
export const SEED_PRODUCTS: readonly SeedProduct[] = [
  {
    name: 'Nintendo 3DS Gloss Pink',
    slug: 'nintendo-3ds-gloss-pink',
    category: 'consolas',
    price: 350000,
    note: 'pantalla sin rayones, con cargador',
    year: 2013,
    featured: true,
    limited: false,
  },
  {
    name: 'Nintendo 3DS Cosmo Black',
    slug: 'nintendo-3ds-cosmo-black',
    category: 'consolas',
    price: 250000,
    note: 'la clásica. el 3D todavía marea',
    year: 2011,
    featured: false,
    limited: false,
  },
  {
    name: 'DS Lite Crimson / Black',
    slug: 'ds-lite-crimson-black',
    category: 'consolas',
    price: 180000,
    note: 'bisagra firme, cosa rara',
    year: 2007,
    featured: false,
    limited: true,
  },
  {
    name: 'Pokémon SoulSilver (JP)',
    slug: 'pokemon-soulsilver-jp',
    category: 'cartuchos',
    price: 90000,
    note: 'en japonés, pero ya sabés qué hace',
    year: 2009,
    featured: false,
    limited: false,
  },
];

const DAY_MS = 24 * 60 * 60 * 1000;

/** Borra los archivos de storage de todas las fotos (errores ignorados: no deben frenar el reset). */
async function deleteAllImageFiles(db: Db): Promise<void> {
  const rows = await db
    .select({ path: productImages.path, thumbPath: productImages.thumbPath })
    .from(productImages);
  if (rows.length === 0) return;
  const storage = getStorage();
  await Promise.all(
    rows.flatMap((r) => [r.path, r.thumbPath]).map((key) => storage.delete(key).catch(() => undefined)),
  );
}

/** Siembra los productos del mockup. Sin `reset`, se omite si ya hay productos. */
export async function seedDb(
  db: Db,
  opts: { reset?: boolean } = {},
): Promise<{ inserted: number; skipped: boolean }> {
  if (opts.reset) {
    await deleteAllImageFiles(db);
    await db.delete(productImages);
    await db.delete(products);
  } else {
    const [row] = await db.select({ n: count() }).from(products);
    if ((row?.n ?? 0) > 0) return { inserted: 0, skipped: true };
  }
  const now = Date.now();
  await db.insert(products).values(
    SEED_PRODUCTS.map((p, i) => ({
      ...p,
      id: createId(),
      status: 'available' as const,
      origin: 'JP',
      createdAt: new Date(now - i * DAY_MS),
      updatedAt: new Date(now - i * DAY_MS),
    })),
  );
  return { inserted: SEED_PRODUCTS.length, skipped: false };
}

async function main(): Promise<void> {
  const reset = process.argv.includes('--reset');
  const env = getEnv();
  const { db, client } = createDb(env.DATABASE_URL, env.DATABASE_AUTH_TOKEN);
  try {
    const result = await seedDb(db, { reset });
    if (reset) console.log('reset: tablas vaciadas');
    if (result.skipped) {
      console.log('seed omitido: ya hay productos (usá --reset para volver a sembrar)');
    } else {
      console.log(`seed: ${result.inserted} productos insertados`);
    }
  } finally {
    client.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
}
