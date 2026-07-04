const pool = require("../db");

// Send Message
const sendMessage = async (req, res) => {
  try {
    const { sender_id, receiver_id, message } = req.body;

    await pool.query(
      `INSERT INTO messages(sender_id, receiver_id, message)
       VALUES($1, $2, $3)`,
      [sender_id, receiver_id, message]
    );

    res.json({
      message: "Message Sent Successfully",
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

// Get Messages
const getMessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM messages
      WHERE
      (sender_id=$1 AND receiver_id=$2)
      OR
      (sender_id=$2 AND receiver_id=$1)
      ORDER BY created_at ASC
      `,
      [senderId, receiverId]
    );

    res.json(result.rows);

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  sendMessage,
  getMessages,
};