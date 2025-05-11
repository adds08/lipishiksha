// Update this file with your database connection details.
const path = require('path');

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, 'data', 'lipi_shiksha.db'),
    },
    migrations: {
      directory: path.join(__dirname, 'data', 'migrations'),
      tableName: 'knex_migrations'
    },
    useNullAsDefault: true, // Recommended for SQLite
  },

  // Example for production (PostgreSQL, if you switch later)
  // production: {
  //   client: 'pg',
  //   connection: process.env.DATABASE_URL + '?ssl=true', // Example for Heroku
  //   migrations: {
  //     directory: path.join(__dirname, 'data', 'migrations'),
  //     tableName: 'knex_migrations'
  //   },
  //   pool: {
  //     min: 2,
  //     max: 10
  //   }
  // }
};
