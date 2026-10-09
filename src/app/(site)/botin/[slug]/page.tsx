import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductCta } from '@/components/site/ProductCta';
import { ProductGallery } from '@/components/site/ProductGallery';
import { ProductSpecs } from '@/components/site/ProductSpecs';
import { Burst, Stamp, StatusStamp, Wrap } from '@/components/ui';
import { categoryLabel } from '@/lib/products/constants';
import { getProductBySlug } from '@/lib/products/queries';
import { formatPrice } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'No encontrado' };
  const image = product.images[0];
  return {
    title: product.name,
    description: product.note || undefined,
    openGraph: image
      ? {
          images: [
            { url: `/uploads/${image.path}`, width: image.width, height: image.height, alt: product.name },
          ],
        }
      : undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <main className="sec">
      <Wrap>
        <div className="grid items-start gap-12 md:grid-cols-2">
          <ProductGallery
            images={product.images}
            name={product.name}
            category={product.category}
            seed={product.slug}
          />
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Stamp color={product.category === 'cartuchos' ? 'cyan' : 'pink'} r={-2}>
                {categoryLabel(product.category)}
              </Stamp>
              <StatusStamp status={product.status} r={2} />
            </div>
            <h1 className="h2">{product.name}</h1>
            <div className="relative my-4" style={{ height: 140 }}>
              <Burst color="acid" size={130} r={8}>
                {formatPrice(product.price)}
              </Burst>
            </div>
            {product.note ? <p className="hand note text-2xl">{product.note}</p> : null}
            {product.description ? <p className="mt-4 whitespace-pre-line">{product.description}</p> : null}
            <ProductSpecs product={product} />
            <ProductCta product={product} />
          </div>
        </div>
      </Wrap>
    </main>
  );
}
