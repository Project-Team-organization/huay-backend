const express = require("express");
const router = express.Router();
const commissionController = require("../controller/commission/commission.controller");
const authmiddleware = require("../middleware/authadmin.middleware");

// ดึงรายงานค่าคอมมิชชั่นของ Master
router.get(
  "/master/:master_id",
  authmiddleware.permissionmanageradmin,
  commissionController.getMasterCommission
);

// ดึงรายงานค่าคอมมิชชั่นเดือนปัจจุบัน
router.get(
  "/master/:master_id/current",
  authmiddleware.permissionmanageradmin,
  commissionController.getCurrentMonthCommission
);

// ดึงรายงานค่าคอมมิชชั่นทั้งหมด (สำหรับ Admin)
router.get(
  "/all",
  authmiddleware.permissionmanageradmin,
  commissionController.getAllMasterCommissions
);

// ปิดเดือนค่าคอมมิชชั่น
router.put(
  "/close/:master_id",
  authmiddleware.permissionmanageradmin,
  commissionController.closeMonthCommission
);

// จ่ายเงินค่าคอมมิชชั่น
router.put(
  "/pay/:commission_id",
  authmiddleware.permissionmanageradmin,
  commissionController.payCommission
);

module.exports = router;
