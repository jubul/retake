import type { products, productImages } from '@/lib/db/schema';
import type { Category, Status } from './constants';

export type { Category, Status };
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductImage = typeof productImages.$inferSelect;
export type NewProductImage = typeof productImages.$inferInsert;
export type ProductWithImages = Product & { images: ProductImage[] }; // images ordenadas por position asc

export type ListFilters = {
  category?: Category;
  status?: Status;
  q?: string; // busca en name y note (LIKE, case-insensitive)
  limit?: number;
};

export type StatusCounts = Record<Status, number> & { total: number };

export type FieldErrors = {
  form?: string[]; // errores generales
  fields?: Record<string, string[]>; // por nombre de campo del form
};

export type ActionResult = { ok: true; id: string } | { ok: false; errors: FieldErrors };
