const multer = require("multer");
const path = require("path");
const fs = require("fs");

// สร้างโฟลเดอร์ถ้ายังไม่มี
const createUploadFolders = () => {
  const folders = ["uploads/credit-slips", "uploads/withdrawal-slips"];
  folders.forEach(folder => {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
      console.log(`✅ Created folder: ${folder}`);
    }
  });
};

createUploadFolders();

// กำหนดที่เก็บไฟล์และชื่อไฟล์
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // เลือกโฟลเดอร์ตาม fieldname
    if (file.fieldname === "slip_image") {
      cb(null, "uploads/credit-slips/");
    } else if (file.fieldname === "transfer_slip_image") {
      cb(null, "uploads/withdrawal-slips/");
    } else {
      cb(null, "uploads/");
    }
  },
  filename: function (req, file, cb) {
    // สร้างชื่อไฟล์ที่ไม่ซ้ำกัน
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const filename = file.fieldname + "-" + uniqueSuffix + ext;
    cb(null, filename);
  },
});

// กรองเฉพาะไฟล์รูปภาพ
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("กรุณาอัพโหลดไฟล์รูปภาพเท่านั้น (jpg, jpeg, png, gif, webp)"),
      false,
    );
  }
};

// สร้าง multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // จำกัด 5MB
    files: 1, // จำกัด 1 ไฟล์ต่อ request
    fieldSize: 10 * 1024 * 1024, // เพิ่ม field size limit
  },
});

// Middleware สำหรับจัดการ multer errors
const handleMulterError = (err, req, res, next) => {
  // Log error สำหรับ debug
  console.error("Multer/Busboy Error:", {
    message: err.message,
    code: err.code,
    type: err.constructor.name,
  });

  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)",
        error: err.message,
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "สามารถอัพโหลดได้ครั้งละ 1 ไฟล์เท่านั้น",
        error: err.message,
      });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message:
          "ชื่อ field ไม่ถูกต้อง (ใช้ slip_image หรือ transfer_slip_image)",
        error: err.message,
      });
    }
    return res.status(400).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัพโหลดไฟล์",
      error: err.message,
      code: err.code,
    });
  } else if (err) {
    // Other errors (e.g., from fileFilter, busboy errors)
    const errorMessage = err.message || "เกิดข้อผิดพลาดในการอัพโหลดไฟล์";

    // Handle busboy/multipart errors
    if (
      errorMessage.includes("Unexpected end of form") ||
      errorMessage.includes("Unexpected end of multipart data") ||
      errorMessage.includes("Unexpected end of")
    ) {
      return res.status(400).json({
        success: false,
        message:
          "การส่งไฟล์ไม่สมบูรณ์ - ลองแก้ไข:\n" +
          "1. ใน Postman: ลบ Content-Type header ออก\n" +
          "2. สร้าง Request ใหม่\n" +
          "3. ตรวจสอบว่าเลือกไฟล์จริงๆ\n" +
          "4. ลองใช้ไฟล์อื่น",
        debug: {
          error: errorMessage,
          tip: "ปัญหานี้มักเกิดจาก Postman - ลองสร้าง Request ใหม่",
        },
      });
    }

    return res.status(400).json({
      success: false,
      message: errorMessage,
      debug: {
        error: errorMessage,
      },
    });
  }
  next();
};

// Middleware สำหรับ optional file upload (ไม่บังคับแนบไฟล์)
const optionalFileUpload = fieldName => {
  return (req, res, next) => {
    // ตรวจสอบ Content-Type ก่อน
    const contentType = req.headers["content-type"] || "";

    // ถ้าไม่ใช่ multipart/form-data ให้ผ่านไปเลย (ไม่มีไฟล์)
    if (!contentType.includes("multipart/form-data")) {
      return next();
    }

    upload.single(fieldName)(req, res, err => {
      if (err) {
        console.error("Upload error:", err.message);
        return handleMulterError(err, req, res, next);
      }
      // ถ้าไม่มี error ให้ผ่านไปต่อ (ไม่ว่าจะมีไฟล์หรือไม่)
      if (req.file) {
        console.log("File uploaded successfully:", req.file.filename);
      } else {
        console.log("No file uploaded (optional)");
      }
      next();
    });
  };
};

// Middleware สำหรับ required file upload (บังคับแนบไฟล์)
const requiredFileUpload = fieldName => {
  return (req, res, next) => {
    // ตรวจสอบ Content-Type ก่อน
    const contentType = req.headers["content-type"] || "";
    if (!contentType.includes("multipart/form-data")) {
      return res.status(400).json({
        success: false,
        message: "กรุณาใช้ form-data และแนบไฟล์",
      });
    }

    upload.single(fieldName)(req, res, err => {
      // Log error สำหรับ debug
      if (err) {
        console.error("Upload error:", err.message);
        return handleMulterError(err, req, res, next);
      }

      // ตรวจสอบว่ามีไฟล์หรือไม่
      if (!req.file) {
        console.log("No file received. Body:", Object.keys(req.body));
        return res.status(400).json({
          success: false,
          message: `กรุณาแนบไฟล์ ${fieldName} (ตรวจสอบว่าเลือกไฟล์แล้วและ field name ถูกต้อง)`,
        });
      }

      console.log("File uploaded successfully:", req.file.filename);
      next();
    });
  };
};

// ฟังก์ชันลบไฟล์
const deleteFile = filePath => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️  Deleted file: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error deleting file: ${filePath}`, error);
    return false;
  }
};

module.exports = {
  upload,
  deleteFile,
  handleMulterError,
  optionalFileUpload,
  requiredFileUpload,
};
