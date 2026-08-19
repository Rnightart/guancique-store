/**
 * controllers/users.controller.js
 * The logged-in user's own profile + their order history.
 */
const { db } = require("../config/database");
const { isNonEmptyString, sanitizeText } = require("../utils/validators");

const getProfile = (req, res) => {
  const user = db.prepare("SELECT id, name, email, role, created_at FROM users WHERE id = ?").get(req.session.user.id);
  if (!user) return res.status(404).json({ error: "User not found." });
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.created_at } });
};

const updateProfile = (req, res) => {
  const name = sanitizeText(req.body.name);
  if (!isNonEmptyString(name, 100)) {
    return res.status(400).json({ error: "Invalid input.", fields: { name: "Name is required (max 100 characters)." } });
  }
  db.prepare("UPDATE users SET name = ? WHERE id = ?").run(name, req.session.user.id);
  req.session.user.name = name;
  res.json({ user: { ...req.session.user, name } });
};

const getMyOrders = (req, res) => {
  const orders = db.prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC").all(req.session.user.id);
  const itemsStmt = db.prepare("SELECT product_id AS productId, name, price, quantity FROM order_items WHERE order_id = ?");

  const withItems = orders.map(o => ({
    id: o.id,
    status: o.status,
    subtotal: o.subtotal,
    shipping: o.shipping,
    total: o.total,
    createdAt: o.created_at,
    items: itemsStmt.all(o.id)
  }));

  res.json({ orders: withItems });
};

module.exports = { getProfile, updateProfile, getMyOrders };
