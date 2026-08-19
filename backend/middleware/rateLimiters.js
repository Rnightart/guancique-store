/**
 * middleware/rateLimiters.js
 * Two limiters: a loose one for the whole API, and a strict one for the
 * auth endpoints that are most attractive to brute-force / credential
 * stuffing attempts.
 */
const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again in a few minutes." }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login/register attempts. Please try again later." }
});

module.exports = { apiLimiter, authLimiter };
