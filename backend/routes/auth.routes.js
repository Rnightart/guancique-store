const express = require("express");
const { register, login, logout, me } = require("../controllers/auth.controller");
const { authLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.get("/me", me);

module.exports = router;
