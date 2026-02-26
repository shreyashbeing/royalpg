import multer from "multer";
import path from "path";
import fs from "fs";

// Storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folderName = "uploads";

    if (file.fieldname === "aadhaarImage") {
      folderName = "uploads/aadhaar";
    } else if (file.fieldname === "qrImage") {
      folderName = "uploads/qr";
    }

    fs.mkdirSync(folderName, { recursive: true });
    cb(null, folderName);
  },

  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, "");
    cb(null, uniqueName);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg"];

  if (!allowed.includes(file.mimetype)) {
    cb(new Error("Only images allowed"), false);
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
});

export default upload;
