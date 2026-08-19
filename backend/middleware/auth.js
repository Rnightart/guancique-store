/**
 * middleware/auth.js
 * Session-based auth guards. express-session already put `req.session.user`
 * in place at login — these just check it's there (and, for admin routes,
 * that the role matches).
 */

function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: "You must be logged in to do that." });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: "You must be logged in to do that." });
  }
  if (req.session.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required." });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
