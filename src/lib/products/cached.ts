import { cache } from 'react';
import { getProductBySlug } from './queries';
import { catalogFiltersSchema } from './schemas';

/** Una sola query por request: generateMetadata y la página comparten el resultado. Solo servidor. */
export const getProductBySlugCached = cache((slug: string) => getProductBySlug(slug));

/** searchParams puede traer arrays (?q=a&q=b): nos quedamos con el primero. Cacheado por el objeto searchParams. */
export const parseCatalogFilters = cache(
  async (searchParams: Promise<Record<string, string | string[] | undefined>>) => {
    const raw = await searchParams;
    const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
    return catalogFiltersSchema.parse({
      categoria: first(raw.categoria),
      estado: first(raw.estado),
      q: first(raw.q),
    });
  },
);
