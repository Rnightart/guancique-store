const express = require("express");
const { checkout, getOrder } = require("../controllers/orders.controller");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);
router.post("/checkout", checkout);
router.get("/:id", getOrder);

module.exports = router;
