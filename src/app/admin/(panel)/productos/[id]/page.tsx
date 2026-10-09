import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminHeading } from '@/components/admin/AdminHeading';
import { DeleteProductButton } from '@/components/admin/DeleteProductButton';
import { ImageManager } from '@/components/admin/ImageManager';
import { ProductForm } from '@/components/admin/ProductForm';
import { updateProduct } from '@/lib/products/actions';
import { getProductById } from '@/lib/products/queries';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <>
      <AdminHeading
        title={product.name}
        hint={product.slug}
        actions={
          <Link
            href={`/botin/${product.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="pixel underline underline-offset-4"
          >
            Ver en el sitio
          </Link>
        }
      />
      <div className="flex flex-col gap-12">
        <ProductForm action={updateProduct.bind(null, id)} product={product} submitLabel="Guardar" />
        <ImageManager productId={id} images={product.images} />
        <section aria-labelledby="peligro-title" className="max-w-2xl border-[3px] border-pink p-5">
          <h2 id="peligro-title" className="font-shout text-2xl uppercase">
            Zona peligro
          </h2>
          <p className="mb-4 mt-2 text-sm">Borra el producto y todas sus fotos. No se puede deshacer.</p>
          <DeleteProductButton id={id} name={product.name} />
        </section>
      </div>
    </>
  );
}
