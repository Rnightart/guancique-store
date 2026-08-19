/**
 * middleware/errorHandler.js
 * Central error handler. Route handlers can `next(err)` or throw inside an
 * async wrapper (see utils/asyncHandler.js) and it lands here.
 */
function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(err);

  if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
    return res.status(409).json({ error: "That record already exists." });
  }

  const status = err.status || 500;
  const message = status === 500 && process.env.NODE_ENV === "production"
    ? "Something went wrong on our end."
    : err.message || "Unexpected error.";

  res.status(status).json({ error: message });
}

module.exports = { notFoundHandler, errorHandler };
