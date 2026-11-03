const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const authMiddleware = require("../middleware/authMiddleware");

const {
  sendGroupMessage,
  getGroupMessages,
  getGroupPrivateFileUrl,
  deleteGroupMessage,
  editGroupMessage,
   updateGroupSeenStatus,
   updateGroupMessageStatus,
   markGroupMessageSeen,
   getSeenUsers,
   getSeenCount,
   getGroupUnreadCounts
 
} = require("../controllers/groupMessageController");

router.post("/", authMiddleware, sendGroupMessage);

router.post("/upload", authMiddleware, upload.audio.single("audio"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Audio file not received",
      });
    }

    res.json({
      message: "Audio uploaded successfully",
      audio: req.file.path,
      public_id: req.file.filename,
      resource_type: "video",
    });
  } catch (err) {
    console.error("Group audio upload error:", err.message);

    res.status(500).json({
      message: "Audio upload failed",
    });
  }
});


router.put("/edit/:id", authMiddleware, editGroupMessage);

router.get("/:groupId", authMiddleware, getGroupMessages);
router.get(
  "/private-file/:messageId/:field",
  authMiddleware,
  getGroupPrivateFileUrl
);
router.delete("/:id", authMiddleware, deleteGroupMessage);
// router.put("/status/:id", updateGroupDelivered);
router.put("/status/:id", authMiddleware, updateGroupMessageStatus);

router.put("/seen/:id", authMiddleware, updateGroupSeenStatus);
router.post(
  "/seen",
  authMiddleware,
  markGroupMessageSeen
);
router.get(
  "/seen/:messageId",
  authMiddleware,
  getSeenUsers
);
router.get("/seen-count/:messageId", authMiddleware, getSeenCount);
router.get("/unread/:userId", authMiddleware, getGroupUnreadCounts);

module.exports = router;