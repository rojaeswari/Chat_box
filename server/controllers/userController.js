const bcrypt = require("bcrypt");
const pool = require("../db");

const resetPassword = async (req, res) => {
  try {
    const targetUserId = Number(req.params.id);
    const loggedInUserId = Number(req.user.id);
    const { newPassword } = req.body;

    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    // Only Admin or the same user can reset password
    if (
      loggedInUserId !== targetUserId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "You are not authorized to reset this password",
      });
    }

    if (
      typeof newPassword !== "string" ||
      newPassword.length < 8 ||
      newPassword.length > 72
    ) {
      return res.status(400).json({
        message: "Password must be between 8 and 72 characters",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await pool.query(
      "UPDATE users SET password=$1 WHERE id=$2 RETURNING id",
      [hashedPassword, targetUserId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "Password reset successfully",
    });

  } catch (err) {
    console.error("Password reset error:", err.message);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = { resetPassword };