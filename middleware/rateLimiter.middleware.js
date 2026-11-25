const { rateLimit } = require("express-rate-limit");
const { normalizeIP } = require("../utils/utils");
const { logAction } = require("../utils/logger");

// Helper ดึง IP สำหรับใช้บันทึกลง logs
const getLogIP = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  const rawIp = forwarded ? forwarded.split(",")[0].trim() : (req.ip || req.connection?.remoteAddress);
  return normalizeIP(rawIp) || req.ip || "unknown";
};

/**
 * 🛡️ Admin & Master Login Rate Limiter
 * - ป้องกันการสุ่มรหัสผ่าน (Brute-force / Dictionary Attacks)
 * - จำกัด 5 ครั้งผิดพลาด ภายใน 15 นาที ต่อ 1 IP
 * - skipSuccessfulRequests: true -> ถ้าล็อกอินสำเร็จ จะไม่ถูกนับโควตา
 * - เมื่อติดบล็อก จะบันทึกลงตาราง logs (security_alert) ทันที
 */
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 นาที
  limit: 5, // ผิดพลาดได้ไม่เกิน 5 ครั้ง
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7", // RateLimit-Policy, RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    const ip = getLogIP(req);

    // บันทึก Security Alert ลงตาราง logs
    try {
      logAction("login_admin_rate_limit_blocked", {
        tag: "security_alert",
        endpoint: req.originalUrl,
        method: req.method,
        ip,
        data: {
          ip,
          message: "Blocked by rate limiter: Too many failed login attempts",
          attemptedUsername: req.body?.username || "unknown",
          userAgent: req.get("User-Agent") || "unknown",
          referrer: req.get("Referer") || null,
        },
      });
    } catch (err) {
      console.error("Failed to log rate limit block:", err.message);
    }

    return res.status(429).json({
      success: false,
      status: 429,
      message: "คุณพยายามเข้าสู่ระบบไม่สำเร็จหลายครั้งเกินไป เพื่อความปลอดภัยของระบบ กรุณารอ 15 นาทีก่อนลองใหม่อีกครั้ง",
      retryAfter: Math.ceil(options.windowMs / 1000 / 60) + " นาที",
    });
  },
});

/**
 * 🛡️ User Login Rate Limiter (สำหรับหน้าเว็บสมาชิก)
 * - จำกัด 10 ครั้งผิดพลาด ภายใน 15 นาที ต่อ 1 IP
 * - skipSuccessfulRequests: true
 */
const userLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    const ip = getLogIP(req);
    try {
      logAction("login_user_rate_limit_blocked", {
        tag: "security_alert",
        endpoint: req.originalUrl,
        method: req.method,
        ip,
        data: {
          ip,
          message: "Blocked by rate limiter: Too many failed user login attempts",
          attemptedUsername: req.body?.phone || req.body?.username || "unknown",
          userAgent: req.get("User-Agent") || "unknown",
        },
      });
    } catch (err) {
      console.error("Failed to log user rate limit block:", err.message);
    }

    return res.status(429).json({
      success: false,
      status: 429,
      message: "คุณกรอกรหัสผ่านไม่ถูกต้องเกินจำนวนครั้งที่กำหนด กรุณารอ 15 นาทีแล้วลองใหม่อีกครั้ง",
      retryAfter: Math.ceil(options.windowMs / 1000 / 60) + " นาที",
    });
  },
});

/**
 * 🛡️ User Register Rate Limiter
 * - ป้องกันการสมัครสมาชิกอัตโนมัติ (Spam / Bot registrations)
 * - จำกัด 5 ครั้ง ต่อ 15 นาที ต่อ 1 IP
 */
const userRegisterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    const ip = getLogIP(req);
    try {
      logAction("register_rate_limit_blocked", {
        tag: "security_alert",
        endpoint: req.originalUrl,
        method: req.method,
        ip,
        data: {
          ip,
          message: "Blocked by rate limiter: Too many registration attempts",
          phone: req.body?.phone || "unknown",
          userAgent: req.get("User-Agent") || "unknown",
        },
      });
    } catch (err) {
      console.error("Failed to log register rate limit block:", err.message);
    }

    return res.status(429).json({
      success: false,
      status: 429,
      message: "คุณทำรายการสมัครสมาชิกบ่อยเกินไป กรุณารอ 15 นาทีแล้วลองใหม่อีกครั้ง",
      retryAfter: Math.ceil(options.windowMs / 1000 / 60) + " นาที",
    });
  },
});

/**
 * 🛡️ User Forgot Password Rate Limiter
 * - ป้องกันการสุ่มค้นหาหรือดึงข้อมูลผ่านระบบลืมรหัสผ่าน
 * - จำกัด 5 ครั้ง ต่อ 15 นาที ต่อ 1 IP
 */
const userForgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    const ip = getLogIP(req);
    try {
      logAction("forgot_password_rate_limit_blocked", {
        tag: "security_alert",
        endpoint: req.originalUrl,
        method: req.method,
        ip,
        data: {
          ip,
          message: "Blocked by rate limiter: Too many forgot password attempts",
          phone: req.body?.phone || "unknown",
          userAgent: req.get("User-Agent") || "unknown",
        },
      });
    } catch (err) {
      console.error("Failed to log forgot password rate limit block:", err.message);
    }

    return res.status(429).json({
      success: false,
      status: 429,
      message: "คุณทำรายการลืมรหัสผ่านบ่อยเกินไป กรุณารอ 15 นาทีแล้วลองใหม่อีกครั้ง",
      retryAfter: Math.ceil(options.windowMs / 1000 / 60) + " นาที",
    });
  },
});

module.exports = {
  adminLoginLimiter,
  userLoginLimiter,
  userRegisterLimiter,
  userForgotPasswordLimiter,
};
