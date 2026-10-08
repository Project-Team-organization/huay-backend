const { normalizeIP } = require("../utils/utils");
const HentoryLog = require("../models/hentoryLog.model");

// IP ทางการของค่ายเกม Hentory ทั้งหมด (AWS & Alibaba Cloud)
const DEFAULT_HENTORY_IPS = [
  "52.77.44.100",
  "54.179.77.241",
  "52.74.201.149",
  "47.131.243.144",
];

const ENV_IPS = (process.env.HENTORY_WHITELIST_IPS || "")
  .split(",")
  .map((ip) => ip.trim())
  .filter(Boolean);

const WHITELISTED_IPS = Array.from(new Set([...DEFAULT_HENTORY_IPS, ...ENV_IPS]));

const ipWhitelist = async (req, res, next) => {
  const ipRaw =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.connection.remoteAddress ||
    req.ip;
  const ip = normalizeIP(ipRaw);

  if (WHITELISTED_IPS.length === 0) {
    return next();
  }

  if (WHITELISTED_IPS.includes(ip)) {
    return next();
  }

  console.warn(`⛔ Blocked request from IP: ${ip}`);
  const responseData = {
    success: false,
    status: 403,
    message: "Access denied",
  };

  try {
    await HentoryLog.create({
      endpoint: req.originalUrl || req.path,
      headers: req.headers,
      body: req.body,
      rawBody: req.rawBody,
      response: responseData,
      error: `Blocked request from unwhitelisted IP: ${ip}`,
    });
  } catch (err) {
    console.error("❌ Failed to log blocked IP to HentoryLog:", err.message);
  }

  return res.status(403).json(responseData);
};

module.exports = ipWhitelist;
