import { Hi, Marquee, SectionHead, Wrap } from '@/components/ui';
import type { ProductWithImages } from '@/lib/products/types';
import { ProductGrid } from './ProductGrid';

export function LimitedEditions({ products }: { products: ProductWithImages[] }) {
  return (
    <>
      <Marquee
        color="acid"
        items={['Ediciones limitadas', 'Una unidad de cada una', 'Cuando se va, se va']}
      />
      {products.length > 0 ? (
        <section className="sec">
          <Wrap>
            <SectionHead
              label="// 02b — Ediciones limitadas"
              title={
                <>
                  Una <Hi color="pink">sola</Hi> de cada una
                </>
              }
            />
            <div style={{ maxWidth: products.length * 300 }}>
              <ProductGrid products={products} />
            </div>
          </Wrap>
        </section>
      ) : null}
    </>
  );
}
