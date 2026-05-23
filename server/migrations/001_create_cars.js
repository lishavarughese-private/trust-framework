// AC: TASK-001 — Create cars table (MS-001)
// Rollback: DROP TABLE IF EXISTS cars

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function (knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
  await knex.schema.createTable('cars', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.string('type', 100).notNullable();
    table.boolean('availability_status').notNullable().defaultTo(true);
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('cars');
};
