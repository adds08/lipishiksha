
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Ensure .env is loaded.
dotenv.config({ path: process.cwd() + '/.env' });

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not defined in your .env file. This is required for direct PostgreSQL connections.'
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // You can configure pool options here, for example:
  // max: 20, // maximum number of clients in the pool
  // idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
  // connectionTimeoutMillis: 2000, // how long to wait for a client to connect
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Executes a SQL query using a client from the connection pool.
 * @param text The SQL query string.
 * @param params Optional array of parameters for parameterized queries.
 * @returns A Promise resolving to the query result.
 */
export async function query<T = any>(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const res = await client.query<T>(text, params);
    return res;
  } finally {
    client.release();
  }
}

// You can also export the pool directly if you need more advanced operations
export default pool;
