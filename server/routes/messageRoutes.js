const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
  sendMessage,
  getMessages,
  deleteMessage,
  editMessage,
  updateMessageStatus,
  updateSeenStatus,
  getUnreadCounts

} = require("../controllers/messageController");

router.post("/", sendMessage);
router.put("/edit/:id", editMessage);
router.delete("/:id", deleteMessage);
router.put("/status/:id", updateMessageStatus);
router.put("/seen/:id", updateSeenStatus);
router.get("/unread/:userId", getUnreadCounts);
router.get("/:senderId/:receiverId", getMessages);


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
router.post("/upload", upload.single("image"), (req, res) => {
  try {
    console.log("Uploaded file:", req.file);

    res.json({
      message: "Image uploaded successfully",
      image: req.file.path,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Upload Failed",
    });
  }
});
router.post("/upload-audio", upload.single("audio"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Audio file not received",
      });
    }

    console.log("Uploaded audio:", req.file);

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



module.exports = router;