import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@libsql/client', 'libsql', 'sharp'],
  experimental: { serverActions: { bodySizeLimit: '72mb' } },
};

export default nextConfig;
