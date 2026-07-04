const express = require("express");
const router = express.Router();

const {
  sendGroupMessage,
  getGroupMessages,
} = require("../controllers/groupMessageController");

router.post("/", sendGroupMessage);

router.get("/:groupId", getGroupMessages);

module.exports = router;