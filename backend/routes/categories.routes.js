const express = require("express");
const {
  listCategories, getCategory, createCategory, updateCategory, deleteCategory
} = require("../controllers/categories.controller");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", listCategories);
router.get("/:id", getCategory);
router.post("/", requireAdmin, createCategory);
router.put("/:id", requireAdmin, updateCategory);
router.delete("/:id", requireAdmin, deleteCategory);

module.exports = router;
