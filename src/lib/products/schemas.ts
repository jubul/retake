import { z } from 'zod';
import {
  CATEGORY_VALUES,
  IMAGE_MAX_BYTES,
  IMAGE_MIME_TYPES,
  IMAGES_MAX_PER_PRODUCT,
  STATUS_VALUES,
} from './constants';

// Helpers para FormData: '' → null, checkbox ausente → false
const emptyToNull = (v: unknown) =>
  v === undefined || (typeof v === 'string' && v.trim() === '') ? null : v;
const checkbox = z.preprocess((v) => v === 'on' || v === 'true' || v === true, z.boolean());
const optionalInt = (min: number, max: number) =>
  z.preprocess(emptyToNull, z.coerce.number().int('Sin decimales').min(min).max(max).nullable());
const optionalText = (max: number) => z.preprocess(emptyToNull, z.string().trim().max(max).nullable());

export const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { error: 'Solo minúsculas, números y guiones' });

export const productInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: 'Poné un nombre (mínimo 2 letras)' })
    .max(120, { error: 'Máximo 120 caracteres' }),
  // vacío = se genera desde name
  slug: z.preprocess(emptyToNull, slugSchema.nullable()).transform((v) => v ?? undefined),
  category: z.enum(CATEGORY_VALUES, { error: 'Elegí una categoría' }),
  price: z.coerce.number({ error: 'Poné un precio' }).int({ error: 'Sin decimales' }).min(0).max(99_999_999),
  status: z.enum(STATUS_VALUES, { error: 'Elegí un estado' }).default('available'),
  note: z.string().trim().max(120, { error: 'Máximo 120 caracteres' }).default(''),
  description: optionalText(2000),
  year: optionalInt(1980, 2035),
  origin: z.string().trim().min(1).max(10).default('JP'),
  featured: checkbox.default(false),
  limited: checkbox.default(false),
  sortOrder: z
    .preprocess(emptyToNull, z.coerce.number().int().min(-9999).max(9999).nullable())
    .transform((v) => v ?? 0),
});

export type ProductInput = z.output<typeof productInputSchema>;

export const imageFileSchema = z
  .instanceof(File)
  .refine((f) => f.size > 0, { error: 'Archivo vacío' })
  .refine((f) => f.size <= IMAGE_MAX_BYTES, { error: 'Máximo 8 MB por foto' })
  .refine((f) => (IMAGE_MIME_TYPES as readonly string[]).includes(f.type), {
    error: 'Solo JPG, PNG o WebP',
  });

export const imageFilesSchema = z
  .array(imageFileSchema)
  .min(1, { error: 'Elegí al menos una foto' })
  .max(IMAGES_MAX_PER_PRODUCT, { error: `Máximo ${IMAGES_MAX_PER_PRODUCT} fotos por producto` });

export const loginSchema = z.object({
  password: z.string().min(1, { error: 'Escribí la contraseña' }),
});

/** searchParams del catálogo público y del admin. Valores inválidos se ignoran (catch). */
export const catalogFiltersSchema = z.object({
  categoria: z.enum(CATEGORY_VALUES).optional().catch(undefined),
  estado: z.enum(STATUS_VALUES).optional().catch(undefined),
  q: z.string().trim().max(60).optional().catch(undefined),
});
export type CatalogFilters = z.output<typeof catalogFiltersSchema>;

/** Convierte un ZodError a FieldErrors (shape de ActionResult). */
export function toFieldErrors(error: z.ZodError): {
  form?: string[];
  fields?: Record<string, string[]>;
} {
  const flat = z.flattenError(error) as {
    formErrors: string[];
    fieldErrors: Record<string, string[] | undefined>;
  };
  const fields: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(flat.fieldErrors)) if (v && v.length) fields[k] = v;
  return {
    form: flat.formErrors.length ? flat.formErrors : undefined,
    fields: Object.keys(fields).length ? fields : undefined,
  };
}
