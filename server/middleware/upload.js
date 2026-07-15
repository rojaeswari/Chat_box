// const multer = require("multer");
// const path = require("path");

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },

//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// const upload = multer({
//   storage,
//   fileFilter: (req, file, cb) => {

//     const allowed =
//       /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt/;

//     const ext = allowed.test(
//       path.extname(file.originalname).toLowerCase()
//     );

//     if (ext) {
//       cb(null, true);
//     } else {
//       cb(new Error("Only Images & Documents Allowed"));
//     }
//   },
// });

// module.exports = upload;

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const path = require("path");


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "chat_uploads",

    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "txt"
    ],

    resource_type: "auto",
  },
});


const upload = multer({
  storage: storage,
});


module.exports = upload;