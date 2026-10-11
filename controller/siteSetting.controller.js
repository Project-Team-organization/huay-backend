const path = require("path");
const fs = require("fs");
const SiteSetting = require("../models/siteSetting.model");
const { handleSuccess, handleError } = require("../utils/responseHandler");

const logoDir = path.join(__dirname, "../uploads/logos");

const LIMITS = { site_name: 120, site_description: 300 };

// Sanitize a string field. Returns { value } (null when empty) or { error }.
function sanitizeText(input, maxLength) {
  if (typeof input !== "string") {
    return { error: "ต้องเป็นข้อความเท่านั้น" };
  }
  const cleaned = input
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim();
  if (cleaned.length > maxLength) {
    return { error: `ต้องไม่เกิน ${maxLength} ตัวอักษร` };
  }
  return { value: cleaned === "" ? null : cleaned };
}

function logoInfo(type) {
  const filePath = path.join(logoDir, `${type}.png`);
  try {
    const stat = fs.statSync(filePath);
    return { url: `/uploads/logos/${type}.png`, updatedAt: stat.mtime.toISOString() };
  } catch (e) {
    return { url: null, updatedAt: null };
  }
}

async function buildPayload() {
  const doc = await SiteSetting.findOne({ key: "site" }).lean();
  const favicon = logoInfo("favicon");
  return {
    site_name: doc?.site_name || null,
    site_description: doc?.site_description || null,
    favicon_url: favicon.url,
    favicon_updated_at: favicon.updatedAt,
    login_logo_url: logoInfo("login").url,
    sidebar_logo_url: logoInfo("sidebar").url,
    updated_at: doc?.updated_at ? new Date(doc.updated_at).toISOString() : null,
  };
}

exports.getSiteSettings = async (req, res) => {
  try {
    const data = await buildPayload();
    const response = await handleSuccess(data, "ดึงข้อมูลตั้งค่าเว็บไซต์สำเร็จ");
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, "เกิดข้อผิดพลาด");
    return res.status(response.status).json(response);
  }
};

exports.updateSiteSettings = async (req, res) => {
  try {
    const body = req.body || {};
    const $set = {};
    for (const field of ["site_name", "site_description"]) {
      if (body[field] === undefined) continue;
      const result = sanitizeText(body[field], LIMITS[field]);
      if (result.error) {
        const response = await handleError(null, `${field} ${result.error}`, 400);
        return res.status(response.status).json(response);
      }
      $set[field] = result.value;
    }

    if (Object.keys($set).length === 0) {
      const response = await handleError(null, "ไม่พบข้อมูลที่ต้องการอัปเดต", 400);
      return res.status(response.status).json(response);
    }

    await SiteSetting.findOneAndUpdate(
      { key: "site" },
      { $set },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    const data = await buildPayload();
    const response = await handleSuccess(data, "บันทึกข้อมูลตั้งค่าเว็บไซต์สำเร็จ");
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, "เกิดข้อผิดพลาดในการบันทึก");
    return res.status(response.status).json(response);
  }
};

exports.sanitizeText = sanitizeText;
