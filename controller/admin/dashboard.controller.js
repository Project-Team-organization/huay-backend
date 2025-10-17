const dashboardService = require("../../service/admin/dashboard.service");
const { handleSuccess, handleError } = require("../../utils/responseHandler");
const { logAction } = require("../../utils/logger");
const { normalizeIP } = require("../../utils/utils");

/**
 * GET /api/dashboard/summary
 * ดึงข้อมูลสรุป Dashboard ทั้งหมดในเส้นเดียว
 */
exports.getDashboardSummary = async (req, res) => {
  const userId = req.user?._id || null;
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  const ipRaw =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.connection.remoteAddress ||
    req.ip;
  const ip = normalizeIP(ipRaw);
  const referrer = req.get("Referer") || null;

  try {
    const summary = await dashboardService.getDashboardSummary();

    const response = await handleSuccess(
      summary,
      "ดึงข้อมูล Dashboard สำเร็จ",
      200
    );
    return res.status(response.status).json(response);
  } catch (error) {
    await logAction("dashboard_summary_error", {
      tag: "dashboard_summary",
      userId,
      fullUrl,
      ip,
      referrer,
      error: error.message,
    });
    const response = await handleError(
      error,
      "เกิดข้อผิดพลาดในการดึงข้อมูล Dashboard"
    );
    return res.status(response.status).json(response);
  }
};
