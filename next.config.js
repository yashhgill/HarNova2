/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { remotePatterns: [{ protocol: 'https', hostname: '**.supabase.co' }] },
  async headers() {
    return [
      {
        source: '/api/webhooks/:path*',
        headers: [{ key: 'Content-Type', value: 'application/json' }],
      },
    ]
  },
}
module.exports = nextConfig
