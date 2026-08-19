/**
 * controllers/products.controller.js
 * Public listing/detail (with the same filters the frontend's products.html
 * already uses: category, maxPrice, sort, q) plus admin CRUD.
 */
const { db } = require("../config/database");
const { validateProduct } = require("../utils/validators");

const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function serializeProduct(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: row.price,
    oldPrice: row.old_price,
    category: row.category_name || null,
    categoryId: row.category_id,
    image: row.image,
    badge: row.badge,
    colors: JSON.parse(row.colors || "[]"),
    rating: row.rating,
    reviews: row.reviews,
    stock: row.stock
  };
}

const BASE_SELECT = `
  SELECT p.*, c.name AS category_name
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
`;

const listProducts = (req, res) => {
  const { category, maxPrice, sort, q } = req.query;
  const clauses = [];
  const params = {};

  if (category) { clauses.push("c.name = @category"); params.category = category; }
  if (maxPrice) { clauses.push("p.price <= @maxPrice"); params.maxPrice = Number(maxPrice); }
  if (q) { clauses.push("(p.name LIKE @q OR c.name LIKE @q)"); params.q = `%${q}%`; }

  let sql = BASE_SELECT + (clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "");

  const sortMap = {
    "price-low": " ORDER BY p.price ASC",
    "price-high": " ORDER BY p.price DESC",
    "newest": " ORDER BY p.created_at DESC",
    "popularity": " ORDER BY p.reviews DESC"
  };
  sql += sortMap[sort] || sortMap.popularity;

  const rows = db.prepare(sql).all(params);
  res.json({ products: rows.map(serializeProduct), count: rows.length });
};

const getProduct = (req, res) => {
  const row = db.prepare(`${BASE_SELECT} WHERE p.id = ?`).get(req.params.id);
  if (!row) return res.status(404).json({ error: "Product not found." });
  res.json({ product: serializeProduct(row) });
};

const createProduct = (req, res) => {
  const { valid, errors, data } = validateProduct(req.body);
  if (!valid) return res.status(400).json({ error: "Invalid input.", fields: errors });

  let slug = slugify(data.name);
  const slugExists = db.prepare("SELECT id FROM products WHERE slug = ?").get(slug);
  if (slugExists) slug = `${slug}-${Date.now().toString(36)}`;

  const result = db.prepare(`
    INSERT INTO products (name, slug, description, price, old_price, category_id, image, badge, colors)
    VALUES (@name, @slug, @description, @price, @oldPrice, @categoryId, @image, @badge, @colors)
  `).run({
    name: data.name,
    slug,
    description: data.description,
    price: data.price,
    oldPrice: req.body.oldPrice != null ? Number(req.body.oldPrice) : null,
    categoryId: data.categoryId,
    image: data.image,
    badge: data.badge,
    colors: JSON.stringify(data.colors)
  });

  const row = db.prepare(`${BASE_SELECT} WHERE p.id = ?`).get(result.lastInsertRowid);
  res.status(201).json({ product: serializeProduct(row) });
};

const updateProduct = (req, res) => {
  const existing = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Product not found." });

  const { valid, errors, data } = validateProduct({ ...existing, ...req.body });
  if (!valid) return res.status(400).json({ error: "Invalid input.", fields: errors });

  db.prepare(`
    UPDATE products
    SET name = @name, description = @description, price = @price, old_price = @oldPrice,
        category_id = @categoryId, image = @image, badge = @badge, colors = @colors,
        updated_at = datetime('now')
    WHERE id = @id
  `).run({
    id: req.params.id,
    name: data.name,
    description: data.description,
    price: data.price,
    oldPrice: req.body.oldPrice != null ? Number(req.body.oldPrice) : existing.old_price,
    categoryId: data.categoryId,
    image: data.image || existing.image,
    badge: data.badge,
    colors: JSON.stringify(data.colors.length ? data.colors : JSON.parse(existing.colors || "[]"))
  });

  const row = db.prepare(`${BASE_SELECT} WHERE p.id = ?`).get(req.params.id);
  res.json({ product: serializeProduct(row) });
};

const deleteProduct = (req, res) => {
  const existing = db.prepare("SELECT id FROM products WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Product not found." });
  db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
  res.status(204).send();
};

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
