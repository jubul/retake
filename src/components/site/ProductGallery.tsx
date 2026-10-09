'use client';

import { useState } from 'react';
import { Photo, Polaroid, ProductArt } from '@/components/ui';
import type { Category } from '@/lib/products/constants';
import type { ProductImage } from '@/lib/products/types';
import { photoVariantFor } from '@/lib/pixel/palettes';

type Props = { images: ProductImage[]; name: string; category: Category; seed: string };

export function ProductGallery({ images, name, category, seed }: Props) {
  const [index, setIndex] = useState(0);
  const current = images[index];
  const variant = photoVariantFor(category);

  return (
    <div>
      <Polaroid r={-1.5} tapes="top">
        {current ? (
          <Photo
            variant={variant}
            ratio="4/3"
            loading="eager"
            image={{
              src: `/uploads/${current.path}`,
              alt: name,
              width: current.width,
              height: current.height,
            }}
          />
        ) : (
          <Photo variant={variant} ratio="4/3">
            <ProductArt category={category} seed={seed} />
          </Photo>
        )}
      </Polaroid>
      {images.length > 1 ? (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 24 }}>
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              aria-pressed={i === index}
              aria-label={`Ver foto ${i + 1} de ${images.length}`}
              onClick={() => setIndex(i)}
              style={{
                width: 72,
                height: 72,
                padding: 0,
                border: `3px solid ${i === index ? 'var(--pink)' : 'var(--paper)'}`,
                background: 'var(--ink)',
                cursor: 'pointer',
              }}
            >
              <img
                src={`/uploads/${img.thumbPath}`}
                alt=""
                width={img.width}
                height={img.height}
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
