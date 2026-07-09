const express = require("express");
const router = express.Router();
const pool = require("../db");
const { resetPassword } = require("../controllers/userController");
router.put("/reset-password/:id", resetPassword);

router.get("/", async (req, res) => {
  try {
    const { email } = req.query;

    let result;

    if (email) {
      result = await pool.query(
        "SELECT id, name, email, role FROM users WHERE email != $1 ORDER BY id",
        [email]
      );
    } else {
      result = await pool.query(
        "SELECT id, name, email, role FROM users ORDER BY id"
      );
    }

    res.json(result.rows);

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
});

// Get all users except logged-in user
router.get("/all", async (req, res) => {
  try {

    const result = await pool.query(
      "SELECT id,name,email,role FROM users ORDER BY id"
    );

    res.json(result.rows);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });

  }
});


router.get("/:id", async (req, res) => {
  try {

    const result = await pool.query(
      "SELECT id,name,email,role FROM users WHERE id=$1",
      [req.params.id]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

router.put("/:id", async (req, res) => {

  try {

    const {
      name,
      email,
      role,
    } = req.body;

    await pool.query(
      `UPDATE users
       SET name=$1,
           email=$2,
           role=$3
       WHERE id=$4`,
      [
        name,
        email,
        role,
        req.params.id,
      ]
    );

    res.json({
      message: "User Updated Successfully",
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });

  }

});




router.delete("/:id", async (req, res) => {
  try {

    const id = req.params.id;

    // Group Members-ல இருந்தா remove
    await pool.query(
      "DELETE FROM group_members WHERE user_id=$1",
      [id]
    );

    // Private Messages-ல இருந்தா remove
    await pool.query(
      `DELETE FROM messages
       WHERE sender_id=$1
       OR receiver_id=$1`,
      [id]
    );

    // Group Messages-ல இருந்தா remove
    await pool.query(
      "DELETE FROM group_messages WHERE sender_id=$1",
      [id]
    );

    // User delete
    await pool.query(
      "DELETE FROM users WHERE id=$1",
      [id]
    );

    res.json({
      message: "User Deleted Successfully"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server Error"
    });

  }
});
module.exports = router;