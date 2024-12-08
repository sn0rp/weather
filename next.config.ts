import type { NextConfig } from "next";
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tile.openstreetmap.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'tilecache.rainviewer.com',
        pathname: '/**',
      }
    ],
    formats: ['image/avif', 'image/webp'],
    unoptimized: true
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
})(nextConfig);
