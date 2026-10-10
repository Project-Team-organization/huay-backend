const express = require("express");
const router = express.Router();
const cashbackController = require("../controller/admin/cashback.controller");
const authmiddleware = require("../middleware/authadmin.middleware");

// 📥 ดึงข้อมูลการตั้งค่าคืนยอดเสีย (Admin / Public for settings query)
router.get("/config", cashbackController.getConfig);

// ✏️ อัปเดตการตั้งค่าคืนยอดเสีย (Admin)
router.put(
  "/config",
  authmiddleware.permissionmanageradmin,
  cashbackController.updateConfig
);

// 📋 ดึงประวัติรายการคืนยอดเสีย (Admin)
router.get(
  "/history",
  authmiddleware.permissionmanageradmin,
  cashbackController.getHistory
);

// 🚀 สั่งรันการคืนยอดเสียแบบ Manual (Admin)
router.post(
  "/process-manual",
  authmiddleware.permissionmanageradmin,
  cashbackController.triggerManualProcess
);

// 👤 ดึงข้อมูลสรุปยอดเสียสัปดาห์ปัจจุบัน (Client / User)
router.get(
  "/my-summary",
  authmiddleware.isUser,
  cashbackController.getUserSummary
);

module.exports = router;
