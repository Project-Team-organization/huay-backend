const lotteryStatsService = require("../../service/analytics/lottery-stats.service");
const { logAction } = require("../../utils/logger");
const { normalizeIP } = require("../../utils/utils");

// ดึงสถิติหวยแต่ละงวด
exports.getLotteryStats = async (req, res) => {
  const userId = req.user?._id || null;
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  const ipRaw =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.connection.remoteAddress ||
    req.ip;
  const ip = normalizeIP(ipRaw);
  const referrer = req.get("Referer") || null;

  try {
    const { lotterySetId } = req.query;

    const result = await lotteryStatsService.getLotteryStats({
      lotterySetId
    });

    return res.status(result.status).json(result);
  } catch (error) {
    await logAction("get_lottery_stats_error", {
      tag: "get_lottery_stats",
      userId,
      fullUrl,
      ip,
      referrer,
      error: error.message,
    });

    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลสถิติหวย",
      error: error.message
    });
  }
};

// ดึงสถิติหวยตามประเภท (ทุกงวดในช่วงเวลา)
exports.getLotteryStatsByType = async (req, res) => {
  const userId = req.user?._id || null;
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  const ipRaw =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.connection.remoteAddress ||
    req.ip;
  const ip = normalizeIP(ipRaw);
  const referrer = req.get("Referer") || null;

  try {
    const { lotteryTypeName, startDate, endDate } = req.query;

    console.log("Query params received:", { lotteryTypeName, startDate, endDate });
    console.log("Full query:", req.query);

    const result = await lotteryStatsService.getLotteryStatsByType({
      lotteryTypeName,
      startDate,
      endDate
    });

    return res.status(result.status).json(result);
  } catch (error) {
    await logAction("get_lottery_stats_by_type_error", {
      tag: "get_lottery_stats_by_type",
      userId,
      fullUrl,
      ip,
      referrer,
      error: error.message,
    });

    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลสถิติหวยตามประเภท",
      error: error.message
    });
  }
};

// ดึงสถิติหวยทุกประเภท
exports.getAllLotteryStats = async (req, res) => {
  const userId = req.user?._id || null;
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  const ipRaw =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.connection.remoteAddress ||
    req.ip;
  const ip = normalizeIP(ipRaw);
  const referrer = req.get("Referer") || null;

  try {
    const { startDate, endDate } = req.query;

    const result = await lotteryStatsService.getAllLotteryStats({
      startDate,
      endDate
    });

    return res.status(result.status).json(result);
  } catch (error) {
    await logAction("get_all_lottery_stats_error", {
      tag: "get_all_lottery_stats",
      userId,
      fullUrl,
      ip,
      referrer,
      error: error.message,
    });

    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลสถิติหวยทุกประเภท",
      error: error.message
    });
  }
};

// ดึงสถิติหวยไทย/รัฐบาล
exports.getThaiLotteryStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const result = await lotteryStatsService.getThaiLotteryStats({ startDate, endDate });
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลสถิติหวยไทย",
      error: error.message
    });
  }
};

// ดึงสถิติหวยลาว
exports.getLaoLotteryStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const result = await lotteryStatsService.getLaoLotteryStats({ startDate, endDate });
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลสถิติหวยลาว",
      error: error.message
    });
  }
};

// ดึงสถิติหวยฮานอย
exports.getHanoiLotteryStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const result = await lotteryStatsService.getHanoiLotteryStats({ startDate, endDate });
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลสถิติหวยฮานอย",
      error: error.message
    });
  }
};

// ดึงสถิติหวย 4D
exports.get4DLotteryStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const result = await lotteryStatsService.get4DLotteryStats({ startDate, endDate });
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลสถิติหวย 4D",
      error: error.message
    });
  }
};

// ดึงสถิติหวยยี่กี
exports.getYeeKeeLotteryStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const result = await lotteryStatsService.getYeeKeeLotteryStats({ startDate, endDate });
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลสถิติหวยยี่กี",
      error: error.message
    });
  }
};
