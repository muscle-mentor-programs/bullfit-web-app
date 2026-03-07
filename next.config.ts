import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
    // Never serve dynamic pages from the client-side router cache.
    // This ensures the dashboard always re-fetches nutrition data after
    // food is logged on the nutrition tab.
    staleTimes: {
      dynamic: 0,
    },
  },
}

export default nextConfig
