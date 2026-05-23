// AC: TASK-012 — DELETE /api/users/data
// GDPR right-to-erasure endpoint.
// Accepts email, invokes deletion service, returns confirmation.
// No PII is logged during the request lifecycle.

const { Router }        = require('express');
const { z }             = require('zod');
const { deleteUserData } = require('../services/deletionService');

const router = Router();

const deletionSchema = z.object({
  email: z.string().email({ message: 'A valid email address is required.' }),
});

// DELETE /api/users/data
router.delete('/data', async (req, res, next) => {
  try {
    const parsed = deletionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed.',
        detail: parsed.error.flatten().fieldErrors,
      });
    }

    // Do NOT log the email — TASK-012 AC: no PII in logs
    console.log('[users] DELETE /api/users/data — deletion request received');

    const result = await deleteUserData(parsed.data.email);

    return res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
