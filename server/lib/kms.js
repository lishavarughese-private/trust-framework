// AC: TASK-008 — AWS KMS encryption helper for PII fields
// Encrypts email and name using AES-256 via AWS KMS before writing to DB.
// Keys are never stored with data, never logged, never written to env.

const { KMSClient, EncryptCommand, DecryptCommand } = require('@aws-sdk/client-kms');

const client = new KMSClient({
  region: process.env.AWS_REGION || 'eu-west-1',
});

// KMS Key ARN — loaded from environment, never hardcoded
const KEY_ID = process.env.KMS_KEY_ARN;

if (!KEY_ID && process.env.NODE_ENV === 'production') {
  throw new Error('[kms] KMS_KEY_ARN environment variable is not set. Cannot start in production without a KMS key.');
}

/**
 * Encrypts a plaintext string using AWS KMS (AES-256).
 * Returns a Buffer suitable for storage in a BYTEA column.
 *
 * @param {string} plaintext — the value to encrypt (e.g. email or name)
 * @returns {Promise<Buffer>} encrypted ciphertext buffer
 */
async function encrypt(plaintext) {
  if (!plaintext) throw new Error('[kms] encrypt() called with empty value');

  const command = new EncryptCommand({
    KeyId: KEY_ID,
    Plaintext: Buffer.from(plaintext, 'utf8'),
  });

  const response = await client.send(command);

  // CiphertextBlob is a Uint8Array — convert to Buffer for pg BYTEA
  return Buffer.from(response.CiphertextBlob);
}

/**
 * Decrypts a BYTEA buffer from the database back to plaintext.
 *
 * @param {Buffer} ciphertextBuffer — the encrypted buffer from the DB
 * @returns {Promise<string>} decrypted plaintext string
 */
async function decrypt(ciphertextBuffer) {
  if (!ciphertextBuffer) throw new Error('[kms] decrypt() called with empty buffer');

  const command = new DecryptCommand({
    CiphertextBlob: ciphertextBuffer,
  });

  const response = await client.send(command);
  return Buffer.from(response.Plaintext).toString('utf8');
}

module.exports = { encrypt, decrypt };
