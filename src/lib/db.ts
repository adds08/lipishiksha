
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Ensure .env is loaded.
dotenv.config({ path: process.cwd() + '/.env' });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is not defined in your .env file. This is required for PostgreSQL connections.'
  );
}

// Log the database URL (excluding password for security in production logs) for debugging
// Be cautious with logging sensitive information.
const loggableDbUrl = databaseUrl.replace(/postgres:\/\/[^:]+:[^@]+@/, 'postgres://<user>:<password>@');
console.log(`Attempting to connect to PostgreSQL with URL (sensitive parts redacted): ${loggableDbUrl}`);


const pool = new Pool({
  connectionString: databaseUrl,
  // Example SSL configuration (often needed for cloud-hosted PostgreSQL)
  // ssl: {
  //   rejectUnauthorized: process.env.NODE_ENV === 'production', // Enforce SSL in production
  //   // ca: fs.readFileSync('/path/to/server-ca.pem').toString(), // If you have a CA cert
  // },
  // You can configure pool options here, for example:
  // max: 20, // maximum number of clients in the pool
  // idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
  // connectionTimeoutMillis: 2000, // how long to wait for a client to connect
});

pool.on('connect', client => {
  console.log('PostgreSQL client connected');
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  // Depending on the error, you might want to gracefully shutdown or attempt to re-establish
  // For now, exiting on critical pool errors might be too drastic for a web app.
  // Consider more sophisticated error handling/logging.
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
  } catch (err) {
    console.error('Error executing query:', { 
        sql: text, 
        parameters: params, 
        error: err instanceof Error ? err.message : String(err) 
    });
    throw err; // Re-throw the error to be handled by the caller
  }
  finally {
    client.release();
  }
}

export default pool;
