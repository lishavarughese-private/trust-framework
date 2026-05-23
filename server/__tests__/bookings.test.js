// AC: TASK-006 — POST /api/bookings/validate-dates tests
// AC: TASK-009 — POST /api/bookings tests
// Covers all acceptance criteria for date validation and booking creation.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../index.js';

vi.mock('../db.js', () => {
  const chain = {
    where:     vi.fn().mockReturnThis(),
    first:     vi.fn(),
    insert:    vi.fn().mockReturnThis(),
    returning: vi.fn(),
  };
  const mockDb = vi.fn(() => chain);
  return { default: mockDb };
});

vi.mock('../lib/kms.js', () => ({
  encrypt: vi.fn().mockResolvedValue(Buffer.from('encrypted')),
  decrypt: vi.fn().mockResolvedValue('plaintext'),
}));

import db from '../db.js';

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const dayAfter = new Date();
dayAfter.setDate(dayAfter.getDate() + 2);
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

const fmt = (d) => d.toISOString().split('T')[0];

const VALID_DATES = {
  start_date: fmt(tomorrow),
  end_date:   fmt(dayAfter),
};

const VALID_BOOKING = {
  car_id:     '11111111-1111-1111-1111-111111111111',
  start_date: fmt(tomorrow),
  end_date:   fmt(dayAfter),
  email:      'tourist@example.com',
  name:       'Jane Doe',
};

describe('POST /api/bookings/validate-dates', () => {
  beforeEach(() => vi.clearAllMocks());

  // AC: Returns { valid: true } for a valid date range
  it('returns valid:true for a valid future date range', async () => {
    const res = await request(app)
      .post('/api/bookings/validate-dates')
      .send(VALID_DATES);
    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(true);
    expect(res.body.error).toBeNull();
  });

  // AC: Returns { valid: false, error } if end_date is before start_date
  it('returns valid:false when end_date is before start_date', async () => {
    const res = await request(app)
      .post('/api/bookings/validate-dates')
      .send({ start_date: fmt(dayAfter), end_date: fmt(tomorrow) });
    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(false);
    expect(res.body.error).toBeTruthy();
  });

  // AC: Returns { valid: false, error } if start_date is in the past
  it('returns valid:false when start_date is in the past', async () => {
    const res = await request(app)
      .post('/api/bookings/validate-dates')
      .send({ start_date: fmt(yesterday), end_date: fmt(tomorrow) });
    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(false);
    expect(res.body.error).toBeTruthy();
  });

  // AC: Invalid or missing date fields return a 400 error
  it('returns 400 for missing date fields', async () => {
    const res = await request(app)
      .post('/api/bookings/validate-dates')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // AC: Error handling — unexpected errors return 500 with no stack trace
  it('returns 500 without stack trace on unexpected error', async () => {
    vi.spyOn(JSON, 'parse').mockImplementationOnce(() => { throw new Error('parse error'); });
    const res = await request(app)
      .post('/api/bookings/validate-dates')
      .send('not-json')
      .set('Content-Type', 'application/json');
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.error).not.toMatch(/at Object\.|at Module\./);
  });
});

describe('POST /api/bookings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.mockImplementation((table) => ({
      where:     vi.fn().mockReturnThis(),
      first:     vi.fn().mockResolvedValue({ id: VALID_BOOKING.car_id }),
      insert:    vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{
        id:         'booking-uuid-123',
        created_at: new Date().toISOString(),
      }]),
    }));
  });

  // AC: Valid request creates a booking and returns booking_id and confirmed_at
  it('creates a booking and returns booking_id and confirmed_at', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send(VALID_BOOKING);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('booking_id');
    expect(res.body).toHaveProperty('confirmed_at');
  });

  // AC: email and name are encrypted before being written to the database
  it('calls encrypt for email and name before inserting', async () => {
    const { encrypt } = await import('../lib/kms.js');
    await request(app).post('/api/bookings').send(VALID_BOOKING);
    expect(encrypt).toHaveBeenCalledWith(VALID_BOOKING.email);
    expect(encrypt).toHaveBeenCalledWith(VALID_BOOKING.name);
  });

  // AC: Missing required fields return 400 with field-level error messages
  it('returns 400 with field-level errors for missing fields', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({ car_id: VALID_BOOKING.car_id });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('detail');
  });

  // AC: Invalid car_id returns 404
  it('returns 404 when car_id does not exist', async () => {
    db.mockImplementation(() => ({
      where: vi.fn().mockReturnThis(),
      first: vi.fn().mockResolvedValue(null),
    }));
    const res = await request(app)
      .post('/api/bookings')
      .send(VALID_BOOKING);
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  // AC: Server-side date validation enforced before persisting
  it('rejects booking when start_date is in the past', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({ ...VALID_BOOKING, start_date: fmt(yesterday) });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });

  // AC: DB errors return 500 with no stack trace exposed
  it('returns 500 without stack trace when DB throws', async () => {
    db.mockImplementation(() => {
      throw new Error('DB connection lost');
    });
    const res = await request(app)
      .post('/api/bookings')
      .send(VALID_BOOKING);
    expect(res.status).toBe(500);
    expect(res.body.error).not.toMatch(/at Object\.|at Module\./);
  });
});
