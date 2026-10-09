import type { Category } from '@/lib/products/constants';

export type ConsolePalette = { shell: string; screen: string; screen2: string };
export type CartPalette = { shell: string; label: string };

export const CONSOLE_PALETTES: readonly ConsolePalette[] = [
  { shell: '#e8368f', screen: '#2de2ff', screen2: '#0a0a0a' },
  { shell: '#0a0a0a', screen: '#d9ff2d', screen2: '#ff2d8a' },
  { shell: '#c0202a', screen: '#f2efe6', screen2: '#2de2ff' },
  { shell: '#0a0a0a', screen: '#2de2ff', screen2: '#f2efe6' },
];

export const CART_PALETTES: readonly CartPalette[] = [
  { shell: '#4a4a4a', label: '#f2efe6' },
  { shell: '#777777', label: '#d9ff2d' },
];

/** Fondo de .photo por categoría. */
export function photoVariantFor(category: Category): 'paper' | 'cyan' | 'acid' | 'pink' {
  switch (category) {
    case 'consolas':
      return 'paper';
    case 'cartuchos':
      return 'cyan';
    case 'accesorios':
      return 'acid';
    case 'estuches':
      return 'pink';
  }
}
