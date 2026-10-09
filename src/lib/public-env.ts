// src/lib/public-env.ts  (usable en cliente y servidor; referencias literales para que Next las inyecte)
export const publicEnv = {
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, ''),
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '',
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM ?? '',
} as const;
