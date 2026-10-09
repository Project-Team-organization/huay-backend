const express = require("express");
const router = express.Router();
const commissionController = require("../controller/commission/commission.controller");
const userCommissionController = require("../controller/commission/userCommission.controller");
const authmiddleware = require("../middleware/authadmin.middleware");

// ================= USER REFERRAL COMMISSION ROUTES =================
// การตั้งค่าคอมมิชชั่นแนะนำเพื่อน (Admin / Public)
router.get("/referral/config", userCommissionController.getConfig);
router.put(
  "/referral/config",
  authmiddleware.permissionmanageradmin,
  userCommissionController.updateConfig
);

// สรุปข้อมูลคอมมิชชั่นของผู้ใช้งาน
router.get("/user/summary", authmiddleware.isUser, userCommissionController.getSummary);

// รายชื่อสมาชิกในสายงาน
router.get("/user/members", authmiddleware.isUser, userCommissionController.getMembers);

// กดรับเงินคอมมิชชั่นเข้ากระเป๋าเครดิตหลัก
router.post("/user/claim", authmiddleware.isUser, userCommissionController.claimCommission);

// ประวัติค่าคอมมิชชั่นที่ได้รับ
router.get("/user/logs", authmiddleware.isUser, userCommissionController.getLogs);

// รายการค่าคอมมิชชั่นของ User ทั้งหมด (สำหรับ Admin)
router.get(
  "/admin/users",
  authmiddleware.permissionmanageradmin,
  userCommissionController.getAllUserCommissions
);

// ประวัติค่าคอมมิชชั่นของ User รายบุคคล (สำหรับ Admin)
router.get(
  "/admin/user/:userId/logs",
  authmiddleware.permissionmanageradmin,
  userCommissionController.getAdminUserLogs
);

// ================= MASTER COMMISSION ROUTES =================
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
