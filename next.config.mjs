/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.fal.media' },
      { protocol: 'https', hostname: '*.fal.ai' },
    ],
  },
}

export default nextConfig
