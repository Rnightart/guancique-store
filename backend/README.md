# Gancique Store — Backend API

A REST API for the existing Gancique Store frontend (HTML/CSS/vanilla JS).
Built with Node.js, Express, SQLite (via `better-sqlite3`), bcrypt, and
`express-session`. No frontend files were changed in appearance — only
functional wiring (real links, `js/api.js`, and small auth-aware nav/cart
behavior) was added so the existing UI can talk to this API.

---

## 1. Two ways to combine frontend + backend

**Option A — Combined (recommended, simplest): one server, one port.**
Express serves the API *and* the static frontend files from the same
process. No CORS, no second dev server, one command to run everything.
This is the default (`SERVE_FRONTEND=true` in `.env.example`).

**Option B — Split: two servers.**
Frontend served separately (Live Server, `python -m http.server`, Nginx,
etc.) on its own port, backend runs only the API on another port, and CORS
is configured to allow the frontend's origin. Useful if you want the
frontend on a CDN, or you're actively developing the frontend with hot
reload tooling.

Both options use the exact same backend code — it's one `.env` setting.

## 2. Install dependencies

```bash
cd backend
npm install
```

This installs: `express`, `better-sqlite3`, `bcrypt`, `express-session`,
`dotenv`, `helmet`, `cors`, `express-rate-limit`.

> `better-sqlite3` and `bcrypt` compile a small native module on install.
> On Linux you'll need build tools (`sudo apt install build-essential python3`)
> if a prebuilt binary isn't available for your platform.

## 3. Configure environment variables

```bash
cp .env.example .env
```

Then edit `.env`:

| Variable | Purpose |
|---|---|
| `PORT` | Port the API listens on (default `4000`) |
| `NODE_ENV` | `development` or `production` |
| `FRONTEND_URL` | Exact origin of the frontend (used for CORS + secure cookies) |
| `SESSION_SECRET` | Long random string used to sign session cookies — **change this** |
| `SESSION_MAX_AGE_MS` | How long a login session lasts |
| `DATABASE_PATH` | Where the SQLite file is created |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | First admin account, created automatically on first run |

Generate a strong `SESSION_SECRET` with:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## 4. Run the development server

```bash
npm run dev     # auto-restarts on file changes (Node's built-in --watch)
# or
npm start       # plain node server.js
```

With the default `.env` (`SERVE_FRONTEND=true`), you should see:
```
[db] Seeded 8 categories.
[db] Seeded 16 products.
[db] Created initial admin account: admin@ganciquestore.com
Gancique Store API listening on http://localhost:4000
Frontend is also being served from this process: http://localhost:4000
```

Open **http://localhost:4000** in a browser — that's the whole site,
frontend and API together. No Live Server, no second terminal.

Test the API directly too:
```bash
curl http://localhost:4000/api/health
curl http://localhost:4000/api/products
```

## 5. How the SQLite database initializes

On every server start, `config/database.js`:

1. Opens (or creates) the `.sqlite` file at `DATABASE_PATH`.
2. Runs `CREATE TABLE IF NOT EXISTS` for every table (`users`, `categories`,
   `products`, `cart_items`, `orders`, `order_items`) — safe to run repeatedly.
3. If `categories`/`products` are empty, seeds them with the same 8
   categories and 16 keychains the static frontend already ships with, so
   the API returns data the UI already knows how to render.
4. If no user exists with `ADMIN_EMAIL`, creates one with role `admin`
   (password hashed with bcrypt).

No migration tool, no manual `CREATE DATABASE` step — delete the `.sqlite`
file and restart the server to get a fresh database.

## 6. Connecting the frontend

The frontend already includes `js/api.js`, a small `fetch` wrapper:

```js
// js/api.js
const API_BASE = window.API_BASE || "/api";
```

**Combined mode (default, `SERVE_FRONTEND=true`):** the frontend is served
by this same Express process, so `/api` is already same-origin — nothing to
configure. Just run `npm run dev` and open `http://localhost:4000`.

**Split mode (`SERVE_FRONTEND=false`):** the frontend runs on a different
origin (Live Server on `:5500`, Nginx, a CDN, etc). Two things to set:

1. In `backend/.env`, set `FRONTEND_URL` to that exact origin, e.g.
   `http://localhost:5500` — CORS only allows requests from this origin.
2. In each frontend HTML file, tell `api.js` where the API actually is,
   **before** it loads:
   ```html
   <script>window.API_BASE = "http://localhost:4000/api";</script>
   <script src="js/api.js"></script>
   ```

Every `Api.*` call sends `credentials: "include"` so the session cookie
travels with it — this is why `FRONTEND_URL` must exactly match the
frontend's real origin (including port) whenever the two run separately.

Pages wired to the API:
- `login.html` / `register.html` → `Api.auth.login/register`
- `account.html` → `Api.users.profile/updateProfile/orders`, logout
- `admin.html` → `Api.categories.*`, `Api.products.*` (admin-only, checked both client-side via `Api.auth.me()` and server-side via `requireAdmin`)
- `js/cart.js` → on checkout, if a session exists it calls `Api.cart.merge` + `Api.orders.checkout`; otherwise it falls back to the original client-only simulation so guests are unaffected.

## 7. REST API reference

