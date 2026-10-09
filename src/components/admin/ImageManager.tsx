'use client';

import { useActionState, useState, useTransition } from 'react';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { addProductImages, removeProductImage, reorderProductImages } from '@/lib/products/actions';
import type { ActionResult, ProductImage } from '@/lib/products/types';
import { FormErrors } from './FormErrors';

const BTN =
  'pixel border-[3px] border-ink bg-white px-2 py-1 shadow-[2px_2px_0_var(--color-ink)] disabled:opacity-40';

export function ImageManager({ productId, images }: { productId: string; images: ProductImage[] }) {
  const [uploadState, uploadAction] = useActionState<ActionResult | null, FormData>(
    addProductImages.bind(null, productId),
    null,
  );
  const [pending, startTransition] = useTransition();
  const [actionErrors, setActionErrors] = useState<string[] | undefined>();

  const uploadErrors = uploadState && !uploadState.ok ? uploadState.errors.form : undefined;

  function run(task: () => Promise<ActionResult>) {
    setActionErrors(undefined);
    startTransition(async () => {
      const result = await task();
      if (!result.ok) setActionErrors(result.errors.form ?? ['No pude completar la acción.']);
    });
  }

  function move(index: number, delta: -1 | 1) {
    const ids = images.map((i) => i.id);
    const target = index + delta;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target]!, ids[index]!];
    run(() => reorderProductImages(productId, ids));
  }

  function remove(image: ProductImage) {
    if (!window.confirm('¿Borrar esta foto?')) return;
    run(() => removeProductImage(productId, image.id));
  }

  return (
    <section aria-labelledby="fotos-title" className="flex max-w-2xl flex-col gap-5">
      <h2 id="fotos-title" className="font-shout text-2xl uppercase">
        Fotos
      </h2>

      <form
        action={uploadAction}
        className="flex flex-col gap-3 border-[3px] border-ink bg-white p-5 shadow-[4px_4px_0_var(--color-ink)]"
      >
        <label htmlFor="images" className="pixel">
          Subir fotos
        </label>
        <p className="pixel text-ink/75">Hasta 8 fotos, 8 MB c/u. La primera es la principal.</p>
        <input
          id="images"
          name="images"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="w-full border-[3px] border-ink bg-white p-2 font-body"
        />
        <FormErrors errors={uploadErrors} />
        <div>
          <SubmitButton variant="ink" size="sm" pendingLabel="Subiendo...">
            Subir
          </SubmitButton>
        </div>
      </form>

      <FormErrors errors={actionErrors} />

      {images.length === 0 ? (
        <p className="pixel">Todavía no hay fotos.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {images.map((image, index) => (
            <li
              key={image.id}
              className="flex flex-col gap-2 border-[3px] border-ink bg-white p-2 shadow-[4px_4px_0_var(--color-ink)]"
            >
              <img
                src={`/uploads/${image.thumbPath}`}
                alt={image.alt}
                width={image.width}
                height={image.height}
                className="aspect-square w-full object-cover"
              />
              <p className="pixel">{index === 0 ? 'Principal' : `Foto ${index + 1}`}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={BTN}
                  disabled={pending || index === 0}
                  onClick={() => move(index, -1)}
                  aria-label={`Subir foto ${index + 1}`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className={BTN}
                  disabled={pending || index === images.length - 1}
                  onClick={() => move(index, 1)}
                  aria-label={`Bajar foto ${index + 1}`}
                >
                  ↓
                </button>
                <button type="button" className={BTN} disabled={pending} onClick={() => remove(image)}>
                  Borrar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
