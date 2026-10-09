import { describe, expect, it } from 'vitest';
import { hashString, pick, seededRandom } from '@/lib/utils/random';

describe('random', () => {
  it('seededRandom is deterministic and seed-dependent', () => {
    const a1 = seededRandom('a');
    const a2 = seededRandom('a');
    const seqA = [a1(), a1(), a1()];
    expect(seqA).toEqual([a2(), a2(), a2()]);
    const b = seededRandom('b');
    expect(seqA).not.toEqual([b(), b(), b()]);
  });
  it('seededRandom stays in [0,1)', () => {
    const r = seededRandom(42);
    for (let i = 0; i < 200; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
  it('hashString is stable (FNV-1a)', () => {
    expect(hashString('')).toBe(0x811c9dc5);
    expect(hashString('a')).toBe(0xe40c292c);
  });
  it('pick is deterministic and returns a list member', () => {
    const list = ['x', 'y', 'z'] as const;
    expect(pick('seed', list)).toBe(pick('seed', list));
    expect(list).toContain(pick('other', list));
  });
});
