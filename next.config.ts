
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
      {
        protocol: 'https',
        hostname: 'jqdbhsicpfdpzifphdft.supabase.co',
        port: '',
        pathname: '/**',
      }
    ],
  },
  devIndicators: {
    allowedDevOrigins: [
        "http://localhost:9002",
        "https://6000-firebase-studio-1753376594897.cluster-2xid2zxbenc4ixa74rpk7q7fyk.cloudworkstations.dev"
    ]
  }
};

export default nextConfig;
