// AC: TASK-004 — GET /api/cars
// Returns a paginated list of available cars.
// Validates query params with zod. No PII involved.

const { Router } = require('express');
const { z }      = require('zod');
const db         = require('../db');

const router = Router();

const querySchema = z.object({
  page:  z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// GET /api/cars?page=1&limit=20
router.get('/', async (req, res, next) => {
  try {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid query parameters.',
        detail: parsed.error.flatten().fieldErrors,
      });
    }

    const { page, limit } = parsed.data;
    const offset = (page - 1) * limit;

    const [cars, [{ count }]] = await Promise.all([
      db('cars')
        .select('id', 'name', 'type', 'availability_status')
        .orderBy('name', 'asc')
        .limit(limit)
        .offset(offset),
      db('cars').count('id as count'),
    ]);

    return res.json({
      cars,
      total: parseInt(count, 10),
      page,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
