
import { initializeDbWithTables } from './db'; // Import the exported table creation runner

async function initializeDatabaseRawSql() {
  console.log('Running manual database initialization script (Raw SQLite)...');
  try {
    await initializeDbWithTables(); 
    console.log('Raw SQLite database initialization executed successfully (manual script).');
  } catch (error) {
    console.error('Error running Raw SQLite database initialization (manual script):', error);
    process.exit(1); // Exit if initialization fails
  }
}

// Run the initialization
if (require.main === module) {
  initializeDatabaseRawSql().finally(() => {
    // The db connection is managed within db.ts and closed on SIGINT/SIGTERM
    console.log('Manual DB initialization script finished.');
  });
}
