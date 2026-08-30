const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Banner = require("../../models/banner.model");
const { handleSuccess, handleError } = require("../../utils/responseHandler");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../../uploads/banners");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".png";
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `banner-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WEBP, GIF) เท่านั้น"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

exports.uploadMiddleware = upload.single("image");

// Admin: Get all banners
exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ display_order: 1, created_at: -1 });
    const response = await handleSuccess(banners, "ดึงรายการแบนเนอร์สำเร็จ");
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, "เกิดข้อผิดพลาดในการดึงรายการแบนเนอร์");
    return res.status(response.status).json(response);
  }
};

// Public: Get active banners sorted by display_order
exports.getPublicBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ is_active: true }).sort({ display_order: 1, created_at: -1 });
    const response = await handleSuccess(banners, "ดึงแบนเนอร์โปรโมชั่นสำเร็จ");
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, "เกิดข้อผิดพลาดในการดึงแบนเนอร์โปรโมชั่น");
    return res.status(response.status).json(response);
  }
};

// Admin: Create banner
exports.createBanner = async (req, res) => {
  try {
    const { title, link_url, display_order, is_active } = req.body;

    if (!title) {
      const response = await handleError(null, "กรุณากรอกชื่อป้ายแบนเนอร์", 400);
      return res.status(response.status).json(response);
    }

    if (!req.file) {
      const response = await handleError(null, "กรุณาอัปโหลดรูปภาพแบนเนอร์", 400);
      return res.status(response.status).json(response);
    }

    const imageUrl = `/uploads/banners/${req.file.filename}`;

    const newBanner = await Banner.create({
      title,
      image_url: imageUrl,
      link_url: link_url || "",
      display_order: display_order !== undefined ? Number(display_order) : 0,
      is_active: is_active === "true" || is_active === true,
    });

    const response = await handleSuccess(newBanner, "สร้างป้ายแบนเนอร์สำเร็จ", 201);
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, "เกิดข้อผิดพลาดในการสร้างป้ายแบนเนอร์");
    return res.status(response.status).json(response);
  }
};

// Admin: Update banner
exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, link_url, display_order, is_active } = req.body;

    const banner = await Banner.findById(id);
    if (!banner) {
      const response = await handleError(null, "ไม่พบป้ายแบนเนอร์", 404);
      return res.status(response.status).json(response);
    }

    if (title) banner.title = title;
    if (link_url !== undefined) banner.link_url = link_url;
    if (display_order !== undefined) banner.display_order = Number(display_order);
    if (is_active !== undefined) banner.is_active = is_active === "true" || is_active === true;

    // If new image file uploaded
    if (req.file) {
      // Remove old file if exists
      if (banner.image_url) {
        const oldPath = path.join(__dirname, "../../", banner.image_url);
        if (fs.existsSync(oldPath)) {
          try { fs.unlinkSync(oldPath); } catch (e) { console.error("Error deleting old banner:", e); }
        }
      }
      banner.image_url = `/uploads/banners/${req.file.filename}`;
    }

    await banner.save();

    const response = await handleSuccess(banner, "อัปเดตป้ายแบนเนอร์สำเร็จ");
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, "เกิดข้อผิดพลาดในการอัปเดตป้ายแบนเนอร์");
    return res.status(response.status).json(response);
  }
};

// Admin: Toggle banner active status
exports.toggleBannerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);
    if (!banner) {
      const response = await handleError(null, "ไม่พบป้ายแบนเนอร์", 404);
      return res.status(response.status).json(response);
    }

    banner.is_active = !banner.is_active;
    await banner.save();

    const response = await handleSuccess(banner, `เปลี่ยนสถานะแบนเนอร์เป็น ${banner.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน"}`);
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, "เกิดข้อผิดพลาดในการเปลี่ยนสถานะ");
    return res.status(response.status).json(response);
  }
};

// Admin: Delete banner
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);
    if (!banner) {
      const response = await handleError(null, "ไม่พบป้ายแบนเนอร์", 404);
      return res.status(response.status).json(response);
    }

    // Delete image file from server
    if (banner.image_url) {
      const filePath = path.join(__dirname, "../../", banner.image_url);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) { console.error("Error unlinking banner file:", e); }
      }
    }

    await Banner.findByIdAndDelete(id);

    const response = await handleSuccess(null, "ลบป้ายแบนเนอร์สำเร็จ");
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, "เกิดข้อผิดพลาดในการลบป้ายแบนเนอร์");
    return res.status(response.status).json(response);
  }
};
