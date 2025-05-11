import knexConstructor from 'knex';
// @ts-ignore
import knexConfig from '../../knexfile.js'; 
import path from 'path';
import fs from 'fs';

const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];

if (!config) {
  throw new Error(`Knex configuration for environment "${environment}" not found.`);
}

// Ensure data directory exists for SQLite
if (config.client === 'sqlite3') {
  const dbFilePath = config.connection.filename;
  const dataDir = path.dirname(dbFilePath);
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log(`Created data directory: ${dataDir}`);
    } catch (err) {
      console.error(`Error creating data directory ${dataDir}:`, err);
      // Depending on how critical this is, you might want to throw the error
      // or handle it by attempting to proceed without the directory (which might fail later)
    }
  }
}


const knex = knexConstructor(config);

// Optional: Test connection or run migrations on startup
async function initializeDatabase() {
  try {
    // Test connection (optional)
    // await knex.raw('SELECT 1');
    // console.log(`Knex connected to ${config.client} database successfully.`);

    // Run migrations
    console.log('Running Knex migrations...');
    await knex.migrate.latest();
    console.log('Knex migrations completed.');
  } catch (error) {
    console.error('Error initializing database with Knex:', error);
    // process.exit(1); // Exit if DB initialization fails
  }
}

// Call initializeDatabase during application startup.
// Be careful with top-level await if not using ES modules properly or if it causes issues in Next.js.
// It's generally better to call this from an initialization point in your app.
// For Next.js, this might be in a global setup file or triggered by the init-db script.
// For now, we'll keep it here to ensure migrations run if the db module is imported.
// However, it's best practice to run migrations as a separate build/deploy step.
// To avoid running migrations automatically on every import, we can export a function.
// initializeDatabase(); // Commented out to avoid auto-run on import. Run via `db:init` script.


// Graceful shutdown for Knex
process.on('SIGINT', async () => {
  try {
    await knex.destroy();
    console.log('Knex connection pool closed gracefully.');
    process.exit(0);
  } catch (error) {
    console.error('Error closing Knex connection pool:', error);
    process.exit(1);
  }
});

export default knex;
export { initializeDatabase as runDbMigrations }; // Export function to run migrations explicitly
