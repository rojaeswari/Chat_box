
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

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
      "jpg", "jpeg", "png", "gif",
      "mp4", "webm", "mov", "avi",
      "mp3", "wav", "ogg", "m4a", "aac",
      "pdf", "doc", "docx", "xls", "xlsx", "txt",
    ],

    resource_type: "auto",

    type: "authenticated",
  },
});

const allowedMimeTypes = [
  // Images
  "image/jpeg",
  "image/png",
  "image/gif",

  // Videos
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",

  // Audio
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/mp4",
  "audio/aac",
  "audio/webm",

  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
];
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    req.uploadMimeType = file.mimetype;
    req.uploadOriginalName = file.originalname;
    cb(null, true);
  } else {
    cb(new Error("This file type is not allowed"));
  }
},
});

const audioUpload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("audio/")) {
      req.uploadMimeType = file.mimetype;
      req.uploadOriginalName = file.originalname;
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed"));
    }
  },
});

upload.audio = audioUpload;

module.exports = upload;