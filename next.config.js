/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  typescript: {
    // During builds, ignore TypeScript errors for faster development
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  eslint: {
    // During builds, ignore ESLint errors for faster development
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  headers: async () => {
    return [
      {
        // Keep SAMEORIGIN for all routes except /embed and /session-service (which get no headers = allows embedding)
        source: '/((?!embed|session-service).*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 