'use client';

import Link from 'next/link';
import { useActionState, useState, type ChangeEvent } from 'react';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { CATEGORIES, STATUSES } from '@/lib/products/constants';
import type { ActionResult, ProductWithImages } from '@/lib/products/types';
import { slugify } from '@/lib/utils/slugify';
import { Checkbox } from './Checkbox';
import { Field, fieldProps } from './Field';
import { FormErrors } from './FormErrors';
import { Input } from './Input';
import { Select } from './Select';
import { Textarea } from './Textarea';

type ProductFormProps = {
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  product?: ProductWithImages;
  submitLabel: string;
};

type Values = {
  name: string;
  slug: string;
  category: string;
  price: string;
  status: string;
  note: string;
  description: string;
  year: string;
  origin: string;
  featured: boolean;
  limited: boolean;
  sortOrder: string;
};

function initialValues(product?: ProductWithImages): Values {
  return {
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    category: product?.category ?? 'consolas',
    price: product ? String(product.price) : '',
    status: product?.status ?? 'available',
    note: product?.note ?? '',
    description: product?.description ?? '',
    year: product?.year != null ? String(product.year) : '',
    origin: product?.origin ?? 'JP',
    featured: product?.featured ?? false,
    limited: product?.limited ?? false,
    sortOrder: product ? String(product.sortOrder) : '0',
  };
}

const GROUP = 'flex flex-col gap-5 border-[3px] border-ink bg-white p-5 shadow-[4px_4px_0_var(--color-ink)]';

export function ProductForm({ action, product, submitLabel }: ProductFormProps) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(action, null);
  // Controlado: React 19 resetea los inputs no controlados después de cada action, y se perdería lo tipeado si hay errores.
  const [values, setValues] = useState<Values>(() => initialValues(product));
  const [slugTouched, setSlugTouched] = useState(Boolean(product));

  const errors = state && !state.ok ? state.errors : undefined;
  const fields = errors?.fields ?? {};

  const onText =
    (key: keyof Values) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }));
  const onCheck = (key: 'featured' | 'limited') => (e: ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.checked }));

  const onName = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValues((v) => ({ ...v, name, slug: slugTouched ? v.slug : slugify(name) }));
  };
  const onSlug = (e: ChangeEvent<HTMLInputElement>) => {
    setSlugTouched(true);
    setValues((v) => ({ ...v, slug: e.target.value }));
  };

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-8" noValidate>
      <FormErrors errors={errors?.form} />
      {state?.ok ? (
        <p role="status" className="border-[3px] border-ink bg-acid p-3 text-sm font-bold">
          Guardado.
        </p>
      ) : null}

      <fieldset className={GROUP}>
        <legend className="pixel bg-ink px-2 py-1 text-paper">Lo básico</legend>
        <Field label="Nombre" name="name" error={fields.name}>
          <Input {...fieldProps('name', fields.name)} value={values.name} onChange={onName} required />
        </Field>
        <Field
          label="Slug"
          name="slug"
          error={fields.slug}
          hint="La URL del producto. Si lo dejás vacío se arma con el nombre."
        >
          <Input {...fieldProps('slug', fields.slug)} value={values.slug} onChange={onSlug} />
        </Field>
        <Field label="Categoría" name="category" error={fields.category}>
          <Select
            {...fieldProps('category', fields.category)}
            value={values.category}
            onChange={onText('category')}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Precio (ARS)" name="price" error={fields.price}>
          <Input
            {...fieldProps('price', fields.price)}
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={values.price}
            onChange={onText('price')}
            required
          />
        </Field>
        <Field label="Estado" name="status" error={fields.status}>
          <Select {...fieldProps('status', fields.status)} value={values.status} onChange={onText('status')}>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </Field>
      </fieldset>

      <fieldset className={GROUP}>
        <legend className="pixel bg-ink px-2 py-1 text-paper">Detalle</legend>
        <Field
          label="Nota corta"
          name="note"
          error={fields.note}
          hint="Ej: pantalla sin rayones, con cargador. Máx. 120."
        >
          <Input
            {...fieldProps('note', fields.note)}
            value={values.note}
            onChange={onText('note')}
            maxLength={120}
          />
        </Field>
        <Field label="Descripción" name="description" error={fields.description}>
          <Textarea
            {...fieldProps('description', fields.description)}
            rows={5}
            value={values.description}
            onChange={onText('description')}
          />
        </Field>
        <Field label="Año" name="year" error={fields.year}>
          <Input
            {...fieldProps('year', fields.year)}
            type="number"
            inputMode="numeric"
            value={values.year}
            onChange={onText('year')}
          />
        </Field>
        <Field label="Origen" name="origin" error={fields.origin}>
          <Input
            {...fieldProps('origin', fields.origin)}
            value={values.origin}
            onChange={onText('origin')}
            maxLength={10}
          />
        </Field>
      </fieldset>

      <fieldset className={GROUP}>
        <legend className="pixel bg-ink px-2 py-1 text-paper">Destacar</legend>
        <div className="flex items-center gap-3">
          <Checkbox
            {...fieldProps('featured', fields.featured)}
            checked={values.featured}
            onChange={onCheck('featured')}
          />
          <label htmlFor="featured" className="pixel">
            Destacado
          </label>
        </div>
        <div className="flex items-center gap-3">
          <Checkbox
            {...fieldProps('limited', fields.limited)}
            checked={values.limited}
            onChange={onCheck('limited')}
          />
          <label htmlFor="limited" className="pixel">
            Edición limitada
          </label>
        </div>
        <Field label="Orden" name="sortOrder" error={fields.sortOrder} hint="Más alto = aparece antes.">
          <Input
            {...fieldProps('sortOrder', fields.sortOrder)}
            type="number"
            inputMode="numeric"
            value={values.sortOrder}
            onChange={onText('sortOrder')}
          />
        </Field>
      </fieldset>

      <div className="flex flex-wrap items-center gap-5">
        <SubmitButton variant="pink" pendingLabel="Guardando...">
          {submitLabel}
        </SubmitButton>
        <Link href="/admin/productos" className="pixel underline underline-offset-4">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
