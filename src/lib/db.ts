
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
console.log(`[DB] Using environment: ${environment}`);
console.log(`[DB] Knex active configuration: Client: ${activeKnexConfig.client}, Connection Filename: ${activeKnexConfig.connection?.filename}`);

// Ensure data directory exists for SQLite before Knex instance is even created if filename is specified
if (activeKnexConfig.client === 'sqlite3' && activeKnexConfig.connection.filename && activeKnexConfig.connection.filename !== ':memory:') {
  const dbFilePath = path.resolve(activeKnexConfig.connection.filename); // Ensure absolute
  const dataDir = path.dirname(dbFilePath);
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log(`[DB] Created data directory for SQLite: ${dataDir}`);
    } catch (err) {
      console.error(`[DB] Error creating data directory ${dataDir}:`, err);
      // This could be a fatal error depending on permissions
    }
  }
}

const knex = knexConstructor(activeKnexConfig);

let dbInitializationState: 'pending' | 'done' | 'failed' = 'pending';
let dbInitializationError: Error | null = null;

const initializeDatabasePromise = (async () => {
  if (process.env.KNEX_CLI_CONTEXT === 'true') {
    console.log('[DB InitializePromise] Knex CLI context detected, skipping auto-initialization in src/lib/db.ts.');
    // For CLI context, we assume migrations are handled by the CLI command itself.
    // Setting to 'done' might be too optimistic if the CLI command isn't 'migrate'.
    // However, guardedKnex is usually not used by CLI.
    dbInitializationState = 'done'; 
    return;
  }

  if (dbInitializationState !== 'pending') {
    console.log(`[DB InitializePromise] Initialization already attempted (state: ${dbInitializationState}). Skipping.`);
    return;
  }

  console.log('[DB InitializePromise] Attempting database initialization and migration...');
  try {
    // For SQLite, Knex typically creates the file if it doesn't exist when connection is made.
    // The directory check above should suffice.
    
    console.log('[DB InitializePromise] Running knex.migrate.latest()...');
    // Log migration config being used by this knex instance
    // console.log('[DB InitializePromise] Knex migration config:', knex.migrate.config);
    const migrationResult = await knex.migrate.latest();
    // migrationResult is an array: [batchNo, log[]]
    // log[] contains names of migrations that ran.
    console.log(`[DB InitializePromise] knex.migrate.latest() completed. Batch: ${migrationResult[0]}. Migrations run: ${migrationResult[1].length > 0 ? migrationResult[1].join(', ') : 'None'}`);
    
    console.log('[DB InitializePromise] Verifying table "FontConfiguration" existence post-migration...');
    const tableExists = await knex.schema.hasTable('FontConfiguration');
    if (!tableExists) {
        console.error('[DB InitializePromise] CRITICAL: FontConfiguration table still does not exist after migrations.');
        throw new Error('FontConfiguration table missing after migration attempt. Check migration logs and DB file.');
    } else {
        console.log('[DB InitializePromise] FontConfiguration table confirmed to exist.');
    }

    dbInitializationState = 'done';
    console.log('[DB InitializePromise] Database initialization successful.');
  } catch (error) {
    dbInitializationState = 'failed';
    dbInitializationError = error instanceof Error ? error : new Error(String(error));
    console.error('[DB InitializePromise] Critical error initializing database with Knex:', dbInitializationError.message);
    if ((error as any).stack) {
        console.error((error as any).stack);
    }
    // The proxy will throw this error on subsequent operations
  }
})();

const guardedKnex = new Proxy(knex, {
  get(target, propKey, receiver) {
    const originalValue = Reflect.get(target, propKey, receiver);
    if (typeof originalValue === 'function') {
      return async (...args: any[]) => {
        // console.log(`[DB PROXY] Operation: ${String(propKey)}. Current dbInitializationState: ${dbInitializationState}`);
        await initializeDatabasePromise; // Ensure initialization attempt has finished
        // console.log(`[DB PROXY] Operation: ${String(propKey)}. After await, dbInitializationState: ${dbInitializationState}`);

        if (dbInitializationState === 'failed') {
          console.error(`[DB PROXY] Attempted to use DB when initialization failed for operation: ${String(propKey)}.`);
          throw new Error(`[DB] Database not initialized or initialization failed. Original error: ${dbInitializationError?.message || 'Unknown DB init error'}`);
        }
        if (dbInitializationState !== 'done') {
           console.warn(`[DB PROXY] Database initialization state is unexpectedly "${dbInitializationState}" for operation: ${String(propKey)}. This might indicate an issue.`);
          throw new Error(`[DB] Database initialization is not 'done' (state: ${dbInitializationState}). Investigate initialization logs.`);
        }
        // console.log(`[DB PROXY] Operation: ${String(propKey)}. Proceeding with call.`);
        return (originalValue as Function).apply(target, args);
      };
    }
    return originalValue;
  }
});

process.on('SIGINT', async () => {
  if (knex && typeof knex.destroy === 'function') { 
    try {
      await knex.destroy();
      console.log('[DB] Knex connection pool closed gracefully on SIGINT.');
    } catch (error) {
      console.error('[DB] Error closing Knex connection pool on SIGINT:', error);
    }
  }
  process.exit(0);
});
process.on('SIGTERM', async () => {
  if (knex && typeof knex.destroy === 'function') {
    try {
      await knex.destroy();
      console.log('[DB] Knex connection pool closed gracefully on SIGTERM.');
    } catch (error) {
      console.error('[DB] Error closing Knex connection pool on SIGTERM:', error);
    }
  }
  process.exit(0);
});


export default guardedKnex;

export async function runDbMigrations() {
  // This function is for explicit calls like from `db:init` script.
  // It should use its own knex instance to avoid conflicts with the app's guardedKnex state.
  console.log('[DB Script - runDbMigrations] Explicitly running Knex migrations...');
  const migrationKnexConfig = knexConfigFromFile[environment];
  if (!migrationKnexConfig) {
    throw new Error(`Knex configuration for environment "${environment}" not found for migration script.`);
  }
  console.log(`[DB Script - runDbMigrations] Using config for env: ${environment}, client: ${migrationKnexConfig.client}, file: ${migrationKnexConfig.connection?.filename}`);
  
  const migrationKnex = knexConstructor(migrationKnexConfig);
  try {
    // Ensure directory for SQLite exists for the migration script too
    if (migrationKnexConfig.client === 'sqlite3' && migrationKnexConfig.connection.filename && migrationKnexConfig.connection.filename !== ':memory:') {
        const dbFilePath = path.resolve(migrationKnexConfig.connection.filename);
        const dataDir = path.dirname(dbFilePath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
            console.log(`[DB Script - runDbMigrations] Created data directory for SQLite: ${dataDir}`);
        }
    }

    const result = await migrationKnex.migrate.latest();
    console.log(`[DB Script - runDbMigrations] Knex migrations completed. Batch: ${result[0]}. Migrations run: ${result[1].length > 0 ? result[1].join(', ') : 'None'}`);
  } catch(error) {
    console.error('[DB Script - runDbMigrations] Error running migrations explicitly:', error);
    throw error;
  } finally {
    if (migrationKnex && typeof migrationKnex.destroy === 'function') {
      await migrationKnex.destroy();
      console.log('[DB Script - runDbMigrations] Migration Knex instance destroyed.');
    }
  }
}