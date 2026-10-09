import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { productInputSchema, toFieldErrors } from '@/lib/products/schemas';
import { formDataToObject } from '@/lib/utils/form';

describe('toFieldErrors', () => {
  it('errores de campo → fields, sin form', () => {
    const r = productInputSchema.safeParse({ name: 'a', category: 'x', price: 'abc' });
    expect(r.success).toBe(false);
    if (r.success) return;
    const out = toFieldErrors(r.error);
    expect(out.form).toBeUndefined();
    expect(Object.keys(out.fields ?? {}).sort()).toEqual(['category', 'name', 'price']);
    expect(out.fields?.name).toEqual(['Poné un nombre (mínimo 2 letras)']);
    expect(out.fields?.category).toEqual(['Elegí una categoría']);
  });

  it('errores de form (a nivel objeto) → form, sin fields', () => {
    const schema = z.object({ a: z.string() }).refine(() => false, { error: 'Mal todo' });
    const r = schema.safeParse({ a: 'x' });
    if (r.success) throw new Error('debía fallar');
    expect(toFieldErrors(r.error)).toEqual({ form: ['Mal todo'], fields: undefined });
  });

  it('mezcla form y field', () => {
    const schema = z
      .object({ a: z.string().min(3, { error: 'corto' }), b: z.string() })
      .superRefine((_v, ctx) => ctx.addIssue({ code: 'custom', message: 'general' }));
    const r = schema.safeParse({ a: 'x', b: 'y' });
    if (r.success) throw new Error('debía fallar');
    const out = toFieldErrors(r.error);
    expect(out.fields).toEqual({ a: ['corto'] });
    expect(out.form).toEqual(['general']);
  });

  it('acumula varios mensajes en un mismo campo', () => {
    const schema = z.object({ s: z.string().min(5, { error: 'min' }).regex(/^\d+$/, { error: 'num' }) });
    const r = schema.safeParse({ s: 'ab' });
    if (r.success) throw new Error('debía fallar');
    expect(toFieldErrors(r.error).fields?.s).toEqual(['min', 'num']);
  });

  it('el resultado sobrevive a un roundtrip JSON (useActionState)', () => {
    const r = productInputSchema.safeParse({});
    if (r.success) throw new Error('debía fallar');
    const out = toFieldErrors(r.error);
    expect(out.fields).toBeDefined();
    expect(JSON.parse(JSON.stringify(out))).toEqual({ fields: out.fields });
  });
});

describe('formDataToObject', () => {
  it('convierte un FormData real', () => {
    const fd = new FormData();
    fd.set('name', 'Foo');
    fd.set('price', '100');
    expect(formDataToObject(fd)).toEqual({ name: 'Foo', price: '100' });
  });

  it('el último valor gana con claves repetidas', () => {
    const fd = new FormData();
    fd.append('k', 'uno');
    fd.append('k', 'dos');
    expect(formDataToObject(fd)).toEqual({ k: 'dos' });
  });

  it('deja los File como File', () => {
    const fd = new FormData();
    fd.set('img', new File(['x'], 'a.png', { type: 'image/png' }));
    const out = formDataToObject(fd);
    expect(out.img).toBeInstanceOf(File);
    expect((out.img as File).name).toBe('a.png');
  });

  it('FormData vacío → {}', () => {
    expect(formDataToObject(new FormData())).toEqual({});
  });

  it('checkbox ausente: la clave no existe y el schema da false', () => {
    const fd = new FormData();
    fd.set('name', 'Foo');
    fd.set('category', 'consolas');
    fd.set('price', '10');
    fd.set('sortOrder', '');
    fd.set('year', '');
    const obj = formDataToObject(fd);
    expect('featured' in obj).toBe(false);
    const parsed = productInputSchema.parse(obj);
    expect(parsed.featured).toBe(false);
    expect(parsed.limited).toBe(false);
    expect(parsed.sortOrder).toBe(0);
    expect(parsed.year).toBeNull();
    expect(parsed.slug).toBeUndefined();
  });

  it('checkbox presente ("on") → true', () => {
    const fd = new FormData();
    fd.set('name', 'Foo');
    fd.set('category', 'consolas');
    fd.set('price', '10');
    fd.set('featured', 'on');
    expect(productInputSchema.parse(formDataToObject(fd)).featured).toBe(true);
  });

  it('FormData inválido → toFieldErrors con los nombres de campo del form', () => {
    const fd = new FormData();
    fd.set('name', '');
    fd.set('category', '');
    fd.set('price', '');
    const r = productInputSchema.safeParse(formDataToObject(fd));
    if (r.success) throw new Error('debía fallar');
    const out = toFieldErrors(r.error);
    expect(Object.keys(out.fields ?? {})).toEqual(expect.arrayContaining(['name', 'category']));
  });
});
