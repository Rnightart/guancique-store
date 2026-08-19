const express = require("express");
const {
  getCart, addToCart, updateCartItem, removeCartItem, clearCart, mergeCart
} = require("../controllers/cart.controller");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);
router.get("/", getCart);
router.post("/items", addToCart);
router.post("/merge", mergeCart);
router.put("/items/:itemId", updateCartItem);
router.delete("/items/:itemId", removeCartItem);
router.delete("/", clearCart);

module.exports = router;
