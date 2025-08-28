import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// Directory setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // path for uploads directory
    cb(null, path.join(__dirname, "/../uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

// File filter for PDF and JPG only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|pdf/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (
    allowedTypes.test(ext) &&
    (mime === "application/pdf" || mime === "image/jpeg")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and JPG files are allowed"));
  }
};

export const upload = multer({ storage: storage, fileFilter: fileFilter });
