const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const authMiddleware = require("../middleware/authMiddleware");

const {
  sendMessage,
  getMessages,
  deleteMessage,
  editMessage,
  updateMessageStatus,
  updateSeenStatus,
  getUnreadCounts,
   getPrivateFileUrl

} = require("../controllers/messageController");

router.post("/", authMiddleware, sendMessage);
router.put("/edit/:id", authMiddleware, editMessage);
router.delete("/:id", authMiddleware, deleteMessage);
router.put("/status/:id", authMiddleware, updateMessageStatus);
router.put("/seen/:id", authMiddleware, updateSeenStatus);
router.get("/unread/:userId", authMiddleware, getUnreadCounts);
router.get("/private-file/:messageId/:field", authMiddleware, getPrivateFileUrl);
router.get("/:senderId/:receiverId", authMiddleware, getMessages);


// router.post("/upload", upload.single("image"), (req, res) => {
//   try {
//     res.json({
//       message: "Image uploaded successfully",
//       image: req.file.filename,
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({
//       message: "Upload Failed",
//     });
//   }
// });
router.post("/upload", authMiddleware, upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "File not received",
      });
    }

    const mimeType = req.uploadMimeType;

    let resourceType = "raw";

    if (mimeType.startsWith("image/")) {
      resourceType = "image";
    } else if (
      mimeType.startsWith("video/") ||
      mimeType.startsWith("audio/")
    ) {
      resourceType = "video";
    }

    res.json({
      message: "File uploaded successfully",
      image: req.file.path,
      public_id: req.file.filename,
      resource_type: resourceType,
    });
  } catch (err) {
    console.error("Upload error:", err);

    res.status(500).json({
      message: "Upload Failed",
    });
  }
});

router.post("/upload-audio", authMiddleware, upload.audio.single("audio"), (req, res) => {
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
    console.error("Audio upload error:", err);

    res.status(500).json({
      message: "Audio upload failed",
    });
  }
});


module.exports = router;