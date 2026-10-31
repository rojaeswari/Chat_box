const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
  sendGroupMessage,
  getGroupMessages,
  deleteGroupMessage,
  editGroupMessage,
   updateGroupSeenStatus,
   updateGroupMessageStatus,
   markGroupMessageSeen,
   getSeenUsers,
   getSeenCount,
   getGroupUnreadCounts
 
} = require("../controllers/groupMessageController");

router.post("/", sendGroupMessage);

router.post("/upload", upload.single("audio"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Audio file not received",
      });
    }

    res.json({
      message: "Audio uploaded successfully",
      audio: req.file.path,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Audio upload failed",
    });
  }
});
router.put("/edit/:id", editGroupMessage);

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