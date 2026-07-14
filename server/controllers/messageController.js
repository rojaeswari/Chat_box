const pool = require("../db");
const { getIO } = require("../socket");

// Send Message
const sendMessage = async (req, res) => {
  try {
    const { sender_id, receiver_id, message, image, document,status } = req.body;

    const result = await pool.query(
      `INSERT INTO messages
      (sender_id, receiver_id, message, image, document, status)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *`,
      [sender_id, receiver_id, message, image, document, "sent"]
    );

    const savedMessage = result.rows[0];

   const io = getIO();

// Receiver
io.to(`user_${receiver_id}`).emit(
  "receive_message",
  savedMessage
);

// Sender
io.to(`user_${sender_id}`).emit(
  "receive_message",
  savedMessage
);

return res.status(201).json(savedMessage);  

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: err.message,
    });
  }
};
// Get Messages
const getMessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    const result = await pool.query(
      // `
      // SELECT *
      // FROM messages
      // WHERE
      // (sender_id=$1 AND receiver_id=$2)
      // OR
      // (sender_id=$2 AND receiver_id=$1)
      // ORDER BY created_at ASC
      // `,
      `
      SELECT
messages.*,
users.name
FROM messages
JOIN users
ON users.id = messages.sender_id
WHERE
(sender_id=$1 AND receiver_id=$2)
OR
(sender_id=$2 AND receiver_id=$1)
ORDER BY created_at ASC;
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


const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    const result = await pool.query(
      "DELETE FROM messages WHERE id=$1 AND sender_id=$2 RETURNING *",
      [id, user_id]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({
        message: "You can delete only your own messages",
      });
    }

    res.json({
      message: "Message Deleted",
    });

  } catch (err) {
    console.log(err);
  }
};

const updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.query(
      "UPDATE messages SET status=$1 WHERE id=$2",
      [status, id]
    );

    res.json({
      message: "Status Updated"
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server Error"
    });
  }
};

const updateSeenStatus = async (req, res) => {
  try {

    const { id } = req.params;

    await pool.query(
      "UPDATE messages SET status='seen' WHERE id=$1",
      [id]
    );

    res.json({
      message: "Seen Updated"
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server Error"
    });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  deleteMessage,
   updateMessageStatus,
  updateSeenStatus
};