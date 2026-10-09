import { Burst, Polaroid, Sprite, Stamp, Sticker } from '@/components/ui';
import { CONSOLE_PALETTES } from '@/lib/pixel/palettes';
import type { ProductWithImages } from '@/lib/products/types';
import { formatStampDate } from '@/lib/utils/date';

export function HeroArt({ product }: { product: ProductWithImages | null }) {
  const image = product?.images[0];
  return (
    <div className="hero-art">
      <span className="hand doodle rot">¡mirá esto!</span>
      <Polaroid r={3} tapes="corners" caption={product?.name ?? 'New 3DS XL // Akihabara'}>
        <div className="photo">
          {image ? (
            <img
              src={`/uploads/${image.path}`}
              alt={product?.name ?? ''}
              width={image.width}
              height={image.height}
              loading="eager"
              decoding="async"
            />
          ) : (
            <Sprite kind="ds" palette={CONSOLE_PALETTES[0]!} />
          )}
        </div>
      </Polaroid>
      <Sticker className="s1">
        Importado
        <br />
        de Japón
      </Sticker>
      <Burst className="b1">
        ¡Recién
        <br />
        llegada!
      </Burst>
      <Stamp className="st1">Ingresó {formatStampDate(product?.createdAt ?? new Date())}</Stamp>
    </div>
  );
}
