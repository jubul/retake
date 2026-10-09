// src/lib/products/constants.ts  (sin dependencias: se importa desde cliente, servidor y schema; lo crea T01)
export const CATEGORY_VALUES = ['consolas', 'cartuchos', 'accesorios', 'estuches'] as const;
export const STATUS_VALUES = ['available', 'reserved', 'sold'] as const;

export type Category = (typeof CATEGORY_VALUES)[number];
export type Status = (typeof STATUS_VALUES)[number];

export const CATEGORIES: ReadonlyArray<{
  value: Category;
  label: string; // singular, para stamps y admin
  plural: string; // para títulos y nav
  hint: string; // línea "hand" del mockup
  icon: 'ds' | 'cart' | 'plug' | 'box';
}> = [
  { value: 'consolas', label: 'Consola', plural: 'Consolas', hint: 'DS, DS Lite, 3DS, New 3DS', icon: 'ds' },
  {
    value: 'cartuchos',
    label: 'Cartucho',
    plural: 'Cartuchos',
    hint: 'originales, en japonés',
    icon: 'cart',
  },
  {
    value: 'accesorios',
    label: 'Accesorio',
    plural: 'Accesorios',
    hint: 'cargadores, stylus, R4',
    icon: 'plug',
  },
  { value: 'estuches', label: 'Estuche', plural: 'Estuches', hint: 'para que no se raye', icon: 'box' },
];

export const STATUSES: ReadonlyArray<{ value: Status; label: string; stamp: 'cyan' | 'pink' | 'ink' }> = [
  { value: 'available', label: 'Disponible', stamp: 'cyan' },
  { value: 'reserved', label: 'Reservada', stamp: 'pink' },
  { value: 'sold', label: 'Vendida', stamp: 'ink' },
];

export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const IMAGE_MAX_BYTES = 8 * 1024 * 1024; // 8 MB por archivo
export const IMAGES_MAX_PER_PRODUCT = 8;
export const IMAGE_MAX_SIZE = 1600; // px, lado mayor
export const IMAGE_THUMB_SIZE = 480;

/** Imagen procesada lista para insertar. La produce storage/upload.ts (T03) y la consume products/repo.ts (T02). Vive acá para no cruzar tareas. */
export type NewImageData = { path: string; thumbPath: string; width: number; height: number; alt: string };

export function categoryLabel(value: Category): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}
export function statusLabel(value: Status): string {
  return STATUSES.find((s) => s.value === value)?.label ?? value;
}
