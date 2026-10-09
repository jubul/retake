'use client';

import { useState, useTransition } from 'react';
import { deleteProduct } from '@/lib/products/actions';
import { FormErrors } from './FormErrors';

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<string[] | undefined>();

  function onClick() {
    if (!window.confirm(`¿Borrar "${name}"? No hay vuelta atrás.`)) return;
    setErrors(undefined);
    startTransition(async () => {
      // En éxito la action hace redirect y no retorna.
      const result = await deleteProduct(id);
      if (!result.ok) setErrors(result.errors.form ?? ['No pude borrarlo.']);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <FormErrors errors={errors} />
      <div>
        <button
          type="button"
          onClick={onClick}
          disabled={pending}
          aria-busy={pending}
          className="pixel border-[3px] border-ink bg-pink px-4 py-3 shadow-[4px_4px_0_var(--color-ink)] disabled:opacity-60"
        >
          {pending ? 'Borrando...' : 'Borrar producto'}
        </button>
      </div>
    </div>
  );
}
