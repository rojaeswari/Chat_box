const express = require("express");

const router = express.Router();

const {
  getNotifications,
  markRead,
  markAllRead,
  deleteNotification
} = require("../controllers/notificationController");

router.get("/:userId", getNotifications);

router.put("/read/:id", markRead);

router.put("/read-all/:userId", markAllRead);

router.delete("/:id", deleteNotification);

module.exports = router;