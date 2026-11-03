const express = require("express");

const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  getNotifications,
  markRead,
  markAllRead,
  deleteNotification
} = require("../controllers/notificationController");

router.get("/:userId", authMiddleware, getNotifications);

router.put("/read/:id", authMiddleware, markRead);

router.put("/read-all/:userId", authMiddleware, markAllRead);

router.delete("/:id", authMiddleware, deleteNotification);

module.exports = router;