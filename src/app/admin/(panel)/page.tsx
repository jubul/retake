import { AdminHeading } from '@/components/admin/AdminHeading';
import { ProductsTable } from '@/components/admin/ProductsTable';
import { StatCard } from '@/components/admin/StatCard';
import { Button } from '@/components/ui/Button';
import { countsByStatus, recentProducts } from '@/lib/products/queries';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [counts, recent] = await Promise.all([countsByStatus(), recentProducts(5)]);
  return (
    <>
      <AdminHeading
        title="Panel"
        actions={
          <Button href="/admin/productos/nuevo" variant="pink" size="sm">
            Nuevo producto
          </Button>
        }
      />
      <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Disponibles" value={counts.available} tone="cyan" />
        <StatCard label="Reservadas" value={counts.reserved} tone="pink" />
        <StatCard label="Vendidas" value={counts.sold} tone="acid" />
        <StatCard label="Total" value={counts.total} />
      </div>
      <h2 className="pixel mb-3">Últimos productos</h2>
      <ProductsTable products={recent} />
    </>
  );
}
