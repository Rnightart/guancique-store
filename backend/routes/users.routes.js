const express = require("express");
const { getProfile, updateProfile, getMyOrders } = require("../controllers/users.controller");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);
router.get("/me", getProfile);
router.put("/me", updateProfile);
router.get("/me/orders", getMyOrders);

module.exports = router;
