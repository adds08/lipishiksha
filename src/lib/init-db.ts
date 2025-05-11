
import db from './db'; // Imports the initialized db from db.ts

const createTableSql = `
CREATE TABLE IF NOT EXISTS "FontConfiguration" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "assignedLanguage" TEXT NOT NULL,
  characters TEXT NOT NULL, -- Stores JSON string of characters
  "fileName" TEXT NOT NULL,
  "fileSize" INTEGER NOT NULL,
  "storagePath" TEXT NOT NULL,
  "downloadURL" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL -- Stores ISO8601 date string
);
`;

function initializeDatabase() {
  console.log('Running manual database initialization script...');
  db.serialize(() => {
    db.exec(createTableSql, (err) => { // Using db.exec for CREATE TABLE IF NOT EXISTS
      if (err) {
        console.error('Error ensuring FontConfiguration table exists (manual script):', err.message);
        return;
      }
      console.log('FontConfiguration table checked/created successfully (manual script).');

      // You could add initial data seeding here if needed
      // Example:
      // const insertSql = 'INSERT INTO FontConfiguration (id, name, ...) VALUES ($1, $2, ...)';
      // db.run(insertSql, ['some-uuid', 'Default Font', ...]);
    });

    // Add any other tables or initial setup here
  });
  console.log('Manual database initialization script finished.');
  // Close the database connection if this script is truly standalone
  // For now, assume it might be run while app is also trying to connect, so avoid explicit close.
  // db.close((err) => {
  //   if (err) {
  //     console.error('Error closing database connection (manual script):', err.message);
  //   } else {
  //     console.log('Database connection closed after manual initialization.');
  //   }
  // });
}

// Run the initialization
// This ensures the function is called when the script is executed.
if (require.main === module) {
  initializeDatabase();
}

// Export the function if it needs to be callable from elsewhere, though typically not for an init script.
// export { initializeDatabase };
