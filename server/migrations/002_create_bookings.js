// AC: TASK-002 — Create bookings table (MS-002)
// PII columns (email, name) stored as BYTEA — AES-256 encrypted via AWS KMS
// Rollback: DROP TABLE IF EXISTS bookings

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function (knex) {
  await knex.schema.createTable('bookings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('car_id')
      .notNullable()
      .references('id')
      .inTable('cars')
      .onDelete('RESTRICT');
    // PII — stored encrypted at rest as BYTEA (AES-256 via AWS KMS)
    table.specificType('email', 'BYTEA').notNullable();
    table.specificType('name',  'BYTEA').notNullable();
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('bookings');
};
