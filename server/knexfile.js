// AC: TASK-001, TASK-002, TASK-003
require('dotenv').config();

/** @type {import('knex').Knex.Config} */
module.exports = {
  development: {
    client: 'pg',
    connection: {
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME     || 'car_reservation',
      user:     process.env.DB_USER     || 'postgres',
      password: process.env.DB_PASSWORD || '',
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations',
    },
  },
  production: {
    client: 'pg',
    connection: {
      host:     process.env.DB_HOST,
      port:     parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl:      { rejectUnauthorized: true },
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations',
    },
    pool: { min: 2, max: 10 },
  },
};
