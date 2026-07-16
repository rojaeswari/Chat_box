const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
  sendMessage,
  getMessages,
  deleteMessage,
  updateMessageStatus,
  updateSeenStatus

} = require("../controllers/messageController");

router.post("/", sendMessage);
router.delete("/:id", deleteMessage);
router.put("/status/:id", updateMessageStatus);
router.put("/seen/:id", updateSeenStatus);
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
    console.log(req.file);

    res.json({
      message: "Image uploaded successfully",
      image: req.file.path,
      file: req.file,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Upload Failed",
    });
  }
});

module.exports = router;