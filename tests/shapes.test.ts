import { describe, expect, it } from 'vitest';
import { burstClipPath, tornClipPath } from '@/lib/utils/shapes';

describe('shapes', () => {
  it('burstClipPath is a polygon with 28 points by default', () => {
    const p = burstClipPath();
    expect(p.startsWith('polygon(')).toBe(true);
    expect(p.split(',')).toHaveLength(28);
  });
  it('tornClipPath is deterministic per seed', () => {
    expect(tornClipPath('x')).toBe(tornClipPath('x'));
    expect(tornClipPath('x')).not.toBe(tornClipPath('y'));
    expect(tornClipPath('x').startsWith('polygon(')).toBe(true);
  });
});
