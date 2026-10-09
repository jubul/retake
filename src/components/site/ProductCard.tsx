import Link from 'next/link';
import { Burst, Button, ProductArt, Sprite, Stamp, StatusStamp, Tape } from '@/components/ui';
import { CONSOLE_PALETTES } from '@/lib/pixel/palettes';
import { categoryLabel } from '@/lib/products/constants';
import type { ProductWithImages } from '@/lib/products/types';
import { photoVariantFor } from '@/lib/pixel/palettes';
import { cn } from '@/lib/utils/cn';
import { rot } from '@/lib/utils/css';
import { formatPrice } from '@/lib/utils/format';

const ROTATIONS = [-1.5, 1, -0.8, 1.4] as const;
const BURSTS = ['pink', 'cyan', 'acid', 'yellow'] as const;
const STAMP_ROTATIONS = [-3, 2, -2, 3] as const;

export function ProductCard({ product, index }: { product: ProductWithImages; index: number }) {
  const href = `/botin/${product.slug}`;
  const image = product.images[0];
  const variant = photoVariantFor(product.category);
  return (
    <article className={cn('card', product.status === 'sold' && 'sold')} style={rot(ROTATIONS[index % 4]!)}>
      <Tape />
      <Burst color={BURSTS[index % 4]!}>{formatPrice(product.price)}</Burst>
      <div className={cn('photo', variant !== 'pink' && variant)} style={{ aspectRatio: '1/1' }}>
        {image ? (
          <img
            src={`/uploads/${image.thumbPath}`}
            alt={product.name}
            width={image.width}
            height={image.height}
            loading={index === 0 ? undefined : 'lazy'}
            decoding="async"
          />
        ) : // Consolas rotan las paletas del mockup por posición; el resto usa el fallback por categoría.
        product.category === 'consolas' ? (
          <Sprite kind="ds" palette={CONSOLE_PALETTES[index % CONSOLE_PALETTES.length]!} />
        ) : (
          <ProductArt category={product.category} seed={product.slug} />
        )}
      </div>
      <div className="meta">
        <Stamp color={product.category === 'cartuchos' ? 'cyan' : 'pink'} r={STAMP_ROTATIONS[index % 4]}>
          {categoryLabel(product.category)}
        </Stamp>
        {product.status === 'reserved' ? <StatusStamp status="reserved" r={2} className="ml-2" /> : null}
        <h3>
          <Link href={href}>{product.name}</Link>
        </h3>
        <p className="hand note">{product.note}</p>
        <div className="row">
          <Button variant="ink" size="sm" href={href}>
            Lo quiero
          </Button>
          <span className="pixel">
            {product.origin} {'//'} {product.year ?? 's/d'}
          </span>
        </div>
      </div>
    </article>
  );
}
