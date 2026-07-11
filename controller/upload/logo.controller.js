const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { handleSuccess, handleError } = require("../../utils/responseHandler");

const uploadDir = path.join(__dirname, "../../uploads/logos");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const type = req.params.type;
    cb(null, `${type}.png`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("อนุญาตเฉพาะไฟล์ PNG เท่านั้น"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

exports.uploadLogo = [
  (req, res, next) => {
    const { type } = req.params;
    if (!["login", "sidebar"].includes(type)) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "type ต้องเป็น login หรือ sidebar เท่านั้น",
      });
    }
    next();
  },
  upload.single("logo"),
  async (req, res) => {
    try {
      if (!req.file) {
        const response = await handleError(null, "กรุณาอัพโหลดไฟล์ PNG", 400);
        return res.status(response.status).json(response);
      }

      const fileUrl = `/uploads/logos/${req.params.type}.png`;
      const response = await handleSuccess(
        { url: fileUrl },
        `อัพโหลด ${req.params.type} logo สำเร็จ`
      );
      return res.status(response.status).json(response);
    } catch (error) {
      const response = await handleError(error, "เกิดข้อผิดพลาดในการอัพโหลด");
      return res.status(response.status).json(response);
    }
  },
];

exports.getLogo = async (req, res) => {
  try {
    const { type } = req.params;
    if (!["login", "sidebar"].includes(type)) {
      const response = await handleError(null, "type ต้องเป็น login หรือ sidebar เท่านั้น", 400);
      return res.status(response.status).json(response);
    }

    const filePath = path.join(uploadDir, `${type}.png`);
    if (!fs.existsSync(filePath)) {
      const response = await handleError(null, "ไม่พบ logo", 404);
      return res.status(response.status).json(response);
    }

    const fileUrl = `/uploads/logos/${type}.png`;
    const response = await handleSuccess({ url: fileUrl }, `ดึง ${type} logo สำเร็จ`);
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, "เกิดข้อผิดพลาด");
    return res.status(response.status).json(response);
  }
};
