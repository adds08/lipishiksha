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
  db.serialize(() => {
    db.run(createTableSql, (err) => {
      if (err) {
        console.error('Error creating FontConfiguration table:', err.message);
        return;
      }
      console.log('FontConfiguration table checked/created successfully.');

      // You could add initial data seeding here if needed
      // Example:
      // const insertSql = 'INSERT INTO FontConfiguration (id, name, ...) VALUES (?, ?, ...)';
      // db.run(insertSql, ['some-uuid', 'Default Font', ...]);
    });

    // Add any other tables or initial setup here
  });
}

// Run the initialization
initializeDatabase();

// Close the database connection after setup (important for a script)
// db.close((err) => {
//   if (err) {
//     console.error('Error closing database connection:', err.message);
//   } else {
//     console.log('Database connection closed after initialization.');
//   }
// });
// Note: db.close() might be problematic if db.ts is also imported by the main app.
// For a script, it's good practice. If run as part of app startup, manage connection lifecycle carefully.
// The current db.ts handles process.on('SIGINT') for closing, which might be sufficient.
// For a standalone script, explicitly closing is better. Given it's a script in package.json,
// we can let it run and the process will exit. If it were imported during app boot, avoid closing here.
// Let's remove the explicit close here to avoid conflicts if this script is run while the app is running or via tsx.
// The console logs will indicate completion.
