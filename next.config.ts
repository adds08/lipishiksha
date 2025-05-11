
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
      // Add unused Knex dialects to externals to prevent Webpack from bundling them.
      // 'pg' is the used dialect, so it's not included here.
      const unwantedDialects = [
        'better-sqlite3',
        'sqlite3',
        'mysql',
        'mysql2',
        'oracledb', // for oracle
        'tedious', // for mssql
      ];

      // Ensure config.externals is an array and push the unwanted dialects.
      // The typical structure for config.externals in Next.js allows pushing strings or regexes.
      if (!config.externals) {
        config.externals = [];
      }
      
      // It's safer to push a function to handle these specific requests,
      // or ensure externals is an array before pushing.
      // Next.js default for externals is an array.
      // We'll add them as simple strings, which works if they are top-level requires.
      config.externals = [...config.externals, ...unwantedDialects];

      // A more robust way if other externals are functions or complex objects:
      // config.externals.push(function({ context, request }, callback) {
      //   if (unwantedDialects.includes(request)) {
      //     return callback(null, 'commonjs ' + request);
      //   }
      //   callback();
      // });
    }
    return config;
  },
};

export default nextConfig;