Base path: `/api`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | — | Liveness check |
| POST | `/auth/register` | — | Create account, starts session |
| POST | `/auth/login` | — | Start session |
| POST | `/auth/logout` | — | End session |
| GET | `/auth/me` | — | Current session's user (401 if none) |
| GET | `/users/me` | session | Profile |
| PUT | `/users/me` | session | Update name |
| GET | `/users/me/orders` | session | Order history |
| GET | `/products` | — | List, filters: `?category=&maxPrice=&sort=&q=` |
| GET | `/products/:id` | — | Detail |
| POST | `/products` | admin | Create |
| PUT | `/products/:id` | admin | Update |
| DELETE | `/products/:id` | admin | Delete |
| GET | `/categories` | — | List (with product counts) |
| POST | `/categories` | admin | Create |
| PUT | `/categories/:id` | admin | Update |
| DELETE | `/categories/:id` | admin | Delete |
| GET | `/cart` | session | Current user's server-side cart |
| POST | `/cart/items` | session | Add item `{ productId, quantity }` |
| POST | `/cart/merge` | session | Merge an array of items (used at checkout) |
| PUT | `/cart/items/:itemId` | session | Update quantity |
| DELETE | `/cart/items/:itemId` | session | Remove item |
| DELETE | `/cart` | session | Empty cart |
| POST | `/orders/checkout` | session | Turn current server cart into an order (simulated payment) |
| GET | `/orders/:id` | session | One of the current user's orders |

`session` = requires a valid login cookie. `admin` = requires a valid login
cookie **and** `role = admin`.

## 8. Security notes

- Passwords hashed with `bcrypt` (12 salt rounds), never stored or logged in plain text.
- All SQL uses parameter binding (`?` / named params) — no string-built queries.
- Every request body is validated and sanitized in `utils/validators.js` before touching the database.
- `helmet()` sets standard security headers (CSP-adjacent headers, no-sniff, etc).
- `express-rate-limit`: 300 req/15min on the whole API, 10 req/15min specifically on `/auth/login` and `/auth/register`.
- Sessions: `httpOnly`, `sameSite: lax` always; `secure` (HTTPS-only) automatically turned on when `NODE_ENV=production`.
- CORS locked to a single configured origin, not `*`.
- Generic "Incorrect email or password" message on login failure — doesn't reveal whether the email exists.
- Server refuses to boot in production if `SESSION_SECRET` isn't set.

## 9. Deploying to a Linux VPS

**Assumes:** Ubuntu 22.04+, a domain pointed at the VPS, root or sudo access.

### 9.1 Server prep
```bash
sudo apt update && sudo apt install -y nodejs npm nginx build-essential python3 git
sudo npm install -g pm2
```
(Use Node 18+; consider `nvm` if your distro's `nodejs` package is older.)

### 9.2 Get the code onto the server
```bash
cd /var/www
sudo git clone <your-repo-url> gancique-store
cd gancique-store/backend
npm install --omit=dev
cp .env.example .env
nano .env
```
In `.env`, set: `NODE_ENV=production`, `SERVE_FRONTEND=true` (keep the
default — Express serves the frontend too, so Nginx only needs one simple
proxy block), and `SESSION_SECRET` to a real random value. `FRONTEND_URL`
is unused in this mode but harmless to leave as-is.

### 9.3 Run the API (+ frontend) with PM2
```bash
pm2 start server.js --name gancique-store
pm2 save
pm2 startup   # follow the printed command to enable PM2 on reboot
```
Useful commands: `pm2 logs gancique-store`, `pm2 restart gancique-store`, `pm2 status`.

### 9.4 Reverse-proxy everything with Nginx

Because `SERVE_FRONTEND=true`, one Node process on port 4000 already serves
both the site and `/api`, so Nginx just needs to forward the whole domain
to it.

`/etc/nginx/sites-available/ganciquestore.com`:
```nginx
server {
    listen 80;
    server_name ganciquestore.com www.ganciquestore.com;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

> **Prefer split mode instead?** Set `SERVE_FRONTEND=false`, put the
> frontend files somewhere Nginx serves as static files directly (e.g.
> `root /var/www/gancique-store;` with a `location /api/ { proxy_pass
> http://127.0.0.1:4000/api/; }` block), and set `FRONTEND_URL` in `.env`
> to your real domain so CORS allows it.

Enable the site and reload:
```bash
sudo ln -s /etc/nginx/sites-available/ganciquestore.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 9.5 HTTPS with Let's Encrypt
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d ganciquestore.com -d www.ganciquestore.com
```
Certbot edits the Nginx config to redirect HTTP → HTTPS and auto-renews via
a systemd timer.

### 9.6 Redeploying after changes
```bash
cd /var/www/gancique-store
sudo git pull
cd backend && npm install --omit=dev
pm2 restart gancique-store
```

---

## Folder structure

```
gancique-store/
├── index.html, products.html, ...      ← existing frontend (unchanged UI)
├── css/                                 ← existing stylesheets (unchanged)
├── js/
│   ├── main.js, cart.js                 ← existing (small functional additions only)
│   └── api.js                           ← NEW: fetch wrapper for the API
├── login.html, register.html,           ← NEW: auth pages
│   account.html, admin.html
└── backend/
    ├── server.js                        ← entry point
    ├── package.json
    ├── .env.example
    ├── config/database.js               ← schema + seed + admin bootstrap
    ├── middleware/
    │   ├── auth.js                      ← requireAuth / requireAdmin
    │   ├── errorHandler.js
    │   └── rateLimiters.js
    ├── controllers/                     ← business logic per resource
    ├── routes/                          ← Express routers per resource
    ├── utils/
    │   ├── validators.js                ← input validation/sanitization
    │   └── asyncHandler.js
    └── db/gancique.sqlite                ← created automatically on first run
```
