
const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Logout
router.post("/logout", authMiddleware, logout);

module.exports = router;
