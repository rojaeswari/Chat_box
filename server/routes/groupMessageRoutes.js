const express = require("express");
const router = express.Router();

const {
  sendGroupMessage,
  getGroupMessages,
  deleteGroupMessage,
   updateGroupSeenStatus,
   updateGroupMessageStatus,
 
} = require("../controllers/groupMessageController");

router.post("/", sendGroupMessage);

router.get("/:groupId", getGroupMessages);
router.delete("/:id", deleteGroupMessage);
// router.put("/status/:id", updateGroupDelivered);
router.put("/status/:id", updateGroupMessageStatus);

router.put("/seen/:id", updateGroupSeenStatus);

module.exports = router;