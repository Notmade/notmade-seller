/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://notmade-backend-production.up.railway.app',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  },
  // Portal pages are never indexed
  async headers() {
    return ['/login', '/dashboard/:path*', '/onboarding/:path*'].map((source) => ({
      source,
      headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
    }));
  },
  // Pages kept in the repo but not backed by the seller API yet (returns live in Orders → Returns)
  async redirects() {
    return ['warehouse', 'contract', 'returns'].map((p) => ({
      source: `/dashboard/${p}`,
      destination: '/dashboard',
      permanent: false,
    }));
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
};

export default nextConfig;
