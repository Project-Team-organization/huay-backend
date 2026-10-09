const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const uploadDir = path.join(__dirname, "../uploads/promotions");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) return cb(null, true);
    const err = new Error("อนุญาตเฉพาะไฟล์ JPG, PNG, WEBP, GIF เท่านั้น");
    err.code = "INVALID_FILE_TYPE";
    cb(err, false);
  },
});

// คืนนามสกุล (jpg/png/gif/webp) จาก magic bytes หรือ null ถ้าไม่ใช่รูปที่รองรับ
function detectImageExt(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  )
    return "png";
  const head6 = buf.toString("latin1", 0, 6);
  if (head6 === "GIF87a" || head6 === "GIF89a") return "gif";
  if (
    buf.toString("latin1", 0, 4) === "RIFF" &&
    buf.toString("latin1", 8, 12) === "WEBP"
  )
    return "webp";
  return null;
}

function generateSafeName(ext) {
  return crypto.randomBytes(16).toString("hex") + "." + ext;
}

// คืน path เต็มที่อยู่ใน baseDir เท่านั้น ไม่งั้น null
function resolveSafePath(fileName, baseDir = uploadDir) {
  if (typeof fileName !== "string" || !fileName) return null;
  const base = path.basename(fileName);
  if (!base || base === "." || base === "..") return null;
  const root = path.resolve(baseDir);
  const full = path.resolve(root, base);
  if (path.dirname(full) !== root) return null;
  return full;
}

async function safeDelete(fileName, baseDir = uploadDir) {
  const full = resolveSafePath(fileName, baseDir);
  if (!full) return false;
  try {
    await fs.promises.unlink(full);
    return true;
  } catch (err) {
    if (err.code === "ENOENT") return false;
    throw err;
  }
}

// ตรวจ magic bytes แล้วเขียนไฟล์ด้วยชื่อสุ่ม คืน { fileName, imageUrl }
async function saveImageBuffer(buf, baseDir = uploadDir) {
  const ext = detectImageExt(buf);
  if (!ext) {
    const err = new Error("ไฟล์ไม่ใช่รูปภาพที่รองรับ");
    err.code = "INVALID_FILE_TYPE";
    throw err;
  }
  await fs.promises.mkdir(baseDir, { recursive: true });
  const fileName = generateSafeName(ext);
  await fs.promises.writeFile(path.join(baseDir, fileName), buf);
  return { fileName, imageUrl: `/uploads/promotions/${fileName}` };
}

// ว่าง, http(s) URL, หรือ relative ที่ขึ้นต้น "/" (ไม่ใช่ "//")
function isSafeLink(link) {
  if (link === undefined || link === null || link === "") return true;
  if (typeof link !== "string" || link.length > 2048) return false;
  if (link.startsWith("//")) return false;
  if (link.startsWith("/")) return !link.startsWith("/\\");
  try {
    const u = new URL(link);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch (e) {
    return false;
  }
}

// ห่อ upload.single("image") เพื่อ map error เป็นข้อความไทย
function uploadImage(req, res, next) {
  upload.single("image")(req, res, (err) => {
    if (!err) return next();
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        status: 413,
        message: "ไฟล์ใหญ่เกิน 5MB",
      });
    }
    if (err instanceof multer.MulterError || err.code === "INVALID_FILE_TYPE") {
      return res.status(400).json({
        success: false,
        status: 400,
        message:
          err.code === "INVALID_FILE_TYPE"
            ? err.message
            : "อัพโหลดไฟล์ไม่ถูกต้อง",
      });
    }
    return next(err);
  });
}

module.exports = {
  MAX_FILE_SIZE,
  ALLOWED_MIMES,
  uploadDir,
  uploadImage,
  detectImageExt,
  generateSafeName,
  resolveSafePath,
  safeDelete,
  saveImageBuffer,
  isSafeLink,
};
