import { z } from 'zod';
import reviewsData from './reviews.json';

export const reviewSchema = z.object({
  id: z.string(),
  author: z.string(),
  date: z.iso.date(),
  stars: z.number().int().min(1).max(5),
  text: z.string().min(1),
});
export type Review = z.infer<typeof reviewSchema>;

/** Parsea el JSON (lanza si está mal). */
export function getReviews(): Review[] {
  return z.array(reviewSchema).parse(reviewsData);
}

/** 4.67 -> "4.7" */
export function reviewsSummary(reviews: Review[]): { count: number; average: number; averageLabel: string } {
  const count = reviews.length;
  const average = count === 0 ? 0 : reviews.reduce((sum, r) => sum + r.stars, 0) / count;
  return { count, average, averageLabel: average.toFixed(1) };
}
