import { describe, expect, it } from 'vitest';
import { getReviews, reviewsSummary } from '@/content/reviews';

describe('reviews', () => {
  it('getReviews parses the static JSON', () => {
    expect(getReviews()).toHaveLength(3);
  });
  it('reviewsSummary averages stars', () => {
    const s = reviewsSummary(getReviews());
    expect(s.count).toBe(3);
    expect(s.average).toBeCloseTo(4.6667, 3);
    expect(s.averageLabel).toBe('4.7');
  });
  it('reviewsSummary handles empty lists', () => {
    expect(reviewsSummary([])).toEqual({ count: 0, average: 0, averageLabel: '0.0' });
  });
});
