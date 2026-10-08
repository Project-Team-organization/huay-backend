const express = require("express");
const router = express.Router();
const cashbackController = require("../controller/admin/cashback.controller");

// 📥 ดึงข้อมูลการตั้งค่าคืนยอดเสีย (Admin / Public for settings query)
router.get("/config", cashbackController.getConfig);

// ✏️ อัปเดตการตั้งค่าคืนยอดเสีย (Admin)
router.put("/config", cashbackController.updateConfig);

// 📋 ดึงประวัติรายการคืนยอดเสีย (Admin)
router.get("/history", cashbackController.getHistory);

// 🚀 สั่งรันการคืนยอดเสียแบบ Manual (Admin)
router.post("/process-manual", cashbackController.triggerManualProcess);

// 👤 ดึงข้อมูลสรุปยอดเสียสัปดาห์ปัจจุบัน (Client / User)
router.get("/my-summary", cashbackController.getUserSummary);

module.exports = router;
