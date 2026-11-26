require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("connect", () => {
  console.log("NEW DATABASE CONNECTION");
});

pool.on("error", (err) => {
  console.log("DATABASE POOL ERROR:", err.message);
});

module.exports = pool;