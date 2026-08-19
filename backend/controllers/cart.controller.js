/**
 * controllers/cart.controller.js
 * Server-side cart for logged-in users. Guests keep using the existing
 * localStorage cart in js/cart.js; when they log in the frontend can call
 * POST /api/cart/merge once to push their local items up to the server.
 */
const { db } = require("../config/database");
const { validateCartItem } = require("../utils/validators");

function serializeCart(userId) {
  const rows = db.prepare(`
    SELECT ci.id AS cartItemId, ci.quantity, p.id, p.name, p.price, p.image, p.stock
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    WHERE ci.user_id = ?
    ORDER BY ci.created_at ASC
  `).all(userId);

  const items = rows.map(r => ({
    cartItemId: r.cartItemId,
    productId: r.id,
    name: r.name,
    price: r.price,
    image: r.image,
    quantity: r.quantity
  }));

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = items.length === 0 ? 0 : (subtotal >= 35 ? 0 : 4.99);
  const total = subtotal + shipping;

  return { items, subtotal, shipping, total };
}

const getCart = (req, res) => {
  res.json(serializeCart(req.session.user.id));
};

const addToCart = (req, res) => {
  const { valid, errors, data } = validateCartItem(req.body);
  if (!valid) return res.status(400).json({ error: "Invalid input.", fields: errors });

  const product = db.prepare("SELECT id FROM products WHERE id = ?").get(data.productId);
  if (!product) return res.status(404).json({ error: "Product not found." });

  const existing = db.prepare("SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?")
    .get(req.session.user.id, data.productId);

  if (existing) {
    const newQty = Math.min(20, existing.quantity + data.quantity);
    db.prepare("UPDATE cart_items SET quantity = ? WHERE id = ?").run(newQty, existing.id);
  } else {
    db.prepare("INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)")
      .run(req.session.user.id, data.productId, data.quantity);
  }

  res.status(201).json(serializeCart(req.session.user.id));
};

const updateCartItem = (req, res) => {
  const quantity = Number(req.body.quantity);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
    return res.status(400).json({ error: "Invalid input.", fields: { quantity: "Quantity must be between 1 and 20." } });
  }

  const item = db.prepare("SELECT * FROM cart_items WHERE id = ? AND user_id = ?").get(req.params.itemId, req.session.user.id);
  if (!item) return res.status(404).json({ error: "Cart item not found." });

  db.prepare("UPDATE cart_items SET quantity = ? WHERE id = ?").run(quantity, item.id);
  res.json(serializeCart(req.session.user.id));
};

const removeCartItem = (req, res) => {
  const item = db.prepare("SELECT * FROM cart_items WHERE id = ? AND user_id = ?").get(req.params.itemId, req.session.user.id);
  if (!item) return res.status(404).json({ error: "Cart item not found." });
  db.prepare("DELETE FROM cart_items WHERE id = ?").run(item.id);
  res.json(serializeCart(req.session.user.id));
};

const clearCart = (req, res) => {
  db.prepare("DELETE FROM cart_items WHERE user_id = ?").run(req.session.user.id);
  res.json(serializeCart(req.session.user.id));
};

/** Merge an array of { productId, quantity } (the guest's localStorage cart) into the server cart. */
const mergeCart = (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  const upsert = db.transaction((rows) => {
    for (const raw of rows) {
      const { valid, data } = validateCartItem(raw);
      if (!valid) continue;
      const product = db.prepare("SELECT id FROM products WHERE id = ?").get(data.productId);
      if (!product) continue;

      const existing = db.prepare("SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?")
        .get(req.session.user.id, data.productId);
      if (existing) {
        db.prepare("UPDATE cart_items SET quantity = ? WHERE id = ?")
          .run(Math.min(20, existing.quantity + data.quantity), existing.id);
      } else {
        db.prepare("INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)")
          .run(req.session.user.id, data.productId, data.quantity);
      }
    }
  });
  upsert(items);
  res.json(serializeCart(req.session.user.id));
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart, mergeCart };
