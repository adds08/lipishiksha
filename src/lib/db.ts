import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
const dbFilePath = path.join(dataDir, 'lipi_shiksha.db');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbFilePath, (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err.message);
    // Potentially throw error or handle more gracefully depending on application needs
    // For now, just logging. App might not function correctly if DB fails to open.
  } else {
    console.log(`Connected to SQLite database at ${dbFilePath}`);
    // Enable WAL mode for better concurrency and performance.
    db.run('PRAGMA journal_mode = WAL;', (walErr) => {
      if (walErr) {
        console.error('Failed to enable WAL mode for SQLite:', walErr.message);
      } else {
        console.log('SQLite WAL mode enabled.');
      }
    });
  }
});

/**
 * Executes a SQL query that is expected to return rows (e.g., SELECT).
 * @param sql The SQL query string.
 * @param params Optional array of parameters for parameterized queries.
 * @returns A Promise resolving to an array of rows.
 */
export function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows: T[]) => {
      if (err) {
        console.error('Error executing query (all):', { sql, params, error: err.message });
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

/**
 * Executes a SQL query that modifies data (e.g., INSERT, UPDATE, DELETE).
 * @param sql The SQL query string.
 * @param params Optional array of parameters for parameterized queries.
 * @returns A Promise resolving to an object with lastID and changes.
 */
export function execute(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (this: sqlite3.RunResult, err) {
      if (err) {
        console.error('Error executing statement (run):', { sql, params, error: err.message });
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('SQLite database connection closed.');
    process.exit(0);
  });
});

export default db; // Export the raw db instance if needed for transactions or specific methods
