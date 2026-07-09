const bcrypt = require("bcrypt");
const pool = require("../db");

const resetPassword = async (req, res) => {
  try {
    const userId = req.params.id;

    console.log("Reset Password User ID:", userId);

    const { newPassword } = req.body;

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log("New Password:", newPassword);
console.log("Hashed Password:", hashedPassword);

    await pool.query(
      "UPDATE users SET password=$1 WHERE id=$2",
      [hashedPassword, userId]
    );

    res.json({
      message: "Password reset successfully"
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server Error"
    });
  }
};

module.exports = { resetPassword };