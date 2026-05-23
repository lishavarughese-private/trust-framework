// Car Reservation App — Express API Server
// TLS enforced in production via reverse proxy (nginx / ALB).
// All routes validated with zod. No PII in logs.

require('dotenv').config();

const express      = require('express');
const carsRouter   = require('./routes/cars');
const bookingsRouter = require('./routes/bookings');
const usersRouter  = require('./routes/users');
const errorHandler = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 4000;

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(express.json());

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});

// Enforce HTTPS in production — reject plain HTTP requests
app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === 'production' &&
    req.headers['x-forwarded-proto'] !== 'https'
  ) {
    return res.status(301).redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/cars',     carsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/users',    usersRouter);

// Health check — no sensitive data exposed
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ─── Error Handler ────────────────────────────────────────────────────────────

app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[server] Running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });
}

module.exports = app;
