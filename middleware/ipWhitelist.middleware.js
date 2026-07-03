const { normalizeIP } = require("../utils/utils");

const WHITELISTED_IPS = (process.env.HENTORY_WHITELIST_IPS || "")
  .split(",")
  .map((ip) => ip.trim())
  .filter(Boolean);

const ipWhitelist = (req, res, next) => {
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
  return res.status(403).json({
    success: false,
    status: 403,
    message: "Access denied",
  });
};

module.exports = ipWhitelist;
