/**
 * server.js
 * Entry point. Loads config, opens/initializes the SQLite database,
 * wires up security middleware, mounts every route group, and starts
 * listening.
 */
require("dotenv").config();

const path = require("path");
const express = require("express");
const session = require("express-session");
const helmet = require("helmet");
const cors = require("cors");

const { initDatabase } = require("./config/database");
const { apiLimiter } = require("./middleware/rateLimiters");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/users.routes");
const productRoutes = require("./routes/products.routes");
const categoryRoutes = require("./routes/categories.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/orders.routes");

// 1. Database — creates the .sqlite file and tables on first run, seeds
//    the catalog, and makes sure an admin account exists.
initDatabase();

const app = express();
const PORT = process.env.PORT || 4000;
const isProduction = process.env.NODE_ENV === "production";

if (!process.env.SESSION_SECRET) {
  if (isProduction) {
    console.error("SESSION_SECRET is not set. Refusing to start in production without it.");
    process.exit(1);
  }
  console.warn("[warn] SESSION_SECRET is not set — using an insecure default for local development only.");
  process.env.SESSION_SECRET = "dev-only-insecure-secret";
}

// Behind a reverse proxy (Nginx) in production, so secure cookies work.
if (isProduction) app.set("trust proxy", 1);

// Toggle: set SERVE_FRONTEND=true in .env to have this same Express process
// serve the frontend files too (single server, single port, no CORS needed).
// Leave it unset/false to keep running the frontend separately (Live Server,
// Nginx, etc.) and only use this process as the API.
const serveFrontend = process.env.SERVE_FRONTEND === "true";
const frontendDir = path.join(__dirname, ".."); // project root, one level above /backend

// 2. Security headers
// The frontend's login/register/account/admin pages use small inline
// <script> blocks. Helmet's default Content-Security-Policy blocks inline
// scripts, so it's relaxed only when this process is also serving those
// pages. If you later move those scripts into external .js files, you can
// remove this override and keep Helmet's stricter default.
app.use(helmet(serveFrontend ? { contentSecurityPolicy: false } : {}));

// 3. CORS — only the configured frontend origin may call the API, and
//    credentials (the session cookie) are allowed through.
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5500",
  credentials: true
}));

// 4. Body parsing
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

// 5. Sessions — httpOnly + sameSite always on; `secure` only over HTTPS
//    (i.e. in production behind Nginx with TLS).
app.use(session({
  name: "gancique.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: Number(process.env.SESSION_MAX_AGE_MS) || 7 * 24 * 60 * 60 * 1000
  }
}));

// 6. Rate limiting for the whole API (auth routes add a stricter limiter
//    of their own on top of this).
app.use("/api", apiLimiter);

// 7. Routes
app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

// 8. Serve the frontend from this same process (only when SERVE_FRONTEND=true)
if (serveFrontend) {
  app.use(express.static(frontendDir));
  // Anything that isn't an API route and isn't a real static file falls
  // back to the 404 page (this is a static multi-page site, not an SPA,
  // so no index.html catch-all is needed).
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.status(404).sendFile(path.join(frontendDir, "404.html"));
  });
}

// 9. 404 + error handling (must be last)
app.use("/api", notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Gancique Store API listening on http://localhost:${PORT}`);
  if (serveFrontend) {
    console.log(`Frontend is also being served from this process: http://localhost:${PORT}`);
  }
});
