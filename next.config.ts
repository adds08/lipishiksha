
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

      const customExternalHandler = function (
        { context, request }: { context: string; request: string },
        callback: (err?: Error | null, result?: string | boolean) => void
      ) {
        if (unwantedDialects.includes(request)) {
          return callback(null, `commonjs ${request}`);
        }
        callback();
      };

      if (Array.isArray(config.externals)) {
        config.externals.unshift(customExternalHandler);
      } else if (config.externals) { 
        // If it exists and is not an array (e.g., a single function/object that's not an array)
        config.externals = [customExternalHandler, config.externals];
      } else { 
        // If it's undefined/null or any other falsy value
        config.externals = [customExternalHandler];
      }
    }
    return config;
  },
};

export default nextConfig;
