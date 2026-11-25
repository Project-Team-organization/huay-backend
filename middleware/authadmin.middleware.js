const jwt = require("jsonwebtoken");
const config = require("../config/config");
const admin = require("../models/admin.model");
const superadmin = require("../models/superadmin.model");
const master = require("../models/master.model");

// Helper เช็คว่าบัญชียังมีอยู่จริงใน DB และ active: true
async function verifyActiveAccount(decoded) {
  if (!decoded || !decoded._id) return false;
  try {
    if (decoded.role === "superadmin") {
      const s = await superadmin.findById(decoded._id).select("active");
      return s && s.active;
    }
    if (decoded.role === "admin") {
      const a = await admin.findById(decoded._id).select("active");
      return a && a.active;
    }
    if (decoded.role === "master") {
      const m = await master.findById(decoded._id).select("active");
      return m && m.active;
    }
  } catch (e) {
    return false;
  }
  return true;
}

const isUser = (req, res, next) => {
  const token =
    req.cookies?.access_token ||
    req.headers["x-access-token"] ||
    req.headers["authorization"];

  if (!token) {
    return res.status(401).json({
      message: "ไม่พบ token กรุณาเข้าสู่ระบบ",
    });
  }
  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), config.jwt.secret);
    req.user = decoded;

    // ตรวจสอบ role
    if (
      req.user.role === "admin" ||
      req.user.role === "superadmin" ||
      req.user.role === "user"
    ) {
      next();
    } else {
      return res.status(403).json({
        message: "ไม่มีสิทธิ์เข้าถึง",
      });
    }
  } catch (err) {
    // console.log(err);
    return res.status(401).json({
      message: "Token ไม่ถูกต้องหรือหมดอายุ",
    });
  }
};

const isMaster = async (req, res, next) => {
  const token =
    req.cookies?.access_token ||
    req.headers["x-access-token"] ||
    req.headers["authorization"];

  if (!token) {
    return res.status(401).json({
      message: "ไม่พบ token กรุณาเข้าสู่ระบบ",
    });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), config.jwt.secret);
    req.user = decoded;
    // ตรวจสอบ role
    if (
      req.user.role === "admin" ||
      req.user.role === "superadmin" ||
      req.user.role === "master"
    ) {
      const isActive = await verifyActiveAccount(decoded);
      if (!isActive) {
        return res.status(401).json({
          message: "บัญชีนี้ไม่มีอยู่ในระบบหรือถูกระงับการใช้งาน",
        });
      }
      next();
    } else {
      return res.status(403).json({
        message: "ไม่มีสิทธิ์เข้าถึง",
      });
    }
  } catch (err) {
    return res.status(401).json({
      message: err.message || "Token ไม่ถูกต้องหรือหมดอายุ",
    });
  }
};

const isAdmin = async (req, res, next) => {
  const token =
    req.cookies?.access_token ||
    req.headers["x-access-token"] ||
    req.headers["authorization"];

  if (!token) {
    return res.status(401).json({
      message: "ไม่พบ token กรุณาเข้าสู่ระบบ",
    });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), config.jwt.secret);
    req.user = decoded;
    // ตรวจสอบ role
    if (req.user.role === "admin" || req.user.role === "superadmin") {
      const isActive = await verifyActiveAccount(decoded);
      if (!isActive) {
        return res.status(401).json({
          message: "บัญชีนี้ไม่มีอยู่ในระบบหรือถูกระงับการใช้งาน",
        });
      }
      next();
    } else {
      return res.status(403).json({
        message: "ไม่มีสิทธิ์เข้าถึง",
      });
    }
  } catch (err) {
    return res.status(401).json({
      message: err.message || "Token ไม่ถูกต้องหรือหมดอายุ",
    });
  }
};

