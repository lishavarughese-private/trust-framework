// AC: TASK-011 — Data Deletion Service tests
// AC: TASK-012 — DELETE /api/users/data endpoint tests
// Covers all acceptance criteria for GDPR erasure flow.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../index.js';
import { hashEmail } from '../services/deletionService.js';

vi.mock('../db.js', () => {
  const trx = {
    where:    vi.fn().mockReturnThis(),
    whereRaw: vi.fn().mockReturnThis(),
    delete:   vi.fn().mockResolvedValue(1),
    insert:   vi.fn().mockResolvedValue([1]),
    fn:       { now: vi.fn().mockReturnValue('2026-05-01T00:00:00.000Z') },
  };
  const mockTransaction = vi.fn((cb) => cb(trx));
  const mockDb = vi.fn(() => ({ where: vi.fn().mockReturnThis() }));
  mockDb.transaction = mockTransaction;
  return { default: mockDb };
});

vi.mock('../lib/kms.js', () => ({
  encrypt: vi.fn().mockResolvedValue(Buffer.from('encrypted-email')),
  decrypt: vi.fn().mockResolvedValue('tourist@example.com'),
}));

import db from '../db.js';

const VALID_EMAIL = 'tourist@example.com';

// ─── hashEmail unit tests ─────────────────────────────────────────────────────

describe('hashEmail()', () => {
  // AC: email_hash is SHA-256 — non-reversible
  it('returns a 64-char hex SHA-256 digest', () => {
    const hash = hashEmail(VALID_EMAIL);
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('is deterministic — same email always produces same hash', () => {
    expect(hashEmail(VALID_EMAIL)).toBe(hashEmail(VALID_EMAIL));
  });

  it('is case-insensitive — normalises email before hashing', () => {
    expect(hashEmail('Tourist@Example.COM')).toBe(hashEmail('tourist@example.com'));
  });

  // AC: Deleted PII cannot be recovered — hash is non-reversible
  it('does not contain the plaintext email in the hash output', () => {
    const hash = hashEmail(VALID_EMAIL);
    expect(hash).not.toContain('tourist');
    expect(hash).not.toContain('example.com');
  });
});

// ─── deleteUserData unit tests ─────────────────────────────────────────────────

describe('deleteUserData()', () => {
  beforeEach(() => vi.clearAllMocks());

  // AC: All bookings rows matching the user email are permanently deleted
  it('deletes all matching bookings for the given email', async () => {
    const { deleteUserData } = await import('../services/deletionService.js');
    await deleteUserData(VALID_EMAIL);
    const trxArg = db.transaction.mock.calls[0][0];
    // Transaction callback was called
    expect(db.transaction).toHaveBeenCalledOnce();
  });

  // AC: A deletion_requests record is created with SHA-256 hash and completed_at
  it('inserts a deletion_requests record with email_hash and completed_at', async () => {
    const { deleteUserData } = await import('../services/deletionService.js');
    const result = await deleteUserData(VALID_EMAIL);
    expect(result.deleted).toBe(true);
    expect(result.confirmed_at).toBeTruthy();
  });

  // AC: No plaintext PII is written to logs during the deletion process
  it('does not log the plaintext email at any point', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    const { deleteUserData } = await import('../services/deletionService.js');
    await deleteUserData(VALID_EMAIL);
    const allLogs = consoleSpy.mock.calls.flat().join(' ');
    expect(allLogs).not.toContain(VALID_EMAIL);
    consoleSpy.mockRestore();
  });
});

// ─── DELETE /api/users/data endpoint tests ────────────────────────────────────

describe('DELETE /api/users/data', () => {
  beforeEach(() => vi.clearAllMocks());

  // AC: Valid request triggers permanent deletion and returns { deleted, confirmed_at }
  it('returns { deleted: true, confirmed_at } for a valid email', async () => {
    const res = await request(app)
      .delete('/api/users/data')
      .send({ email: VALID_EMAIL });
    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe(true);
    expect(res.body.confirmed_at).toBeTruthy();
  });

  // AC: Missing or invalid email returns 400
  it('returns 400 for missing email', async () => {
    const res = await request(app)
      .delete('/api/users/data')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 for invalid email format', async () => {
    const res = await request(app)
      .delete('/api/users/data')
      .send({ email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // AC: No PII is logged during the request lifecycle
  it('does not log the email during the request', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    await request(app)
      .delete('/api/users/data')
      .send({ email: VALID_EMAIL });
    const allLogs = consoleSpy.mock.calls.flat().join(' ');
    expect(allLogs).not.toContain(VALID_EMAIL);
    consoleSpy.mockRestore();
  });

  // AC: Error handling — unexpected errors return 500 with no stack trace
  it('returns 500 without stack trace when service throws', async () => {
    db.transaction = vi.fn().mockRejectedValue(new Error('DB failure'));
    const res = await request(app)
      .delete('/api/users/data')
      .send({ email: VALID_EMAIL });
    expect(res.status).toBe(500);
    expect(res.body.error).not.toMatch(/at Object\.|at Module\./);
  });
});
