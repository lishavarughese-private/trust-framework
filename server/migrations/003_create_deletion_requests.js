// AC: TASK-003 — Create deletion_requests table (MS-003)
// Tracks GDPR right-to-erasure requests.
// email_hash is a SHA-256 hash — non-reversible, no PII stored.
// Rollback: DROP TABLE IF EXISTS deletion_requests

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function (knex) {
  await knex.schema.createTable('deletion_requests', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    // SHA-256 hex digest of the original email — 64 chars, non-reversible
    table.string('email_hash', 64).notNullable();
    table.timestamp('requested_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    // null until the deletion job completes
    table.timestamp('completed_at', { useTz: true }).nullable();
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('deletion_requests');
};
