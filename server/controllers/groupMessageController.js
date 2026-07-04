const pool = require("../db");

// Send Group Message
const sendGroupMessage = async (req, res) => {
  try {
    const { group_id, sender_id, message } = req.body;

    const result = await pool.query(
      `INSERT INTO group_messages(group_id, sender_id, message)
       VALUES($1,$2,$3)
       RETURNING *`,
      [group_id, sender_id, message]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

// Get Group Messages
const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;

    const result = await pool.query(
      `
      SELECT
      group_messages.id,
      group_messages.message,
      group_messages.created_at,
      users.id AS sender_id,
      users.name
      FROM group_messages
      JOIN users
      ON group_messages.sender_id = users.id
      WHERE group_messages.group_id = $1
      ORDER BY group_messages.created_at ASC
      `,
      [groupId]
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
  sendGroupMessage,
  getGroupMessages,
};