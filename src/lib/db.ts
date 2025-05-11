
import knex from 'knex';
import knexConfig from '../../knexfile';
import dotenv from 'dotenv';

dotenv.config({ path: process.cwd() + '/.env' });


const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];

if (!config) {
  throw new Error(`Knex configuration for environment "${environment}" not found.`);
}
if (!config.connection) {
    throw new Error(`DATABASE_URL is not defined for Knex in environment "${environment}". Check your .env file and knexfile.ts.`);
}

const db = knex(config);

export default db;
