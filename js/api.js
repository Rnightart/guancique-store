/* ==========================================================================
   Gancique Store — api.js
   Thin fetch wrapper for talking to the backend (backend/server.js).
   Include this script BEFORE main.js / cart.js on any page that needs it.
   ========================================================================== */

/* Default assumes the API is served from the SAME origin as this page
   (the "combined" setup: SERVE_FRONTEND=true in backend/.env, one server,
   one port — see backend/README.md, section "Combining frontend + backend").

   Running frontend and backend as two separate servers instead (e.g. Live
   Server on :5500 + API on :4000)? Set window.API_BASE BEFORE this script
   loads, e.g. in each page's <head>:
     <script>window.API_BASE = "http://localhost:4000/api";</script>
     <script src="js/api.js"></script> */
const API_BASE = window.API_BASE || "/api";

async function apiRequest(path, { method = "GET", body, headers = {} } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include", // send/receive the session cookie
    headers: { "Content-Type": "application/json", ...headers },
    body: body ? JSON.stringify(body) : undefined
  });

  let data = null;
  try { data = await res.json(); } catch { /* no JSON body, e.g. 204 */ }

  if (!res.ok) {
    const error = new Error((data && data.error) || `Request failed (${res.status})`);
    error.status = res.status;
    error.fields = data && data.fields;
    throw error;
  }
  return data;
}

const Api = {
  auth: {
    register: (name, email, password) => apiRequest("/auth/register", { method: "POST", body: { name, email, password } }),
    login: (email, password) => apiRequest("/auth/login", { method: "POST", body: { email, password } }),
    logout: () => apiRequest("/auth/logout", { method: "POST" }),
    me: () => apiRequest("/auth/me")
  },
  users: {
    profile: () => apiRequest("/users/me"),
    updateProfile: (name) => apiRequest("/users/me", { method: "PUT", body: { name } }),
    orders: () => apiRequest("/users/me/orders")
  },
  products: {
    list: (params = {}) => apiRequest(`/products?${new URLSearchParams(params)}`),
    get: (id) => apiRequest(`/products/${id}`),
    create: (payload) => apiRequest("/products", { method: "POST", body: payload }),
    update: (id, payload) => apiRequest(`/products/${id}`, { method: "PUT", body: payload }),
    remove: (id) => apiRequest(`/products/${id}`, { method: "DELETE" })
  },
  categories: {
    list: () => apiRequest("/categories"),
    create: (name) => apiRequest("/categories", { method: "POST", body: { name } }),
    update: (id, name) => apiRequest(`/categories/${id}`, { method: "PUT", body: { name } }),
    remove: (id) => apiRequest(`/categories/${id}`, { method: "DELETE" })
  },
  cart: {
    get: () => apiRequest("/cart"),
    add: (productId, quantity = 1) => apiRequest("/cart/items", { method: "POST", body: { productId, quantity } }),
    merge: (items) => apiRequest("/cart/merge", { method: "POST", body: { items } }),
    updateQty: (cartItemId, quantity) => apiRequest(`/cart/items/${cartItemId}`, { method: "PUT", body: { quantity } }),
    remove: (cartItemId) => apiRequest(`/cart/items/${cartItemId}`, { method: "DELETE" }),
    clear: () => apiRequest("/cart", { method: "DELETE" })
  },
  orders: {
    checkout: () => apiRequest("/orders/checkout", { method: "POST" }),
    get: (id) => apiRequest(`/orders/${id}`)
  }
};

window.Api = Api;
