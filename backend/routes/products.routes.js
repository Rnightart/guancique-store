const express = require("express");
const {
  listProducts, getProduct, createProduct, updateProduct, deleteProduct
} = require("../controllers/products.controller");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", listProducts);
router.get("/:id", getProduct);
router.post("/", requireAdmin, createProduct);
router.put("/:id", requireAdmin, updateProduct);
router.delete("/:id", requireAdmin, deleteProduct);

module.exports = router;
