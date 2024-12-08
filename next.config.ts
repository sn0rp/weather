import type { NextConfig } from "next";
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  images: {
    domains: ['tile.openstreetmap.org', 'tilecache.rainviewer.com'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: ['localhost:3000'],
    },
  },
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
})(nextConfig);
