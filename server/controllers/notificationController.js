const pool = require("../db");

// Get Notifications
const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

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
    console.log(err);
    res.status(500).json({
      message: "Server Error"
    });
  }
};

// Mark One Notification Read
const markRead = async (req, res) => {
  try {

    const { id } = req.params;

    await pool.query(
      `
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = $1
      `,
      [id]
    );

    res.json({
      message: "Notification Read"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server Error"
    });

  }
};

// Mark All Read
const markAllRead = async (req, res) => {
  try {

    const { userId } = req.params;

    await pool.query(
      `
      UPDATE notifications
      SET is_read = TRUE
      WHERE user_id = $1
      `,
      [userId]
    );

    res.json({
      message: "All Notifications Read"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server Error"
    });

  }
};

// Delete Notification
const deleteNotification = async (req, res) => {

  try {

    const { id } = req.params;

    await pool.query(
      `
      DELETE FROM notifications
      WHERE id = $1
      `,
      [id]
    );

    res.json({
      message: "Deleted Successfully"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server Error"
    });

  }

};

module.exports = {
  getNotifications,
  markRead,
  markAllRead,
  deleteNotification
};