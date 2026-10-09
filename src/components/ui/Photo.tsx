import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type PhotoProps = {
  variant?: 'pink' | 'paper' | 'cyan' | 'acid';
  ratio?: '4/3' | '1/1';
  image?: { src: string; alt: string; width: number; height: number };
  loading?: 'lazy' | 'eager';
  className?: string;
  children?: ReactNode;
};

export function Photo({ variant = 'pink', ratio, image, loading = 'lazy', className, children }: PhotoProps) {
  return (
    <div
      className={cn('photo', variant !== 'pink' && variant, className)}
      style={ratio === undefined ? undefined : { aspectRatio: ratio }}
    >
      {image ? (
        <img
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          loading={loading}
          decoding="async"
        />
      ) : (
        children
      )}
    </div>
  );
}
