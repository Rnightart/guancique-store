/**
 * controllers/auth.controller.js
 * Register, login, logout, and "who am I" for the current session.
 */
const bcrypt = require("bcrypt");
const { db } = require("../config/database");
const { validateRegistration, validateLogin } = require("../utils/validators");

const SALT_ROUNDS = 12;

function toPublicUser(row) {
  return { id: row.id, name: row.name, email: row.email, role: row.role, createdAt: row.created_at };
}

const register = (req, res) => {
  const { valid, errors, data } = validateRegistration(req.body);
  if (!valid) return res.status(400).json({ error: "Invalid input.", fields: errors });

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(data.email);
  if (existing) return res.status(409).json({ error: "An account with that email already exists." });

  const hash = bcrypt.hashSync(data.password, SALT_ROUNDS);
  const result = db
    .prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'customer')")
    .run(data.name, data.email, hash);

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);

  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: "Could not start a session." });
    req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };
    res.status(201).json({ user: toPublicUser(user) });
  });
};

const login = (req, res) => {
  const { valid, errors, data } = validateLogin(req.body);
  if (!valid) return res.status(400).json({ error: "Invalid input.", fields: errors });

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(data.email);
  const passwordOk = user ? bcrypt.compareSync(data.password, user.password_hash) : false;

  // Same message whether the email or the password was wrong — avoids
  // leaking which accounts exist.
  if (!user || !passwordOk) {
    return res.status(401).json({ error: "Incorrect email or password." });
  }

  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: "Could not start a session." });
    req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };
    res.json({ user: toPublicUser(user) });
  });
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Could not log out cleanly." });
    res.clearCookie("gancique.sid");
    res.json({ message: "Logged out." });
  });
};

const me = (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: "Not logged in." });
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.session.user.id);
  if (!user) return res.status(401).json({ error: "Not logged in." });
  res.json({ user: toPublicUser(user) });
};

module.exports = { register, login, logout, me };