// เช็ค mangagersuperadmin
const permissionmanagersuperadmin = async (req, res, next) => {
  const token =
    req.cookies?.access_token ||
    req.headers["x-access-token"] ||
    req.headers["authorization"];
  if (!token) {
    return res.status(401).json({
      message: "ไม่พบ token กรุณาเข้าสู่ระบบ",
    });
  }
  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), config.jwt.secret);
    req.user = decoded;
    // เช็ค role ก่อน ถ้าเป็น superadmin  สามารถเข้าถึงได้
    if (req.user.role === "superadmin") {
      next();
    } else if (req.user.role === "admin") {
      // ให้เช็ค premission
      const permission = req.user.premission;
      if (
        Array.isArray(permission) &&
        permission.length > 0 &&
        permission[0].managersuperadmin === "1"
      ) {
        next();
      } else {
        return res.status(403).json({
          message: "ไม่มีสิทธิ์เข้าถึง",
        });
      }
    } else {
      return res.status(403).json({
        message: "ไม่มีสิทธิ์เข้าถึง",
      });
    }
  } catch (err) {
    return res.status(401).json({
      message: err.message || "Token ไม่ถูกต้องหรือหมดอายุ",
    });
  }
};
// เช็ค manageradmin
const permissionmanageradmin = async (req, res, next) => {
  const token =
    req.cookies?.access_token ||
    req.headers["x-access-token"] ||
    req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ message: "ไม่พบ token กรุณาเข้าสู่ระบบ" });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), config.jwt.secret);
    req.user = decoded;

    if (req.user.role === "superadmin") {
      return next();
    } else if (req.user.role === "admin") {
      const permission = req.user.premission;
      if (
        Array.isArray(permission) &&
        permission.length > 0 &&
        permission[0].manageradmin === "1"
      ) {
        return next();
      } else {
        return res.status(403).json({ message: "ไม่มีสิทธิ์เข้าถึง" });
      }
    } else {
      return res.status(403).json({ message: "ไม่มีสิทธิ์เข้าถึง" });
    }
  } catch (err) {
    return res
      .status(401)
      .json({ message: err.message || "Token ไม่ถูกต้องหรือหมดอายุ" });
  }
};

// เช็ค  managermaster
const permissionmanagermaster = async (req, res, next) => {
  const token =
    req.cookies?.access_token ||
    req.headers["x-access-token"] ||
    req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ message: "ไม่พบ token กรุณาเข้าสู่ระบบ" });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), config.jwt.secret);
    req.user = decoded;

    if (req.user.role === "superadmin") {
      return next();
    } else if (req.user.role === "admin") {
      const permission = req.user.premission;
      if (
        Array.isArray(permission) &&
        permission.length > 0 &&
        permission[0].managermaster === "1"
      ) {
        return next();
      } else {
        return res.status(403).json({ message: "ไม่มีสิทธิ์เข้าถึง" });
      }
    } else {
      return res.status(403).json({ message: "ไม่มีสิทธิ์เข้าถึง" });
    }
  } catch (err) {
    return res
      .status(401)
      .json({ message: err.message || "Token ไม่ถูกต้องหรือหมดอายุ" });
  }
};

// เช็ค lotterytype
const permissionlotterytype = async (req, res, next) => {
  const token =
    req.cookies?.access_token ||
    req.headers["x-access-token"] ||
    req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ message: "ไม่พบ token กรุณาเข้าสู่ระบบ" });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), config.jwt.secret);
    req.user = decoded;

    if (req.user.role === "superadmin") {
      return next();
    } else if (req.user.role === "admin") {
      const permission = req.user.premission;
      if (
        Array.isArray(permission) &&
        permission.length > 0 &&
        permission[0].lotterytype === "1"
      ) {
        return next();
      } else {
        return res.status(403).json({ message: "ไม่มีสิทธิ์เข้าถึง" });
      }
    } else {
      return res.status(403).json({ message: "ไม่มีสิทธิ์เข้าถึง" });
    }
  } catch (err) {
    return res
      .status(401)
      .json({ message: err.message || "Token ไม่ถูกต้องหรือหมดอายุ" });
  }
};

async function authenticate(req, res, next) {
  try {
    const token =
      req.cookies?.access_token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded._id };

    next();
  } catch (err) {
    console.log("JWT Verify Error:", err);
    return res
      .status(401)
      .json({ success: false, message: "Token ไม่ถูกต้องหรือหมดอายุ" });
  }
}

// master เข้าถึงได้เฉพาะข้อมูลของตัวเอง (admin/superadmin ผ่านได้) ใช้ต่อท้าย isMaster
const ensureOwnMaster = (paramName = "master_id") => (req, res, next) => {
  if (
    req.user?.role === "master" &&
    String(req.user._id) !== String(req.params[paramName])
  ) {
    return res
      .status(403)
      .json({ message: "ไม่มีสิทธิ์เข้าถึงข้อมูลของ Master อื่น" });
  }
  next();
};

module.exports = {
  ensureOwnMaster,
  isAdmin,
  isUser,
  isMaster,
  permissionmanagersuperadmin,
  permissionmanageradmin,
  permissionmanagermaster,
  permissionlotterytype,
  authenticate,
};
