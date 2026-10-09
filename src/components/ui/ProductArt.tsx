import type { Category } from '@/lib/products/constants';
import { CART_PALETTES, CONSOLE_PALETTES } from '@/lib/pixel/palettes';
import { pick } from '@/lib/utils/random';
import { PixelIcon } from './PixelIcon';
import { Sprite } from './Sprite';

type ProductArtProps = {
  category: Category;
  seed: string;
  className?: string;
};

/** Fallback sin fotos: arte pixel según la categoría. Se dibuja dentro de un `.photo`. */
export function ProductArt({ category, seed, className }: ProductArtProps) {
  switch (category) {
    case 'consolas':
      return <Sprite kind="ds" palette={pick(seed, CONSOLE_PALETTES)} className={className} />;
    case 'cartuchos':
      return <Sprite kind="cart" palette={pick(seed, CART_PALETTES)} className={className} />;
    case 'accesorios':
      return <PixelIcon name="plug" color="var(--ink)" className={className ?? 'w-[62%]'} />;
    case 'estuches':
      return <PixelIcon name="box" color="var(--ink)" className={className ?? 'w-[62%]'} />;
  }
}
