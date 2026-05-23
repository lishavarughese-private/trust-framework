// AC: TASK-008 — AWS KMS encryption helper tests
// Covers encrypt/decrypt round-trip, no PII logging, key not from env.

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock AWS KMS client before importing the module
vi.mock('@aws-sdk/client-kms', () => {
  const mockSend = vi.fn();
  const KMSClient = vi.fn(() => ({ send: mockSend }));
  const EncryptCommand = vi.fn((input) => ({ input, type: 'encrypt' }));
  const DecryptCommand = vi.fn((input) => ({ input, type: 'decrypt' }));
  return { KMSClient, EncryptCommand, DecryptCommand, mockSend };
});

import { KMSClient, EncryptCommand, DecryptCommand, mockSend } from '@aws-sdk/client-kms';

// Set required env before importing kms.js
process.env.KMS_KEY_ARN = 'arn:aws:kms:eu-west-1:123456789012:key/test-key';
process.env.NODE_ENV    = 'test';

const { encrypt, decrypt } = await import('../lib/kms.js');

const PLAINTEXT     = 'tourist@example.com';
const CIPHERTEXT    = Buffer.from('encrypted-bytes');

describe('KMS encrypt()', () => {
  beforeEach(() => vi.clearAllMocks());

  // AC: encrypt(value) returns a BYTEA-compatible encrypted buffer
  it('returns a Buffer from encrypt()', async () => {
    KMSClient.prototype.send = vi.fn().mockResolvedValue({
      CiphertextBlob: CIPHERTEXT,
    });
    mockSend.mockResolvedValue({ CiphertextBlob: CIPHERTEXT });

    const result = await encrypt(PLAINTEXT);
    expect(Buffer.isBuffer(result)).toBe(true);
  });

  // AC: Encryption key is loaded from AWS KMS — not from env or codebase
  it('uses KMS_KEY_ARN env var as the key ID, not a hardcoded value', async () => {
    mockSend.mockResolvedValue({ CiphertextBlob: CIPHERTEXT });
    await encrypt(PLAINTEXT);
    const encryptCall = EncryptCommand.mock.calls[0][0];
    expect(encryptCall.KeyId).toBe(process.env.KMS_KEY_ARN);
    expect(encryptCall.KeyId).not.toMatch(/^[a-f0-9]{32}$/); // not a raw hardcoded key
  });

  // AC: No plaintext PII is logged at any point during encrypt
  it('does not log plaintext value during encryption', async () => {
    mockSend.mockResolvedValue({ CiphertextBlob: CIPHERTEXT });
    const consoleSpy = vi.spyOn(console, 'log');
    await encrypt(PLAINTEXT);
    const allLogs = consoleSpy.mock.calls.flat().join(' ');
    expect(allLogs).not.toContain(PLAINTEXT);
    consoleSpy.mockRestore();
  });

  it('throws when called with an empty value', async () => {
    await expect(encrypt('')).rejects.toThrow();
  });
});

describe('KMS decrypt()', () => {
  beforeEach(() => vi.clearAllMocks());

  // AC: decrypt(buffer) returns the original plaintext
  it('returns original plaintext string after decrypt', async () => {
    mockSend.mockResolvedValue({
      Plaintext: Buffer.from(PLAINTEXT, 'utf8'),
    });
    const result = await decrypt(CIPHERTEXT);
    expect(result).toBe(PLAINTEXT);
    expect(typeof result).toBe('string');
  });

  // AC: Unit tests cover encrypt and decrypt round-trip
  it('round-trip: encrypt then decrypt returns original value', async () => {
    mockSend
      .mockResolvedValueOnce({ CiphertextBlob: CIPHERTEXT })
      .mockResolvedValueOnce({ Plaintext: Buffer.from(PLAINTEXT, 'utf8') });

    const encrypted = await encrypt(PLAINTEXT);
    const decrypted = await decrypt(encrypted);
    expect(decrypted).toBe(PLAINTEXT);
  });

  it('throws when called with an empty buffer', async () => {
    await expect(decrypt(null)).rejects.toThrow();
  });

  // AC: No plaintext PII is logged at any point during decrypt
  it('does not log plaintext value during decryption', async () => {
    mockSend.mockResolvedValue({ Plaintext: Buffer.from(PLAINTEXT, 'utf8') });
    const consoleSpy = vi.spyOn(console, 'log');
    await decrypt(CIPHERTEXT);
    const allLogs = consoleSpy.mock.calls.flat().join(' ');
    expect(allLogs).not.toContain(PLAINTEXT);
    consoleSpy.mockRestore();
  });
});
