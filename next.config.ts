import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@libsql/client', 'libsql', 'sharp'],
  experimental: { serverActions: { bodySizeLimit: '32mb' } },
};

export default nextConfig;
