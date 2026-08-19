/**
 * controllers/orders.controller.js
 * "Checkout Simulation": turns the current server-side cart into an order
 * (no real payment gateway involved), then empties the cart.
 */
const { db } = require("../config/database");

const checkout = (req, res) => {
  const cartRows = db.prepare(`
    SELECT ci.product_id, ci.quantity, p.name, p.price
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    WHERE ci.user_id = ?
  `).all(req.session.user.id);

  if (cartRows.length === 0) {
    return res.status(400).json({ error: "Your cart is empty." });
  }

  const subtotal = cartRows.reduce((sum, r) => sum + r.price * r.quantity, 0);
  const shipping = subtotal >= 35 ? 0 : 4.99;
  const total = subtotal + shipping;

  const placeOrder = db.transaction(() => {
    const orderResult = db.prepare(`
      INSERT INTO orders (user_id, status, subtotal, shipping, total)
      VALUES (?, 'paid', ?, ?, ?)
    `).run(req.session.user.id, subtotal, shipping, total);

    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, name, price, quantity)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const row of cartRows) {
      insertItem.run(orderResult.lastInsertRowid, row.product_id, row.name, row.price, row.quantity);
    }

    db.prepare("DELETE FROM cart_items WHERE user_id = ?").run(req.session.user.id);
    return orderResult.lastInsertRowid;
  });

  const orderId = placeOrder();
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
  const items = db.prepare("SELECT product_id AS productId, name, price, quantity FROM order_items WHERE order_id = ?").all(orderId);

  res.status(201).json({
    order: {
      id: order.id,
      status: order.status,
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      createdAt: order.created_at,
      items
    }
  });
};

const getOrder = (req, res) => {
  const order = db.prepare("SELECT * FROM orders WHERE id = ? AND user_id = ?").get(req.params.id, req.session.user.id);
  if (!order) return res.status(404).json({ error: "Order not found." });
  const items = db.prepare("SELECT product_id AS productId, name, price, quantity FROM order_items WHERE order_id = ?").all(order.id);
  res.json({ order: { ...order, createdAt: order.created_at, items } });
};

module.exports = { checkout, getOrder };
