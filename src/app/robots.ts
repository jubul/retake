import type { MetadataRoute } from 'next';
import { publicEnv } from '@/lib/public-env';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', disallow: ['/admin', '/uploads'] },
    sitemap: `${publicEnv.siteUrl}/sitemap.xml`,
  };
}
