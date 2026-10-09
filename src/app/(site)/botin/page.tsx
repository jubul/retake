import type { Metadata } from 'next';
import { CatalogFilters } from '@/components/site/CatalogFilters';
import { ProductGrid } from '@/components/site/ProductGrid';
import { Hi, SectionHead, Wrap } from '@/components/ui';
import { listProducts } from '@/lib/products/queries';
import { catalogFiltersSchema } from '@/lib/products/schemas';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** searchParams puede traer arrays (?q=a&q=b): nos quedamos con el primero. */
async function parseFilters(searchParams: Props['searchParams']) {
  const raw = await searchParams;
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  return catalogFiltersSchema.parse({
    categoria: first(raw.categoria),
    estado: first(raw.estado),
    q: first(raw.q),
  });
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { categoria } = await parseFilters(searchParams);
  return { title: categoria === 'consolas' ? 'Consolas' : 'Botín' };
}

export default async function CatalogPage({ searchParams }: Props) {
  const filters = await parseFilters(searchParams);
  const products = await listProducts({ category: filters.categoria, q: filters.q || undefined });

  return (
    <main className="sec">
      <Wrap>
        <SectionHead
          label="// Botín"
          title={
            <>
              Todo el <Hi>botín</Hi>
            </>
          }
          sub="Lo que hay hoy. Lo vendido queda al fondo, de recuerdo."
          className="mb-10"
        />
        <CatalogFilters current={filters} total={products.length} />
        <ProductGrid products={products} emptyText="No encontramos nada con ese filtro." />
      </Wrap>
    </main>
  );
}
