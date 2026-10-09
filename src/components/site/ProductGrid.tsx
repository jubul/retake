import type { ProductWithImages } from '@/lib/products/types';
import { publicEnv } from '@/lib/public-env';
import { GENERIC_WHATSAPP_MESSAGE, whatsappUrl } from '@/lib/utils/whatsapp';
import { ProductCard } from './ProductCard';

export function ProductGrid({
  products,
  emptyText = 'Por ahora no hay nada acá.',
}: {
  products: ProductWithImages[];
  emptyText?: string;
}) {
  if (products.length === 0) {
    return (
      <p className="hand" style={{ fontSize: 24 }}>
        {emptyText}{' '}
        <a
          href={whatsappUrl(publicEnv.whatsappNumber, GENERIC_WHATSAPP_MESSAGE)}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--acid)' }}
        >
          Escribinos por WhatsApp y lo buscamos.
        </a>
      </p>
    );
  }
  return (
    <div className="cards">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} index={i} />
      ))}
    </div>
  );
}
