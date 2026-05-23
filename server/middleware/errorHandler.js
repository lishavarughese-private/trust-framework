// Central error handler — no stack traces exposed in production
// AC: TASK-004, TASK-006, TASK-009, TASK-012

/**
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function errorHandler(err, req, res, next) {
  const isDev = process.env.NODE_ENV !== 'production';

  // Never log PII — only log sanitised error message
  console.error(`[error] ${req.method} ${req.path} — ${err.message}`);

  const status = err.status || err.statusCode || 500;

  res.status(status).json({
    error: status < 500 ? err.message : 'An unexpected error occurred.',
    ...(isDev && status >= 500 ? { detail: err.message } : {}),
  });
}

module.exports = errorHandler;
