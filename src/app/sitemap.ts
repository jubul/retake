import type { MetadataRoute } from 'next';
import { listProducts } from '@/lib/products/queries';
import { publicEnv } from '@/lib/public-env';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = (await listProducts()).filter((p) => p.status !== 'sold');
  return [
    { url: `${publicEnv.siteUrl}/` },
    { url: `${publicEnv.siteUrl}/botin` },
    ...products.map((p) => ({ url: `${publicEnv.siteUrl}/botin/${p.slug}`, lastModified: p.updatedAt })),
  ];
}
