import { describe, expect, it } from 'vitest';
import { formatLongDate, formatStampDate } from '@/lib/utils/date';

describe('date utils', () => {
  it('formatStampDate gives dd.mm.yy', () => {
    expect(formatStampDate(new Date(2026, 9, 9))).toBe('09.10.26');
    expect(formatStampDate(new Date(2007, 0, 5))).toBe('05.01.07');
  });
  it('formatLongDate is in Spanish', () => {
    expect(formatLongDate(new Date(2026, 9, 9))).toBe('9 de octubre de 2026');
  });
});
