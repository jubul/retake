import { Button, Hi, SectionHead, Wrap } from '@/components/ui';
import type { ProductWithImages } from '@/lib/products/types';
import { ProductGrid } from './ProductGrid';

export function LatestLoot({ products }: { products: ProductWithImages[] }) {
  return (
    <section className="sec">
      <Wrap>
        <SectionHead
          id="botin"
          label="// 02 — Últimos ingresos"
          title={
            <>
              El <Hi color="cyan">botín</Hi> de esta semana
            </>
          }
          sub="Lo más nuevo que sumamos. Una unidad de cada una, sin excepción."
        />
        <ProductGrid products={products} />
        <div className="cta" style={{ marginTop: 48 }}>
          <Button href="/botin">Ver todo el botín</Button>
        </div>
      </Wrap>
    </section>
  );
}
