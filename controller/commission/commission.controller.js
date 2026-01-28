const commissionService = require("../../service/commission/commission.service");
const { handleSuccess, handleError } = require("../../utils/responseHandler");
const { logAction } = require("../../utils/logger");
const { normalizeIP } = require("../../utils/utils");

/**
 * ดึงรายงานค่าคอมมิชชั่นของ Master
 */
exports.getMasterCommission = async (req, res) => {
  const userId = req.user?._id || null;
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  const ipRaw =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.connection.remoteAddress ||
    req.ip;
  const ip = normalizeIP(ipRaw);
  const referrer = req.get("Referer") || null;

  try {
    const { master_id } = req.params;
    const { year, month } = req.query;

    if (!master_id) {
      const response = await handleError(null, "กรุณาระบุ Master ID", 400);
      return res.status(response.status).json(response);
    }

    const result = await commissionService.getMasterCommission(
      master_id,
      year,
      month,
    );
    return res.status(result.status).json(result);
  } catch (error) {
    await logAction("get_master_commission_error", {
      tag: "get_master_commission",
      userId,
      fullUrl,
      ip,
      referrer,
      error: error.message,
    });
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

/**
 * ดึงรายงานค่าคอมมิชชั่นเดือนปัจจุบัน
 */
exports.getCurrentMonthCommission = async (req, res) => {
  const userId = req.user?._id || null;
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  const ipRaw =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.connection.remoteAddress ||
    req.ip;
  const ip = normalizeIP(ipRaw);
  const referrer = req.get("Referer") || null;

  try {
    const { master_id } = req.params;

    if (!master_id) {
      const response = await handleError(null, "กรุณาระบุ Master ID", 400);
      return res.status(response.status).json(response);
    }

    const result = await commissionService.getCurrentMonthCommission(master_id);
    return res.status(result.status).json(result);
  } catch (error) {
    await logAction("get_current_month_commission_error", {
      tag: "get_current_month_commission",
      userId,
      fullUrl,
      ip,
      referrer,
      error: error.message,
    });
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

/**
 * ดึงรายงานค่าคอมมิชชั่นทั้งหมด (สำหรับ Admin)
 */
exports.getAllMasterCommissions = async (req, res) => {
  const userId = req.user?._id || null;
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  const ipRaw =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.connection.remoteAddress ||
    req.ip;
  const ip = normalizeIP(ipRaw);
  const referrer = req.get("Referer") || null;

  try {
    const { page, perPage, year, month, status, master_id } = req.query;

    const result = await commissionService.getAllMasterCommissions({
      page: parseInt(page) || 1,
      perPage: parseInt(perPage) || 10,
      year,
      month,
      status,
      masterId: master_id,
    });

    return res.status(result.status).json(result);
  } catch (error) {
    await logAction("get_all_master_commissions_error", {
      tag: "get_all_master_commissions",
      userId,
      fullUrl,
      ip,
      referrer,
      error: error.message,
    });
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

/**
 * ปิดเดือนค่าคอมมิชชั่น
 */
exports.closeMonthCommission = async (req, res) => {
  const userId = req.user?._id || null;
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  const ipRaw =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.connection.remoteAddress ||
    req.ip;
  const ip = normalizeIP(ipRaw);
  const referrer = req.get("Referer") || null;

  try {
    const { master_id } = req.params;
    const { year, month } = req.body;

    if (!master_id || !year || !month) {
      const response = await handleError(
        null,
        "กรุณาระบุ Master ID, ปี และเดือน",
        400,
      );
      return res.status(response.status).json(response);
    }

    const result = await commissionService.closeMonthCommission(
      master_id,
      year,
      month,
    );
    return res.status(result.status).json(result);
  } catch (error) {
    await logAction("close_month_commission_error", {
      tag: "close_month_commission",
      userId,
      fullUrl,
      ip,
      referrer,
      error: error.message,
    });
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

/**
 * จ่ายเงินค่าคอมมิชชั่น
 */
exports.payCommission = async (req, res) => {
  const userId = req.user?._id || null;
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  const ipRaw =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.connection.remoteAddress ||
    req.ip;
  const ip = normalizeIP(ipRaw);
  const referrer = req.get("Referer") || null;

  try {
    const { commission_id } = req.params;

    if (!commission_id) {
      const response = await handleError(null, "กรุณาระบุ Commission ID", 400);
      return res.status(response.status).json(response);
    }

    const result = await commissionService.payCommission(commission_id, userId);
    return res.status(result.status).json(result);
  } catch (error) {
    await logAction("pay_commission_error", {
      tag: "pay_commission",
      userId,
      fullUrl,
      ip,
      referrer,
      error: error.message,
    });
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

/**
 * ดึงรายละเอียด transactions ของ commission
 */
exports.getCommissionTransactions = async (req, res) => {
  const userId = req.user?._id || null;
  const userRole = req.user?.role || null;
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  const ipRaw =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.connection.remoteAddress ||
    req.ip;
  const ip = normalizeIP(ipRaw);
  const referrer = req.get("Referer") || null;

  try {
    const { commission_id } = req.params;

    const { page, perPage, type } = req.query;

    if (!commission_id) {
      const response = await handleError(null, "กรุณาระบุ Commission ID", 400);
      return res.status(response.status).json(response);
    }

    const result = await commissionService.getCommissionTransactions(
      commission_id,
      {
        page: parseInt(page) || 1,
        perPage: parseInt(perPage) || 20,
        type, // 'deposit', 'withdrawal', หรือไม่ระบุ (ทั้งหมด)
        userId: userRole === "master" ? userId : null, // ถ้าเป็น Master ส่ง userId ไปเช็ค
        userRole,
      },
    );

    return res.status(result.status).json(result);
  } catch (error) {
    await logAction("get_commission_transactions_error", {
      tag: "get_commission_transactions",
      userId,
      fullUrl,
      ip,
      referrer,
      error: error.message,
    });
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};
