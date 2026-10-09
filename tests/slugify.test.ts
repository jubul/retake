import { describe, expect, it } from 'vitest';
import { slugify } from '@/lib/utils/slugify';

describe('slugify', () => {
  it('quita acentos y paréntesis', () => {
    expect(slugify('Pokémon SoulSilver (JP)')).toBe('pokemon-soulsilver-jp');
  });

  it('colapsa separadores', () => {
    expect(slugify('DS Lite Crimson / Black')).toBe('ds-lite-crimson-black');
  });

  it('recorta signos y espacios', () => {
    expect(slugify('  ¡Ñandú!  ')).toBe('nandu');
  });

  it('devuelve vacío si no queda nada', () => {
    expect(slugify('')).toBe('');
    expect(slugify('¡¿?!')).toBe('');
  });

  it('limita a 80 caracteres sin guion final', () => {
    const out = slugify('a'.repeat(100));
    expect(out).toHaveLength(80);
    const withDash = slugify(`${'a'.repeat(79)} bbb`);
    expect(withDash).toBe('a'.repeat(79));
    expect(withDash.endsWith('-')).toBe(false);
  });
});
