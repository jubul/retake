import { AdminHeading } from '@/components/admin/AdminHeading';
import { ProductFilters } from '@/components/admin/ProductFilters';
import { ProductsTable } from '@/components/admin/ProductsTable';
import { Button } from '@/components/ui/Button';
import { listProducts } from '@/lib/products/queries';
import { catalogFiltersSchema } from '@/lib/products/schemas';

export const dynamic = 'force-dynamic';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  // Si un param viene repetido (?q=a&q=b) se usa el primero.
  const first = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
  const filters = catalogFiltersSchema.parse(first);
  const products = await listProducts({ category: filters.categoria, status: filters.estado, q: filters.q });
  return (
    <>
      <AdminHeading
        title="Productos"
        hint={`${products.length} en total`}
        actions={
          <Button href="/admin/productos/nuevo" variant="pink" size="sm">
            Nuevo producto
          </Button>
        }
      />
      <ProductFilters current={filters} />
      <ProductsTable products={products} />
    </>
  );
}
