/**
 * controllers/categories.controller.js
 * Public read access; create/update/delete are admin-only (wired in routes).
 */
const { db } = require("../config/database");
const { validateCategory } = require("../utils/validators");

const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const listCategories = (req, res) => {
  const categories = db.prepare(`
    SELECT c.id, c.name, c.slug, COUNT(p.id) AS productCount
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id
    GROUP BY c.id
    ORDER BY c.name ASC
  `).all();
  res.json({ categories });
};

const getCategory = (req, res) => {
  const category = db.prepare("SELECT * FROM categories WHERE id = ?").get(req.params.id);
  if (!category) return res.status(404).json({ error: "Category not found." });
  res.json({ category });
};

const createCategory = (req, res) => {
  const { valid, errors, data } = validateCategory(req.body);
  if (!valid) return res.status(400).json({ error: "Invalid input.", fields: errors });

  const slug = slugify(data.name);
  const existing = db.prepare("SELECT id FROM categories WHERE name = ? OR slug = ?").get(data.name, slug);
  if (existing) return res.status(409).json({ error: "A category with that name already exists." });

  const result = db.prepare("INSERT INTO categories (name, slug) VALUES (?, ?)").run(data.name, slug);
  const category = db.prepare("SELECT * FROM categories WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json({ category });
};

const updateCategory = (req, res) => {
  const existing = db.prepare("SELECT * FROM categories WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Category not found." });

  const { valid, errors, data } = validateCategory(req.body);
  if (!valid) return res.status(400).json({ error: "Invalid input.", fields: errors });

  const slug = slugify(data.name);
  db.prepare("UPDATE categories SET name = ?, slug = ? WHERE id = ?").run(data.name, slug, req.params.id);
  const category = db.prepare("SELECT * FROM categories WHERE id = ?").get(req.params.id);
  res.json({ category });
};

const deleteCategory = (req, res) => {
  const existing = db.prepare("SELECT id FROM categories WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Category not found." });
  db.prepare("DELETE FROM categories WHERE id = ?").run(req.params.id);
  res.status(204).send();
};

module.exports = { listCategories, getCategory, createCategory, updateCategory, deleteCategory };
