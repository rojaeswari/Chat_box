const express = require("express");
const router = express.Router();
const pool = require("../db");

// Get all users except logged-in user
router.get("/", async (req, res) => {
  try {
    const { email } = req.query;

    const result = await pool.query(
      "SELECT id, name, email FROM users WHERE email != $1",
      [email]
    );

    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
});

module.exports = router;