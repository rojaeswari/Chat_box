
const jwt = require("jsonwebtoken");
const pool = require("../db");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (!decoded.sessionId) {
      return res.status(401).json({
        message: "Session expired. Please login again.",
      });
    }

    const session = await pool.query(
      `SELECT id
       FROM user_sessions
       WHERE user_id = $1
       AND session_id = $2
       AND is_active = TRUE
       AND expires_at > NOW()`,
      [decoded.id, decoded.sessionId]
    );

    if (session.rows.length === 0) {
      return res.status(401).json({
        message: "You are logged in on another device. Please login again.",
        code: "SESSION_REVOKED",
      });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      sessionId: decoded.sessionId,
    };

    next();

  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;
