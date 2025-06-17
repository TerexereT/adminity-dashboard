
import dotenv from 'dotenv';
import path from 'path'; // Import path

// Explicitly load .env.local to make environment variables available to the Next.js process
// Note: Next.js automatically loads .env.local, but this ensures it's done early.
// Ensure this runs before any other Next.js configuration logic might need them.
const envPath = path.resolve(process.cwd(), '.env.local'); // Use path.resolve
dotenv.config({ path: envPath });

import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
