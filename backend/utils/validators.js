/**
 * utils/validators.js
 * Small, dependency-free input validation + sanitization helpers.
 * Every field coming from the client is checked here before it ever
 * reaches a SQL statement (which itself always uses parameter binding,
 * never string concatenation, as a second line of defense).
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isNonEmptyString(v, max = 255) {
  return typeof v === "string" && v.trim().length > 0 && v.trim().length <= max;
}

/** Strips angle brackets so plain-text fields can't smuggle in HTML/script tags. */
function sanitizeText(v) {
  return typeof v === "string" ? v.trim().replace(/[<>]/g, "") : v;
}

function validateRegistration(body) {
  const errors = {};
  const name = sanitizeText(body.name);
  const email = sanitizeText(body.email || "").toLowerCase();
  const password = body.password;

  if (!isNonEmptyString(name, 100)) errors.name = "Name is required (max 100 characters).";
  if (!isNonEmptyString(email, 180) || !EMAIL_RE.test(email)) errors.email = "A valid email is required.";
  if (typeof password !== "string" || password.length < 8) errors.password = "Password must be at least 8 characters.";

  return { valid: Object.keys(errors).length === 0, errors, data: { name, email, password } };
}

function validateLogin(body) {
  const errors = {};
  const email = sanitizeText(body.email || "").toLowerCase();
  const password = body.password;

  if (!isNonEmptyString(email, 180) || !EMAIL_RE.test(email)) errors.email = "A valid email is required.";
  if (typeof password !== "string" || password.length === 0) errors.password = "Password is required.";

  return { valid: Object.keys(errors).length === 0, errors, data: { email, password } };
}

function validateProduct(body) {
  const errors = {};
  const name = sanitizeText(body.name);
  const price = Number(body.price);
  const categoryId = body.categoryId != null ? Number(body.categoryId) : null;
  const description = sanitizeText(body.description || "");
  const image = sanitizeText(body.image || "");
  const badge = body.badge || null;
  const colors = Array.isArray(body.colors) ? body.colors.filter(c => typeof c === "string").slice(0, 8) : [];

  if (!isNonEmptyString(name, 150)) errors.name = "Product name is required.";
  if (!Number.isFinite(price) || price < 0) errors.price = "Price must be a positive number.";
  if (badge && !["best", "new", "sale"].includes(badge)) errors.badge = "Badge must be best, new, sale, or omitted.";
  if (categoryId !== null && !Number.isInteger(categoryId)) errors.categoryId = "categoryId must be an integer.";

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: { name, price, categoryId, description, image, badge, colors }
  };
}

function validateCategory(body) {
  const errors = {};
  const name = sanitizeText(body.name);
  if (!isNonEmptyString(name, 80)) errors.name = "Category name is required.";
  return { valid: Object.keys(errors).length === 0, errors, data: { name } };
}

function validateCartItem(body) {
  const errors = {};
  const productId = Number(body.productId);
  const quantity = body.quantity != null ? Number(body.quantity) : 1;

  if (!Number.isInteger(productId) || productId <= 0) errors.productId = "A valid productId is required.";
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) errors.quantity = "Quantity must be between 1 and 20.";

  return { valid: Object.keys(errors).length === 0, errors, data: { productId, quantity } };
}

module.exports = {
  isNonEmptyString,
  sanitizeText,
  validateRegistration,
  validateLogin,
  validateProduct,
  validateCategory,
  validateCartItem
};
