const express = require("express");
const router = express.Router();

const {
  sendGroupMessage,
  getGroupMessages,
  deleteGroupMessage,
   updateGroupSeenStatus,
   updateGroupMessageStatus,
   markGroupMessageSeen,
   getSeenUsers,
   getSeenCount,
   getGroupUnreadCounts
 
} = require("../controllers/groupMessageController");

router.post("/", sendGroupMessage);

router.get("/:groupId", getGroupMessages);
router.delete("/:id", deleteGroupMessage);
// router.put("/status/:id", updateGroupDelivered);
router.put("/status/:id", updateGroupMessageStatus);

router.put("/seen/:id", updateGroupSeenStatus);
router.post(
  "/seen",
  markGroupMessageSeen
);
router.get(
  "/seen/:messageId",
  getSeenUsers
);
router.get("/seen-count/:messageId", getSeenCount);
router.get("/unread/:userId", getGroupUnreadCounts);

module.exports = router;