const express = require("express");
const router = express.Router();
const withdrawalController = require("../controller/withdrawal/withdrawal.controller");
const { isUser, isAdmin } = require("../middleware/authadmin.middleware");
const { withdrawalLimiter } = require("../middleware/rateLimiter.middleware");

// Routes สำหรับ User
router.get("/turnover-status", isUser, withdrawalController.getTurnoverStatus);
router.post("/create", isUser, withdrawalLimiter, withdrawalController.createWithdrawal);
router.get(
  "/history/getuser",
  isUser,
  withdrawalController.getWithdrawalsBytoken,
);

// Routes สำหรับ Admin (ต้องมีสิทธิ์ Admin ทั้งหมด)
router.get("/user/:user_id", isAdmin, withdrawalController.getWithdrawalsByUserId);
router.put("/update/:id", isAdmin, withdrawalController.updateWithdrawal);
router.put("/cancel/:id", isAdmin, withdrawalController.cancelWithdrawal);

router.get("/turnover-status/:user_id", isAdmin, withdrawalController.getUserTurnoverStatusForAdmin);
router.get("/get", isAdmin, withdrawalController.getAllWithdrawals);
router.get("/getbyid/:id", isAdmin, withdrawalController.getWithdrawalById);
router.put("/approve/:id", isAdmin, withdrawalController.approveWithdrawal);
router.put("/reject/:id", isAdmin, withdrawalController.rejectWithdrawal);

// หักเงินจาก admin
router.post("/deduct-admin/", isAdmin, withdrawalController.deductFromAdmin);

router.delete("/delete/:id", isAdmin, withdrawalController.deleteWithdrawal);

// ดูรูปสลิปโอนเงิน
router.get("/slip/:id", isAdmin, withdrawalController.getWithdrawalSlip);

module.exports = router;
