const userCommissionService = require("../../service/commission/userCommission.service");
const { handleSuccess, handleError } = require("../../utils/responseHandler");

/**
 * ดึงภาพรวมสถิติค่าคอมมิชชั่นของผู้ใช้งาน
 */
exports.getSummary = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const summary = await userCommissionService.getUserCommissionSummary(userId);
    return res.status(200).json({
      success: true,
      data: summary,
      message: "ดึงข้อมูลสรุปคอมมิชชั่นสำเร็จ",
    });
  } catch (error) {
    console.error("Error in getSummary:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * ดึงรายชื่อสมาชิกในสายงาน
 */
exports.getMembers = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";

    const result = await userCommissionService.getReferredMembers(userId, { page, limit, search });
    return res.status(200).json({
      success: true,
      data: result,
      message: "ดึงข้อมูลสมาชิกในสายงานสำเร็จ",
    });
  } catch (error) {
    console.error("Error in getMembers:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * กดรับเครดิตค่าคอมมิชชั่นเข้ากระเป๋าหลัก
 */
exports.claimCommission = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const result = await userCommissionService.claimCommission(userId);
    return res.status(200).json({
      success: true,
      data: result,
      message: `รับเครดิตค่าคอมมิชชั่นสำเร็จ ${result.claimed_amount} บาท`,
    });
  } catch (error) {
    console.error("Error in claimCommission:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * ประวัติการได้ค่าคอมมิชชั่น
 */
exports.getLogs = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await userCommissionService.getCommissionLogs(userId, { page, limit });
    return res.status(200).json({
      success: true,
      data: result,
      message: "ดึงประวัติค่าคอมมิชชั่นสำเร็จ",
    });
  } catch (error) {
    console.error("Error in getLogs:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * ดึงการตั้งค่าคอมมิชชั่นแนะนำเพื่อน (สำหรับ Admin / Public)
 */
exports.getConfig = async (req, res) => {
  try {
    const config = await userCommissionService.getConfig();
    return res.status(200).json({
      success: true,
      data: config,
      message: "ดึงข้อมูลการตั้งค่าสำเร็จ",
    });
  } catch (error) {
    console.error("Error in getConfig:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * อัปเดตการตั้งค่าคอมมิชชั่นแนะนำเพื่อน (สำหรับ Admin)
 */
exports.updateConfig = async (req, res) => {
  try {
    const adminId = req.user?._id || null;
    const { rate, calculation_type, min_claim_amount, is_active } = req.body;

    const updated = await userCommissionService.updateConfig(
      { rate, calculation_type, min_claim_amount, is_active },
      adminId
    );
    return res.status(200).json({
      success: true,
      data: updated,
      message: "อัปเดตการตั้งค่าสำเร็จ",
    });
  } catch (error) {
    console.error("Error in updateConfig:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * ดึงรายการค่าคอมมิชชั่นของสมาชิกทั้งหมด (สำหรับ Admin)
 */
exports.getAllUserCommissions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const result = await userCommissionService.getAllUserCommissions({ page, limit, search });
    return res.status(200).json({
      success: true,
      data: result,
      message: "ดึงข้อมูลค่าคอมมิชชั่นของ User สำเร็จ",
    });
  } catch (error) {
    console.error("Error in getAllUserCommissions:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * ดึงประวัติค่าคอมมิชชั่นของ User รายบุคคล (สำหรับ Admin)
 */
exports.getAdminUserLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await userCommissionService.getCommissionLogs(userId, { page, limit });
    return res.status(200).json({
      success: true,
      data: result,
      message: "ดึงประวัติค่าคอมมิชชั่นของสมาชิกสำเร็จ",
    });
  } catch (error) {
    console.error("Error in getAdminUserLogs:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

