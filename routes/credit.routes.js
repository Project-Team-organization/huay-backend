const express = require("express");
const router = express.Router();
const creditController = require("../controller/credit/credit.controller");
const { isUser, isAdmin } = require("../middleware/authadmin.middleware");
const { depositLimiter } = require("../middleware/rateLimiter.middleware");

// สำหรับ admin สร้าง/ปรับยอดเครดิต (ต้องมีสิทธิ์ Admin)
router.post("/create", isAdmin, creditController.createCredit);

// ของ user
router.post("/createuser", isUser, depositLimiter, creditController.createCreditUser);
router.get("/history/getuser", isUser, creditController.getCreditsBytoken);

// routes สำหรับ transaction
router.get("/transactions/user/:user_id", isAdmin, creditController.getUserTransactions); // สำหรับ admin
router.get("/transactions/my", isUser, creditController.getMyTransactions); // สำหรับ user

// จัดการเครดิต (admin เท่านั้น)
router.get("/get", isAdmin, creditController.getAllCredits);
router.get("/getbyid/:id", isAdmin, creditController.getCreditsByID);
router.get("/user/:user_id", isAdmin, creditController.getCreditsByUserId);
router.get("/financial-summary", isAdmin, creditController.getFinancialSummary);

// อัปเดต อนุมัติ ยกเลิก ลบ (admin เท่านั้น)
router.put("/update/:id", isAdmin, creditController.updateCredit);
router.put("/approve/:id", isAdmin, creditController.approveCredit);
router.put("/cancel/:id", isAdmin, creditController.cancelCredit);
router.delete("/delete/:id", isAdmin, creditController.deleteCredit);

// ดูรูปสลิป
router.get("/slip/:id", isAdmin, creditController.getCreditSlip);

// ยังไม่ใช้
router.get("/days/check", isAdmin, creditController.getTopupDays);

module.exports = router;
