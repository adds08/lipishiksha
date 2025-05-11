import { runDbMigrations } from './db'; // Import the exported migration runner

async function initializeDatabaseWithKnex() {
  console.log('Running manual database initialization script (Knex Migrations)...');
  try {
    await runDbMigrations(); // This will call knex.migrate.latest()
    console.log('Knex migrations executed successfully (manual script).');
  } catch (error) {
    console.error('Error running Knex migrations (manual script):', error);
    process.exit(1); // Exit if migrations fail
  }
}

// Run the initialization
if (require.main === module) {
  initializeDatabaseWithKnex().finally(() => {
    // If you need to explicitly close the knex connection after script runs:
    // import knexInstance from './db';
    // knexInstance.destroy().then(() => console.log('Knex connection closed after init script.'));
    // However, for a simple script, process.exit() above should suffice.
  });
}
