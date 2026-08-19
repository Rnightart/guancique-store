/**
 * config/database.js
 * Opens (or creates) the SQLite database file and makes sure every table
 * exists. Runs once when the server starts — nothing to do manually.
 */
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");
const bcrypt = require("bcrypt");

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, "..", "db", "gancique.sqlite");

// Make sure the folder that holds the .sqlite file exists.
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT NOT NULL,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL UNIQUE,
      slug       TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      slug        TEXT NOT NULL UNIQUE,
      description TEXT,
      price       REAL NOT NULL CHECK (price >= 0),
      old_price   REAL,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      image       TEXT,
      badge       TEXT CHECK (badge IN ('best', 'new', 'sale') OR badge IS NULL),
      colors      TEXT NOT NULL DEFAULT '[]',
      rating      REAL NOT NULL DEFAULT 0,
      reviews     INTEGER NOT NULL DEFAULT 0,
      stock       INTEGER NOT NULL DEFAULT 100,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity   INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (user_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status     TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'processing', 'shipped', 'cancelled')),
      subtotal   REAL NOT NULL,
      shipping   REAL NOT NULL DEFAULT 0,
      total      REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
      name       TEXT NOT NULL,
      price      REAL NOT NULL,
      quantity   INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
  `);
}

function seedIfEmpty() {
  const { count: catCount } = db.prepare("SELECT COUNT(*) AS count FROM categories").get();
  if (catCount === 0) {
    const insertCat = db.prepare("INSERT INTO categories (name, slug) VALUES (?, ?)");
    const categories = ["Anime", "Gaming", "Custom Name", "Couple", "Cars", "Motorcycles", "Cute Animals", "Accessories"];
    const insertMany = db.transaction((rows) => rows.forEach(name => {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      insertCat.run(name, slug);
    }));
    insertMany(categories);
    console.log(`[db] Seeded ${categories.length} categories.`);
  }

  const { count: prodCount } = db.prepare("SELECT COUNT(*) AS count FROM products").get();
  if (prodCount === 0) {
    const catRows = db.prepare("SELECT id, name FROM categories").all();
    const catIdByName = Object.fromEntries(catRows.map(c => [c.name, c.id]));

    // Mirrors the product catalog already used by the static frontend (js/main.js)
    // so the API returns data the existing UI already knows how to render.
    const products = [
      ["Sakura Chibi Anime Keychain", "Anime", 8.99, null, "https://placehold.co/600x600/DBEAFE/2563EB?text=Anime+Keychain", "best", ["#2563EB","#F97316","#111827"], 4.8, 214],
      ["Pixel Gamepad Keychain", "Gaming", 7.49, 9.99, "https://placehold.co/600x600/E0E7FF/2563EB?text=Gamepad+Keychain", "sale", ["#2563EB","#111827"], 4.6, 158],
      ["Custom Name Acrylic Keychain", "Custom Name", 11.99, null, "https://placehold.co/600x600/FFEDD5/F97316?text=Custom+Name", "best", ["#F97316","#2563EB","#111827"], 4.9, 342],
      ["Matching Couple Heart Keychains", "Couple", 14.99, 18.99, "https://placehold.co/600x600/FCE7F3/DB2777?text=Couple+Set", "sale", ["#F97316","#111827"], 4.7, 189],
      ["Retro Classic Car Keychain", "Cars", 9.99, null, "https://placehold.co/600x600/DCFCE7/16A34A?text=Classic+Car", "new", ["#111827","#2563EB"], 4.5, 96],
      ["Chopper Motorcycle Keychain", "Motorcycles", 10.49, null, "https://placehold.co/600x600/FEF3C7/D97706?text=Motorcycle", null, ["#111827","#F97316"], 4.6, 74],
      ["Sleepy Panda Keychain", "Cute Animals", 6.99, null, "https://placehold.co/600x600/F1F5F9/475569?text=Panda+Keychain", "best", ["#111827","#2563EB","#F97316"], 4.9, 401],
      ["Leather Keychain Strap", "Accessories", 5.49, null, "https://placehold.co/600x600/E2E8F0/334155?text=Leather+Strap", null, ["#111827","#78350F"], 4.4, 88],
      ["Ghost Anime Villain Keychain", "Anime", 9.49, null, "https://placehold.co/600x600/EDE9FE/7C3AED?text=Anime+Villain", "new", ["#7C3AED","#111827"], 4.7, 133],
      ["Retro Joystick Keychain", "Gaming", 8.49, null, "https://placehold.co/600x600/CFFAFE/0E7490?text=Joystick", null, ["#2563EB","#111827"], 4.5, 61],
      ["Custom Initial Letter Keychain", "Custom Name", 6.99, null, "https://placehold.co/600x600/FFF7ED/EA580C?text=Initial+Charm", "best", ["#F97316","#2563EB"], 4.8, 276],
      ["Couple Puzzle Piece Keychains", "Couple", 13.49, null, "https://placehold.co/600x600/FDF2F8/BE185D?text=Puzzle+Set", null, ["#F97316","#111827"], 4.6, 142],
      ["Off-Road Truck Keychain", "Cars", 10.99, 12.99, "https://placehold.co/600x600/ECFDF5/059669?text=Truck+Keychain", "sale", ["#111827","#16A34A"], 4.4, 52],
      ["Sport Bike Keychain", "Motorcycles", 9.99, null, "https://placehold.co/600x600/FEF2F2/DC2626?text=Sport+Bike", null, ["#DC2626","#111827"], 4.5, 47],
      ["Chubby Cat Keychain", "Cute Animals", 6.49, null, "https://placehold.co/600x600/FFFBEB/D97706?text=Cat+Keychain", "best", ["#111827","#F97316","#2563EB"], 4.9, 355],
      ["Keychain Carabiner Clip", "Accessories", 4.99, null, "https://placehold.co/600x600/F5F3FF/6D28D9?text=Carabiner+Clip", "new", ["#111827","#2563EB","#F97316"], 4.3, 64]
    ];

    const insertProd = db.prepare(`
      INSERT INTO products (name, slug, description, price, old_price, category_id, image, badge, colors, rating, reviews)
      VALUES (@name, @slug, @description, @price, @old_price, @category_id, @image, @badge, @colors, @rating, @reviews)
    `);
    const insertMany = db.transaction((rows) => rows.forEach(row => insertProd.run(row)));

    insertMany(products.map(([name, category, price, oldPrice, image, badge, colors, rating, reviews]) => ({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      description: `A ${category.toLowerCase()} keychain from Gancique Store, made with premium materials and finished by hand.`,
      price,
      old_price: oldPrice,
      category_id: catIdByName[category] || null,
      image,
      badge,
      colors: JSON.stringify(colors),
      rating,
      reviews
    })));
    console.log(`[db] Seeded ${products.length} products.`);
  }
}

function ensureAdminUser() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Store Admin";
  if (!email || !password) return;

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
  if (existing) return;

  const hash = bcrypt.hashSync(password, 12);
  db.prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')")
    .run(name, email.toLowerCase(), hash);
  console.log(`[db] Created initial admin account: ${email}`);
}

function initDatabase() {
  initSchema();
  seedIfEmpty();
  ensureAdminUser();
}

module.exports = { db, initDatabase, DB_PATH };
