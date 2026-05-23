// AC: TASK-004 — GET /api/cars tests
// Covers all acceptance criteria for the cars endpoint.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../index.js';

// Mock the database module
vi.mock('../db.js', () => {
  const mockDb = vi.fn();
  mockDb.mockImplementation((table) => ({
    select: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    count: vi.fn().mockReturnThis(),
    then: vi.fn(),
  }));
  return { default: mockDb };
});

import db from '../db.js';

const mockCars = [
  { id: 'uuid-1', name: 'Toyota Corolla', type: 'Sedan',  availability_status: true  },
  { id: 'uuid-2', name: 'Ford Transit',   type: 'Van',    availability_status: false },
  { id: 'uuid-3', name: 'BMW 3 Series',   type: 'Saloon', availability_status: true  },
];

function setupDbMock(cars = mockCars, count = mockCars.length) {
  db.mockImplementation((table) => {
    const chain = {
      select:  vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit:   vi.fn().mockReturnThis(),
      offset:  vi.fn().mockReturnThis(),
      count:   vi.fn().mockReturnThis(),
    };

    // Resolve based on call order: first call returns cars, second returns count
    let callCount = 0;
    chain.then = vi.fn((resolve) => {
      callCount++;
      return Promise.resolve(callCount === 1 ? cars : [{ count: String(count) }]).then(resolve);
    });

    return chain;
  });
}

describe('GET /api/cars', () => {
  beforeEach(() => vi.clearAllMocks());

  // AC: Returns a list of cars with name, type, availability_status
  it('returns a list of cars with correct fields', async () => {
    setupDbMock();
    const res = await request(app).get('/api/cars');
    expect(res.status).toBe(200);
    expect(res.body.cars).toBeInstanceOf(Array);
    expect(res.body.cars[0]).toHaveProperty('name');
    expect(res.body.cars[0]).toHaveProperty('type');
    expect(res.body.cars[0]).toHaveProperty('availability_status');
  });

  // AC: Response includes total count and current page
  it('returns total count and current page', async () => {
    setupDbMock();
    const res = await request(app).get('/api/cars');
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('page');
    expect(res.body.total).toBe(mockCars.length);
    expect(res.body.page).toBe(1);
  });

  // AC: Pagination works correctly with page and limit query params
  it('paginates correctly with page and limit params', async () => {
    setupDbMock([mockCars[0]], 1);
    const res = await request(app).get('/api/cars?page=2&limit=1');
    expect(res.status).toBe(200);
    expect(res.body.page).toBe(2);
  });

  // AC: Invalid query params return a 400 error with a clear message
  it('returns 400 for invalid page param', async () => {
    const res = await request(app).get('/api/cars?page=abc');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 for page less than 1', async () => {
    const res = await request(app).get('/api/cars?page=0');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // AC: Error handling — DB errors return 500 with no stack trace exposed
  it('returns 500 without stack trace when DB throws', async () => {
    db.mockImplementation(() => { throw new Error('DB connection failed'); });
    const res = await request(app).get('/api/cars');
    expect(res.status).toBe(500);
    expect(res.body.error).not.toMatch(/at Object\.|at Module\./); // no stack trace
  });
});
