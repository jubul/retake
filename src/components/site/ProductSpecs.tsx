import { categoryLabel, statusLabel } from '@/lib/products/constants';
import type { Product } from '@/lib/products/types';
import { formatStampDate } from '@/lib/utils/date';

export function ProductSpecs({ product }: { product: Product }) {
  const rows: Array<[string, string]> = [
    ['Categoría', categoryLabel(product.category)],
    ['Estado', statusLabel(product.status)],
    ['Origen', product.origin],
  ];
  if (product.year !== null) rows.push(['Año', String(product.year)]);
  rows.push(['Ingresó', formatStampDate(product.createdAt)]);
  return (
    <dl
      className="pixel"
      style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 24px', margin: '24px 0' }}
    >
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: 'contents' }}>
          <dt style={{ color: 'var(--cyan)' }}>{k}</dt>
          <dd style={{ margin: 0 }}>{v}</dd>
        </div>
      ))}
    </dl>
  );
}
