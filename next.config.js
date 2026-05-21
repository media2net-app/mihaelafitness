const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  serverExternalPackages: ['@prisma/client'],
  // Fix workspace root / client manifest issues when multiple lockfiles exist
  outputFileTracingRoot: path.join(__dirname),
  // For Vercel deployment - don't use static export
  output: undefined,
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
};

module.exports = nextConfig;
