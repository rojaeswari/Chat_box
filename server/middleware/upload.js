const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {

    const allowed =
      /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt/;

    const ext = allowed.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (ext) {
      cb(null, true);
    } else {
      cb(new Error("Only Images & Documents Allowed"));
    }
  },
});

module.exports = upload;