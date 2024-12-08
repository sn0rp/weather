interface RuntimeCachingRule {
  urlPattern: RegExp | string;
  handler: string;
  options?: {
    cacheName?: string;
    expiration?: {
      maxEntries?: number;
      maxAgeSeconds?: number;
    };
    cacheableResponse?: {
      statuses: number[];
    };
  };
}

declare module 'next-pwa' {
  import { NextConfig } from 'next';

  interface PWAConfig {
    dest: string;
    disable?: boolean;
    register?: boolean;
    scope?: string;
    sw?: string;
    skipWaiting?: boolean;
    runtimeCaching?: RuntimeCachingRule[];
    buildExcludes?: string[];
    publicExcludes?: string[];
    fallbacks?: {
      [key: string]: string;
    };
  }

  function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;
  export = withPWA;
} 