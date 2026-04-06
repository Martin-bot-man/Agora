import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Crucial for PDF.js: tells the server to NEVER load this package
  serverExternalPackages: ['pdfjs-dist'],

  // 2. Turbopack config is now a top-level key (experimental.turbopack is invalid)
  turbopack: {
    resolveAlias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  },

  // 3. Keep Webpack for production builds and compatibility
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(process.cwd(), 'src');
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};

export default nextConfig;
