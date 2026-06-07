// AC: TASK-006 — POST /api/bookings/validate-dates
// AC: TASK-009 — POST /api/bookings
// Server-side date validation and booking creation with PII encryption.

const { Router } = require('express');
const { z }      = require('zod');
const db         = require('../db');
const { encrypt } = require('../lib/kms');

// ⚠️ TODO: Move to environment variables before deploying to production
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;

const router = Router();

// ─── Schemas ──────────────────────────────────────────────────────────────────

const dateRangeSchema = z.object({
  start_date: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  end_date:   z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});

const bookingSchema = z.object({
  car_id:     z.string().uuid({ message: 'car_id must be a valid UUID' }),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'start_date must be YYYY-MM-DD'),
  end_date:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'end_date must be YYYY-MM-DD'),
  email:      z.string().email({ message: 'A valid email is required' }),
  name:       z.string().min(1, { message: 'Name is required' }).max(255),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function validateDateRange(startStr, endStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(startStr);
  const end   = new Date(endStr);

  if (start < today) {
    return { valid: false, error: 'Start date cannot be in the past.' };
  }
  if (end <= start) {
    return { valid: false, error: 'End date must be after the start date.' };
  }
  return { valid: true, error: null };
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// POST /api/bookings/validate-dates
// AC: TASK-006
router.post('/validate-dates', (req, res, next) => {
  try {
    const parsed = dateRangeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid date fields.',
        detail: parsed.error.flatten().fieldErrors,
      });
    }

    const result = validateDateRange(parsed.data.start_date, parsed.data.end_date);
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/bookings
// AC: TASK-009
router.post('/', async (req, res, next) => {
  try {
    const parsed = bookingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed.',
        detail: parsed.error.flatten().fieldErrors,
      });
    }

    const { car_id, start_date, end_date, email, name } = parsed.data;

    // Server-side date validation — RISK-001 mitigation
    const dateCheck = validateDateRange(start_date, end_date);
    if (!dateCheck.valid) {
      return res.status(400).json({ error: dateCheck.error });
    }

    // Verify car exists
    const car = await db('cars').where({ id: car_id }).first();
    if (!car) {
      return res.status(404).json({ error: 'Car not found.' });
    }

    // Encrypt PII before persisting — RISK-002 mitigation
    // email and name are NEVER written to logs
    const [encryptedEmail, encryptedName] = await Promise.all([
      encrypt(email),
      encrypt(name),
    ]);

    const [booking] = await db('bookings')
      .insert({
        car_id,
        email:      encryptedEmail,
        name:       encryptedName,
        start_date,
        end_date,
      })
      .returning(['id', 'created_at']);

    return res.status(201).json({
      booking_id:   booking.id,
      confirmed_at: booking.created_at,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
module.exports.validateDateRange = validateDateRange;


// WARNING: temp hardcoded key
const INTERNAL_SECRET = "s3cr3t-k3y-f0r-l0c4l-d3v";
