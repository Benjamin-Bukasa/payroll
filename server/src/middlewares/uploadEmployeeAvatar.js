import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(
  __dirname,
  "..",
  "..",
  "uploads",
  "employee-avatars"
);

fs.mkdirSync(uploadDir, { recursive: true });

export const MAX_EMPLOYEE_AVATAR_SIZE =
  5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
  ];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Only image files are allowed"));
  }
  cb(null, true);
};

export const uploadEmployeeAvatar = multer({
  storage,
  limits: { fileSize: MAX_EMPLOYEE_AVATAR_SIZE },
  fileFilter,
});
