// AC: TASK-011 — Data Deletion Service
// GDPR right-to-erasure logic.
// Permanently deletes all PII for a given user email.
// Logs deletion event using SHA-256 hash — no PII stored in logs.

const crypto = require('crypto');
const db     = require('../db');
const { encrypt } = require('../lib/kms');

/**
 * Produces a SHA-256 hex digest of an email address.
 * Used for the deletion audit log — non-reversible, no PII retained.
 *
 * @param {string} email
 * @returns {string} 64-char hex digest
 */
function hashEmail(email) {
  return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
}

/**
 * Permanently deletes all PII for a given user email.
 * Steps:
 *   1. Find all bookings matching the encrypted email.
 *   2. Delete those booking rows permanently.
 *   3. Insert a deletion_requests record with SHA-256 email hash.
 *
 * No plaintext PII is written to logs at any point.
 *
 * @param {string} email — plaintext email from the API request
 * @returns {Promise<{ deleted: boolean, confirmed_at: string }>}
 */
async function deleteUserData(email) {
  // Encrypt the email to match against stored BYTEA values
  const encryptedEmail = await encrypt(email);
  const emailHash      = hashEmail(email);

  await db.transaction(async (trx) => {
    // Permanently delete all bookings for this user
    // Deleted data cannot be recovered — TASK-011 AC
    await trx('bookings')
      .whereRaw('email = ?', [encryptedEmail])
      .delete();

    // Record the deletion event — no PII stored, only the hash
    await trx('deletion_requests').insert({
      email_hash:   emailHash,
      completed_at: trx.fn.now(),
    });
  });

  return {
    deleted:      true,
    confirmed_at: new Date().toISOString(),
  };
}

module.exports = { deleteUserData, hashEmail };
