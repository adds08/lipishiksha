
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
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      const unwantedDialects = [
        'better-sqlite3',
        'sqlite3',
        'mysql',
        'mysql2',
        'oracledb', // for oracle
        'tedious', // for mssql
      ];

      // Ensure config.externals is an array to begin with
      if (!Array.isArray(config.externals)) {
        config.externals = [];
      }
      
      // Prepend a function to handle unwanted dialects
      // This allows existing externals (if any, including functions) to be processed
      // if our function doesn't handle the request.
      config.externals.unshift(
        function (
          { context, request }: { context: string; request: string },
          callback: (err?: Error | null, result?: string | boolean) => void
        ) {
          if (unwantedDialects.includes(request)) {
            // If the request is one of the unwanted dialects, mark it as external
            return callback(null, `commonjs ${request}`);
          }
          // Otherwise, continue with default behavior (Webpack will try to resolve it, or pass to next external)
          callback();
        }
      );
    }
    return config;
  },
};

export default nextConfig;
