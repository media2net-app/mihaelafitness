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
  // For Vercel deployment - don't use static export
  output: undefined, // Let Vercel handle the build
  // Exclude problematic pages from static generation
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
};

module.exports = nextConfig;
