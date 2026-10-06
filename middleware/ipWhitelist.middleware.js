const { normalizeIP } = require("../utils/utils");
const HentoryLog = require("../models/hentoryLog.model");

const WHITELISTED_IPS = (process.env.HENTORY_WHITELIST_IPS || "")
  .split(",")
  .map((ip) => ip.trim())
  .filter(Boolean);

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
