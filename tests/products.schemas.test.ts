import { describe, expect, it } from 'vitest';
import { IMAGE_MAX_BYTES } from '@/lib/products/constants';
import {
  catalogFiltersSchema,
  imageFileSchema,
  imageFilesSchema,
  productInputSchema,
  toFieldErrors,
} from '@/lib/products/schemas';

const validForm = {
  name: 'Nintendo 3DS',
  slug: '',
  category: 'consolas',
  price: '350000',
  status: 'available',
  note: 'con cargador',
  description: '',
  year: '',
  origin: 'JP',
  sortOrder: '',
};

describe('productInputSchema', () => {
  it('parsea un form de strings con los tipos correctos', () => {
    const r = productInputSchema.safeParse(validForm);
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.price).toBe(350000);
    expect(r.data.featured).toBe(false);
    expect(r.data.limited).toBe(false);
    expect(r.data.year).toBeNull();
    expect(r.data.description).toBeNull();
    expect(r.data.slug).toBeUndefined();
    expect(r.data.sortOrder).toBe(0);
  });

  it('interpreta checkboxes y año', () => {
    const r = productInputSchema.safeParse({ ...validForm, featured: 'on', year: '2013', slug: 'mi-slug' });
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.featured).toBe(true);
    expect(r.data.year).toBe(2013);
    expect(r.data.slug).toBe('mi-slug');
  });

  it('precio vacío falla con "Poné un precio"; "0" sigue siendo válido', () => {
    for (const price of ['', '   ']) {
      const r = productInputSchema.safeParse({ ...validForm, price });
      expect(r.success).toBe(false);
      if (!r.success) expect(toFieldErrors(r.error).fields?.price?.[0]).toBe('Poné un precio');
    }
    const zero = productInputSchema.safeParse({ ...validForm, price: '0' });
    expect(zero.success && zero.data.price).toBe(0);
  });

  it('error de categoría en español', () => {
    const r = productInputSchema.safeParse({ ...validForm, category: 'x' });
    expect(r.success).toBe(false);
    if (r.success) return;
    expect(toFieldErrors(r.error).fields?.category?.[0]).toBe('Elegí una categoría');
  });

  it('rechaza slug inválido y precio con decimales', () => {
    const r = productInputSchema.safeParse({ ...validForm, slug: 'Mal Slug', price: '10.5' });
    expect(r.success).toBe(false);
    if (r.success) return;
    const fields = toFieldErrors(r.error).fields;
    expect(fields?.slug?.[0]).toBe('Solo minúsculas, números y guiones');
    expect(fields?.price).toBeDefined();
  });
});

describe('imageFileSchema', () => {
  it('acepta un jpeg chico', () => {
    const f = new File([new Uint8Array(10)], 'a.jpg', { type: 'image/jpeg' });
    expect(imageFileSchema.safeParse(f).success).toBe(true);
  });

  it('rechaza archivos demasiado grandes', () => {
    const f = new File([new Uint8Array(IMAGE_MAX_BYTES + 1)], 'a.jpg', { type: 'image/jpeg' });
    expect(imageFileSchema.safeParse(f).success).toBe(false);
  });

  it('rechaza gif', () => {
    const f = new File([new Uint8Array(10)], 'a.gif', { type: 'image/gif' });
    expect(imageFileSchema.safeParse(f).success).toBe(false);
  });

  it('imageFilesSchema exige entre 1 y 8', () => {
    const f = new File([new Uint8Array(10)], 'a.jpg', { type: 'image/jpeg' });
    expect(imageFilesSchema.safeParse([]).success).toBe(false);
    expect(imageFilesSchema.safeParse(Array(9).fill(f)).success).toBe(false);
    expect(imageFilesSchema.safeParse([f]).success).toBe(true);
  });

  it('imageFilesSchema acepta 8 fotos de 8 MB (64 MB en total, el tope)', () => {
    const big = new File([new Uint8Array(1)], 'a.jpg', { type: 'image/jpeg' });
    Object.defineProperty(big, 'size', { value: IMAGE_MAX_BYTES });
    expect(imageFilesSchema.safeParse(Array(8).fill(big)).success).toBe(true);
  });
});

describe('catalogFiltersSchema', () => {
  it('ignora valores inválidos', () => {
    expect(catalogFiltersSchema.parse({ categoria: 'zzz', estado: 'sold', q: ' ds ' })).toEqual({
      categoria: undefined,
      estado: 'sold',
      q: 'ds',
    });
  });
});
