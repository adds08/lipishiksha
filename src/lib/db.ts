
'use server';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const DB_FILE_NAME = 'lipi_shiksha.db';
const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, DB_FILE_NAME);

let db: sqlite3.Database | null = null;
let dbInitializationPromise: Promise<void> | null = null;

function ensureDbDirectoryExists() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
    console.log(`[DB] Created data directory: ${DB_DIR}`);
  }
}

async function initializeDatabase(): Promise<void> {
  ensureDbDirectoryExists();
  return new Promise((resolve, reject) => {
    if (db) {
      resolve();
      return;
    }
    console.log(`[DB] Initializing SQLite database at ${DB_PATH}...`);
    const newDb = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('[DB] Error opening database:', err.message);
        reject(err);
        return;
      }
      console.log('[DB] SQLite database opened successfully.');
      db = newDb;
      createTables()
        .then(() => {
            console.log('[DB] Database schema initialized.');
            resolve();
        })
        .catch(tableErr => {
            console.error('[DB] Error creating tables:', tableErr.message);
            reject(tableErr);
        });
    });
  });
}

async function createTables(): Promise<void> {
    if (!db) throw new Error("Database not initialized for createTables.");
    const createTableSql = `
      CREATE TABLE IF NOT EXISTS FontConfiguration (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        assignedLanguage TEXT NOT NULL,
        characters TEXT NOT NULL,
        fileName TEXT NOT NULL,
        fileSize INTEGER NOT NULL,
        storagePath TEXT NOT NULL,
        downloadURL TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );
    `;
    return new Promise((resolve, reject) => {
        db!.exec(createTableSql, (err) => {
        if (err) {
          console.error('[DB] Error creating FontConfiguration table:', err.message);
          reject(err);
        } else {
          console.log('[DB] FontConfiguration table checked/created successfully.');
          // You can add index creation here if needed, e.g.:
          // db!.exec("CREATE INDEX IF NOT EXISTS idx_lang ON FontConfiguration(assignedLanguage);", (idxErr) => { ... });
          resolve();
        }
      });
    });
}

export async function getDb(): Promise<sqlite3.Database> {
  if (!dbInitializationPromise) {
    dbInitializationPromise = initializeDatabase();
  }
  await dbInitializationPromise;
  if (!db) {
    throw new Error('Database initialization failed or did not complete.');
  }
  return db;
}

// Helper to run a query that doesn't expect rows (INSERT, UPDATE, DELETE)
export async function run(sql: string, params: any[] = []): Promise<{ lastID?: number, changes?: number }> {
  const dbInstance = await getDb();
  return new Promise((resolve, reject) => {
    dbInstance.run(sql, params, function (err) { // Use function to get `this` context for lastID, changes
      if (err) {
        console.error(`[DB] Error running SQL: ${sql}`, params, err.message);
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}

// Helper to get a single row
export async function get<T>(sql: string, params: any[] = []): Promise<T | undefined> {
  const dbInstance = await getDb();
  return new Promise((resolve, reject) => {
    dbInstance.get(sql, params, (err, row: T) => {
      if (err) {
         console.error(`[DB] Error getting SQL: ${sql}`, params, err.message);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Helper to get all rows
export async function all<T>(sql: string, params: any[] = []): Promise<T[]> {
  const dbInstance = await getDb();
  return new Promise((resolve, reject) => {
    dbInstance.all(sql, params, (err, rows: T[]) => {
      if (err) {
        console.error(`[DB] Error getting all SQL: ${sql}`, params, err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}


// Ensure tables are created on server start (or first DB access)
// This is important if running directly (e.g. `next start`)
// For `db:init` script, initializeDbWithTables will be called explicitly.
getDb().catch(err => {
    console.error("[DB] Failed to auto-initialize database on module load:", err.message);
});

// Export a function for explicit initialization, e.g., for scripts
export async function initializeDbWithTables(): Promise<void> {
    console.log('[DB Script] Explicitly initializing database and tables...');
    if (!dbInitializationPromise) {
        dbInitializationPromise = initializeDatabase();
    }
    await dbInitializationPromise;
    console.log('[DB Script] Database and tables initialization process completed.');
}

process.on('SIGINT', async () => {
  if (db) {
    console.log('[DB] Closing SQLite database connection on SIGINT...');
    db.close((err) => {
      if (err) console.error('[DB] Error closing database on SIGINT:', err.message);
      else console.log('[DB] Database closed successfully.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on('SIGTERM', async () => {
  if (db) {
    console.log('[DB] Closing SQLite database connection on SIGTERM...');
    db.close((err) => {
      if (err) console.error('[DB] Error closing database on SIGTERM:', err.message);
      else console.log('[DB] Database closed successfully.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});
