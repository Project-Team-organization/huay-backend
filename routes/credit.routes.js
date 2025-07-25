const express = require("express");
const router = express.Router();
const creditController = require("../controller/credit/credit.controller");
const { isUser } = require("../middleware/authadmin.middleware");    
router.post("/create",creditController.createCredit);
//ของ user
router.post("/createuser", isUser, creditController.createCreditUser);
router.get("/history/getuser", isUser, creditController.getCreditsBytoken);

// เพิ่ม routes สำหรับ transaction
router.get("/transactions/user/:user_id", creditController.getUserTransactions); // สำหรับ admin
router.get("/transactions/my", isUser, creditController.getMyTransactions); // สำหรับ user

router.get("/get", creditController.getAllCredits);
router.get("/getbyid/:id", creditController.getCreditsByID);
router.get("/user/:user_id", creditController.getCreditsByUserId);

// เพิ่ม routes ใหม่
router.put("/update/:id", creditController.updateCredit);
router.put("/approve/:id", creditController.approveCredit);
router.put("/cancel/:id", creditController.cancelCredit);
router.delete("/delete/:id", creditController.deleteCredit);

// ยังไม่ใช้
router.get("/days/check", creditController.getTopupDays);

module.exports = router;
