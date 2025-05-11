
import type { Knex } from 'knex';
import dotenv from 'dotenv';

// Ensure .env is loaded. Note: dotenv.config() might be called multiple times
// if also called in db.ts, but it's generally safe.
dotenv.config({ path: process.cwd() + '/.env' });

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg', // Changed from 'sqlite3' to 'pg'
    connection: process.env.DIRECT_URL, // Use DIRECT_URL for local development and migrations
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './src/db/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './src/db/seeds',
      extension: 'ts',
    },
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL, // Use DATABASE_URL (pooler) for production application
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './src/db/migrations',
      extension: 'ts',
    },
  },
};

export default config;
