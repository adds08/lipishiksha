
import { runDbMigrations } from './db'; // Import the exported migration runner

async function initializeDatabaseWithKnex() {
  console.log('Running manual database initialization script (Knex Migrations)...');
  // Set a flag to indicate this is a CLI-driven migration context
  // This helps `src/lib/db.ts` avoid its own auto-initialization.
  process.env.KNEX_CLI_CONTEXT = 'true';
  try {
    await runDbMigrations(); // This will call knex.migrate.latest() using a fresh knex instance
    console.log('Knex migrations executed successfully (manual script).');
  } catch (error) {
    console.error('Error running Knex migrations (manual script):', error);
    process.exit(1); // Exit if migrations fail
  } finally {
    delete process.env.KNEX_CLI_CONTEXT; // Clean up the environment variable
  }
}

// Run the initialization
if (require.main === module) {
  initializeDatabaseWithKnex().finally(() => {
    // Knex connection in runDbMigrations is destroyed internally.
    // If this script imported the default guardedKnex from './db',
    // its connection would be managed by that module's lifecycle.
  });
}
