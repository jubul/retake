import { describe, expect, it } from 'vitest';
import { formatPrice } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { cssVars, rot } from '@/lib/utils/css';
import { gridToRects, GRIDS } from '@/lib/pixel/grids';
import { photoVariantFor } from '@/lib/pixel/palettes';

describe('formatPrice', () => {
  it('formats thousands with dots', () => {
    expect(formatPrice(350000)).toBe('$350.000');
    expect(formatPrice(1234567)).toBe('$1.234.567');
  });
  it('formats zero and small numbers', () => {
    expect(formatPrice(0)).toBe('$0');
    expect(formatPrice(999)).toBe('$999');
  });
  it('rounds and drops the sign', () => {
    expect(formatPrice(1999.6)).toBe('$2.000');
    expect(formatPrice(-1500)).toBe('$1.500');
  });
});

describe('ui helpers', () => {
  it('cn drops falsy parts', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b');
  });
  it('rot and cssVars set custom properties', () => {
    expect(rot(-2)).toEqual({ '--r': '-2deg' });
    expect(cssVars({ '--x': 1 }, { color: 'red' })).toEqual({ color: 'red', '--x': 1 });
  });
  it('gridToRects compresses runs', () => {
    expect(gridToRects(['XX.X', '....'])).toEqual([
      { x: 0, y: 0, w: 2 },
      { x: 3, y: 0, w: 1 },
    ]);
    expect(Object.keys(GRIDS)).toHaveLength(9);
  });
  it('photoVariantFor maps categories', () => {
    expect(photoVariantFor('consolas')).toBe('paper');
    expect(photoVariantFor('estuches')).toBe('pink');
  });
});
