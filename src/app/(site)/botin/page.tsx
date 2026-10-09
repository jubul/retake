import type { Metadata } from 'next';
import { CatalogFilters } from '@/components/site/CatalogFilters';
import { ProductGrid } from '@/components/site/ProductGrid';
import { Hi, SectionHead, Wrap } from '@/components/ui';
import { parseCatalogFilters } from '@/lib/products/cached';
import { CATEGORIES } from '@/lib/products/constants';
import { listProducts } from '@/lib/products/queries';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { categoria } = await parseCatalogFilters(searchParams);
  return { title: CATEGORIES.find((c) => c.value === categoria)?.plural ?? 'Botín' };
}

export default async function CatalogPage({ searchParams }: Props) {
  const filters = await parseCatalogFilters(searchParams);
  const products = await listProducts({ category: filters.categoria, q: filters.q || undefined });

  return (
    <main className="sec">
      <Wrap>
        <SectionHead
          as="h1"
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
