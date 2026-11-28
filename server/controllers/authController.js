const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");
const { getIO } = require("../socket");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
     const role = "user";
     if (
  !name ||
  !email ||
  !password ||
  typeof name !== "string" ||
  typeof email !== "string" ||
  typeof password !== "string"
) {
  return res.status(400).json({
    message: "Name, email and password are required",
  });
}

if (password.length < 8 || password.length > 72) {
  return res.status(400).json({
    message: "Password must be between 8 and 72 characters",
  });
}
    const user = await pool.query(
      
      "SELECT * FROM users WHERE email=$1",
      [email]
    );
   

    if (user.rows.length > 0) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4)",
      [name, email, hashedPassword, role]
      
    );

    res.status(201).json({
      message: "User Registered Successfully",
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
};


// login pages

const login = async (req, res) => {
  const client = await pool.connect();

  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password ||
      password.length > 72
    ) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const user = await client.query(
      "SELECT * FROM users WHERE email = $1",
      [email.trim()]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password
    );

    if (!validPassword) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    await client.query("BEGIN");

    // Lock user row to prevent simultaneous logins
    await client.query(
      "SELECT id FROM users WHERE id = $1 FOR UPDATE",
      [user.rows[0].id]
    );

    const sessionId = randomUUID();

    // Create or replace active session
await client.query(
  `INSERT INTO user_sessions
   (user_id, session_id, expires_at, is_active)
   VALUES ($1, $2, NOW() + INTERVAL '1 day', TRUE)
   ON CONFLICT (user_id)
   DO UPDATE SET
     session_id = EXCLUDED.session_id,
     created_at = NOW(),
     expires_at = EXCLUDED.expires_at,
     is_active = TRUE`,
  [user.rows[0].id, sessionId]
);

    const token = jwt.sign(
      {
        id: user.rows[0].id,
        email: user.rows[0].email,
        role: user.rows[0].role,
        sessionId,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    await client.query("COMMIT");

    // Disconnect previous device sockets
try {
  const io = getIO();

  const sockets = await io
    .in(`user_${user.rows[0].id}`)
    .fetchSockets();

  for (const oldSocket of sockets) {
    if (oldSocket.user.sessionId !== sessionId) {
      oldSocket.disconnect(true);
    }
  }
} catch (socketError) {
  console.error("Old socket disconnect error:", socketError);
}

    return res.json({
      message: "Login Successful",
      token,
      user: {
        id: user.rows[0].id,
        name: user.rows[0].name,
        email: user.rows[0].email,
        role: user.rows[0].role,
      },
    });

  } catch (err) {
    await client.query("ROLLBACK");

    console.error("Login Error:", err);

    return res.status(500).json({
      message: "Server Error",
    });

  } finally {
    client.release();
  }
};


const logout = async (req, res) => {
  try {
    await pool.query(
      `UPDATE user_sessions
       SET is_active = FALSE
       WHERE user_id = $1
       AND session_id = $2`,
      [req.user.id, req.user.sessionId]
    );

    return res.json({ message: "Logout Successful" });
  } catch (err) {
    console.error("Logout Error:", err);
    return res.status(500).json({
      message: "Logout Failed",
    });
  }
};


module.exports = {
  register,
  login,
  logout,
};

