const cashbackService = require("../../service/cashback/cashback.service");

/**
 * 📥 GET /api/cashback/config
 * ดึงข้อมูลการตั้งค่าคืนยอดเสีย
 */
exports.getConfig = async (req, res) => {
  try {
    const config = await cashbackService.getCashbackConfig();
    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูลการตั้งค่าคืนยอดเสียสำเร็จ",
      data: config,
    });
  } catch (error) {
    console.error("Error in getConfig:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลการตั้งค่าคืนยอดเสีย",
      error: error.message,
    });
  }
};

/**
 * ✏️ PUT /api/cashback/config
 * อัปเดตการตั้งค่าคืนยอดเสีย
 */
exports.updateConfig = async (req, res) => {
  try {
    const { percentage, min_loss_amount, max_cashback, is_active, is_auto_payout } = req.body;
    const adminId = req.user ? req.user._id : null;

    const updatedConfig = await cashbackService.updateCashbackConfig(
      { percentage, min_loss_amount, max_cashback, is_active, is_auto_payout },
      adminId
    );

    return res.status(200).json({
      success: true,
      message: "อัปเดตการตั้งค่าคืนยอดเสียสำเร็จ",
      data: updatedConfig,
    });
  } catch (error) {
    console.error("Error in updateConfig:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัปเดตการตั้งค่าคืนยอดเสีย",
      error: error.message,
    });
  }
};

/**
 * 📋 GET /api/cashback/history
 * ดึงประวัติการคืนยอดเสียสำหรับ Admin
 */
exports.getHistory = async (req, res) => {
  try {
    const result = await cashbackService.getCashbackHistory(req.query);
    return res.status(200).json({
      success: true,
      message: "ดึงประวัติการคืนยอดเสียสำเร็จ",
      ...result,
    });
  } catch (error) {
    console.error("Error in getHistory:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงประวัติการคืนยอดเสีย",
      error: error.message,
    });
  }
};

/**
 * 🚀 POST /api/cashback/process-manual
 * ปุ่มสั่งรันการคืนยอดเสียแบบ Manual (สำหรับ Admin)
 */
exports.triggerManualProcess = async (req, res) => {
  try {
    const { targetDate } = req.body;
    const result = await cashbackService.calculateAndProcessWeeklyCashback(targetDate);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in triggerManualProcess:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการประมวลผลคืนยอดเสีย",
      error: error.message,
    });
  }
};

/**
 * 👤 GET /api/cashback/my-summary
 * ดึงข้อมูลสรุปยอดเสียสัปดาห์ปัจจุบันสำหรับ User
 */
exports.getUserSummary = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.query.user_id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ User ID",
      });
    }

    const summary = await cashbackService.getUserCashbackSummary(userId);
    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูลสรุปยอดเสียสำเร็จ",
      data: summary,
    });
  } catch (error) {
    console.error("Error in getUserSummary:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลสรุปยอดเสีย",
      error: error.message,
    });
  }
};
