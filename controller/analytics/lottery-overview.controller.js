const lotteryOverviewService = require("../../service/analytics/lottery-overview.service");
const { logAction } = require("../../utils/logger");
const { normalizeIP } = require("../../utils/utils");

// รายงานสรุปภาพรวมหวยทุกประเภท
exports.getLotteryOverviewReport = async (req, res) => {
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

    const result = await lotteryOverviewService.getLotteryOverviewReport({
      startDate,
      endDate
    });

    return res.status(result.status).json(result);
  } catch (error) {
    await logAction("get_lottery_overview_error", {
      tag: "get_lottery_overview",
      userId,
      fullUrl,
      ip,
      referrer,
      error: error.message,
    });

    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลรายงานสรุปภาพรวม",
      error: error.message
    });
  }
};
