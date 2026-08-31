import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.shopify.com' }],
  },

  // Legacy 301s live in src/proxy.ts: redirects() matches case-insensitively,
  // which turns /Services -> /services into a redirect loop on a real page.
}

export default nextConfig
