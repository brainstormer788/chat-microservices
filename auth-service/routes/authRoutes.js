const express = require("express");
const router = express.Router();
const { signup, login, getCurrentUser, logout } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const rateLimit = require("../middleware/rateLimit");

router.post("/signup", rateLimit, signup);
router.post("/register", rateLimit, signup);
router.post("/login", rateLimit, login);
router.post("/signin", rateLimit, login);
router.get("/me", authMiddleware, getCurrentUser);
router.post("/logout", authMiddleware, logout);

module.exports = router;
