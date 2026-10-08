const express = require("express");
const router = express.Router();
const commissionController = require("../controller/commission/commission.controller");
const authmiddleware = require("../middleware/authadmin.middleware");

// ดึงรายงานค่าคอมมิชชั่นของ Master
router.get(
  "/master/:master_id",
  authmiddleware.isMaster,
  authmiddleware.ensureOwnMaster("master_id"),
  commissionController.getMasterCommission,
);

// ดึงรายงานค่าคอมมิชชั่นเดือนปัจจุบัน
router.get(
  "/master/:master_id/current",
  authmiddleware.isMaster,
  authmiddleware.ensureOwnMaster("master_id"),
  commissionController.getCurrentMonthCommission,
);

// ดึงธุรกรรมฝาก-ถอนทั้งหมดของ Master (ไม่ผูกเดือน)
router.get(
  "/master/:master_id/transactions",
  authmiddleware.isMaster,
  authmiddleware.ensureOwnMaster("master_id"),
  commissionController.getMasterTransactions,
);

// ดึงรายละเอียด transactions ของ commission (สำหรับ Master)
router.get(
  "/master/transactions/:commission_id",
  authmiddleware.isMaster,
  commissionController.getCommissionTransactions,
);

// ดึงรายงานค่าคอมมิชชั่นทั้งหมด (สำหรับ Admin)
router.get(
  "/all",
  authmiddleware.permissionmanageradmin,
  commissionController.getAllMasterCommissions,
);

// ปิดเดือนค่าคอมมิชชั่น
router.put(
  "/close/:master_id",
  authmiddleware.permissionmanageradmin,
  commissionController.closeMonthCommission,
);

// จ่ายเงินค่าคอมมิชชั่น
router.put(
  "/pay/:commission_id",
  authmiddleware.permissionmanageradmin,
  commissionController.payCommission,
);

// ดึงรายละเอียด transactions ของ commission (ฝาก-ถอน)
router.get(
  "/transactions/:commission_id",
  authmiddleware.permissionmanageradmin,
  commissionController.getCommissionTransactions,
);

module.exports = router;
