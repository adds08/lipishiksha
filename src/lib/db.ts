
import knexConstructor from 'knex';
// @ts-ignore
import knexConfigFromFile from '../../knexfile.js';
import path from 'path';
import fs from 'fs';

const environment = process.env.NODE_ENV || 'development';
const activeKnexConfig = knexConfigFromFile[environment];

if (!activeKnexConfig) {
  throw new Error(`Knex configuration for environment "${environment}" not found.`);
}

// Ensure data directory exists for SQLite
if (activeKnexConfig.client === 'sqlite3' && activeKnexConfig.connection.filename && activeKnexConfig.connection.filename !== ':memory:') {
  // knexfile.js uses path.join(__dirname, ...) so connection.filename IS ALREADY ABSOLUTE.
  const dbFilePath = activeKnexConfig.connection.filename;
  const dataDir = path.dirname(dbFilePath);

  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log(`[DB] Created data directory: ${dataDir}`);
    } catch (err) {
      console.error(`[DB] Error creating data directory ${dataDir}:`, err);
      // Depending on how critical this is, you might want to throw the error
    }
  }
}

const knex = knexConstructor(activeKnexConfig);

let dbInitializationState: 'pending' | 'done' | 'failed' = 'pending';
let dbInitializationError: Error | null = null;

// This promise ensures that DB initialization logic is run once.
const initializeDatabasePromise = (async () => {
  if (dbInitializationState !== 'pending') { // Avoid re-running if already attempted
     // If failed, subsequent calls will rely on the dbInitializationState check in the proxy
    return;
  }

  // Prevent running during Knex CLI operations which might also import this file
  if (process.env.KNEX_CLI_CONTEXT === 'true') {
    console.log('[DB] Knex CLI context detected, skipping auto-initialization.');
    dbInitializationState = 'done'; // Mark as done to prevent actual app init attempts
    return;
  }

  try {
    // For SQLite, attempting a raw query can help ensure the file is created if it doesn't exist.
    await knex.raw('SELECT 1 AS test');
    // console.log('[DB] Database connection test successful.');

    const tableExists = await knex.schema.hasTable('FontConfiguration');
    if (!tableExists) {
      console.log('[DB] FontConfiguration table not found. Running Knex migrations...');
      await knex.migrate.latest();
      console.log('[DB] Knex migrations completed.');
    } else {
      // console.log('[DB] FontConfiguration table already exists. Skipping auto-migrations.');
    }
    dbInitializationState = 'done';
  } catch (error) {
    dbInitializationState = 'failed';
    dbInitializationError = error instanceof Error ? error : new Error(String(error));
    console.error('[DB] Critical error initializing database with Knex:', dbInitializationError.message);
    // This error will be thrown by any subsequent knex operation if using the guardedKnex approach
  }
})();

// Export a guarded knex instance that awaits initialization.
// This ensures that any knex operation waits for the initialization attempt to complete.
const guardedKnex = new Proxy(knex, {
  get(target, propKey, receiver) {
    const originalValue = Reflect.get(target, propKey, receiver);
    if (typeof originalValue === 'function') {
      return async (...args: any[]) => {
        await initializeDatabasePromise; // Ensure initialization attempt has finished

        if (dbInitializationState === 'failed') {
          // console.error(`[DB Operation Guard] Attempted to use DB when initialization failed. Original error: ${dbInitializationError?.message}`);
          throw new Error(`[DB] Database not initialized or initialization failed. Original error: ${dbInitializationError?.message || 'Unknown DB init error'}`);
        }
        if (dbInitializationState !== 'done') {
          // This case should ideally not be hit if promise resolves/rejects correctly and state is managed
           console.warn('[DB Operation Guard] Database initialization state is unexpectedly not "done". This might indicate an issue.');
          // Depending on strictness, could throw an error here or allow proceeding with caution.
          // For now, let's be strict to catch potential issues.
          throw new Error('[DB] Database initialization is still pending or in an unknown state.');
        }
        return (originalValue as Function).apply(target, args);
      };
    }
    return originalValue;
  }
});

// Graceful shutdown (optional, Next.js might handle this, but good for standalone scripts)
process.on('SIGINT', async () => {
  if (knex) { // Use original knex for destroy to avoid proxy recursion if destroy is proxied
    try {
      await knex.destroy();
      console.log('[DB] Knex connection pool closed gracefully.');
    } catch (error) {
      console.error('[DB] Error closing Knex connection pool:', error);
    }
  }
  process.exit(0);
});

// Export the guarded knex instance for use in the application.
export default guardedKnex;

// Export a function to run migrations explicitly, e.g., for the `db:init` script
export async function runDbMigrations() {
  console.log('[DB Script] Explicitly running Knex migrations...');
  // Use a new Knex instance for migrations to ensure it's not affected by app's guarded instance state
  // and to ensure it uses the direct config from knexfile.
  const migrationKnex = knexConstructor(activeKnexConfig);
  try {
    await migrationKnex.migrate.latest();
    console.log('[DB Script] Knex migrations completed successfully.');
  } catch(error) {
    console.error('[DB Script] Error running migrations explicitly:', error);
    throw error; // Re-throw to indicate failure of the script
  } finally {
    await migrationKnex.destroy(); // Clean up this specific Knex instance
  }
}
