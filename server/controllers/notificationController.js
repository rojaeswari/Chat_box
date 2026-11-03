const pool = require("../db");

// Get Logged-in User Notifications
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        notifications.*,
        users.name AS sender_name
      FROM notifications
      JOIN users
        ON notifications.sender_id = users.id
      WHERE notifications.user_id = $1
      ORDER BY notifications.created_at DESC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Get Notifications Error:", err.message);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// Mark One Notification Read
const markRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = $1
      AND user_id = $2
      RETURNING id
      `,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    res.json({
      message: "Notification Read",
    });
  } catch (err) {
    console.error("Mark Read Error:", err.message);

    res.status(500).json({
      message: "Server Error",
    });
  }
};


// Mark All Notifications Read
const markAllRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.query(
      `
      UPDATE notifications
      SET is_read = TRUE
      WHERE user_id = $1
      `,
      [userId]
    );

    res.json({
      message: "All Notifications Read",
    });
  } catch (err) {
    console.error("Mark All Read Error:", err.message);

    res.status(500).json({
      message: "Server Error",
    });
  }
};


// Delete Notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `
      DELETE FROM notifications
      WHERE id = $1
      AND user_id = $2
      RETURNING id
      `,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    res.json({
      message: "Deleted Successfully",
    });
  } catch (err) {
    console.error("Delete Notification Error:", err.message);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  getNotifications,
  markRead,
  markAllRead,
  deleteNotification
};