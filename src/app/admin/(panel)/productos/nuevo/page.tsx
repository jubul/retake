import { AdminHeading } from '@/components/admin/AdminHeading';
import { ProductForm } from '@/components/admin/ProductForm';
import { createProduct } from '@/lib/products/actions';

export const dynamic = 'force-dynamic';

export default function NewProductPage() {
  return (
    <>
      <AdminHeading title="Nuevo producto" hint="Las fotos se cargan después de guardar." />
      <ProductForm action={createProduct} submitLabel="Crear" />
    </>
  );
}
