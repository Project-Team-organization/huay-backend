const express = require("express");
const router = express.Router();
const userController = require("../controller/user/user.controller");
const betController = require("../controller/user/bet/user.bet.controller");
const authmiddleware = require("../middleware/authadmin.middleware");
const lotteryController = require("../controller/user/lottery/lottery.controller");
const lotteryLaoController = require("../controller/user/lottery/huay.lao.controller");

// ค้นหา user สำหรับ select search
router.get("/search", userController.searchUsers);

router.post("/register", userController.register);

router.get("/history/:id", userController.getPasswordHistory);
router.post("/code", userController.checkCode);

// ส่วนของ user ที่ใช้ได้
router.get("/getbyid/:id", authmiddleware.isUser, userController.getUserById);
router.put("/update/:id", authmiddleware.isUser, userController.updateUser);

// ลืมรหัสผ่านด้วยเบอร์โทรและเลขบัญชีธนาคาร
router.post(
  "/forgotpassword",
  userController.forgotPasswordWithBankNumber
);

// ส่วนของ admin จัดการ user
router.get("/get", authmiddleware.isAdmin, userController.getAllUsers);
router.delete("/delete/:id", authmiddleware.isAdmin, userController.deleteUser);
router.put("/active/:id", authmiddleware.isAdmin, userController.activeUser);
router.put(
  "/deactive/:id",
  authmiddleware.isAdmin,
  userController.deactiveUser
);

// ส่วนของ lottery user
router.get("/lottery", lotteryController.getLotteryUserSets);
router.get("/all/huay", lotteryLaoController.getLotteryByDateAndType);

// ส่วนของ user bet
router.post("/bet", authmiddleware.isUser, betController.createUserBet);
router.post("/cancel/:id", authmiddleware.isUser, betController.cancelUserBet);
router.get("/bet", authmiddleware.isUser, betController.getUserBetsById);
router.get("/bet/:id", betController.getUserBetByPk);
router.get("/bet/find/all", authmiddleware.isUser, betController.getUserBetAll);

// user ดูเลขหวย
router.get("/huay", lotteryController.getAllHuay); // Get Huay A;；
router.get("/huay/set/:id", lotteryController.getHuay); // Get Huay By Lotter Set
router.get("/huay/:id", lotteryController.getHuayById); // Get Huay by ID 

// Get users referred by the authenticated user
router.get("/referral", authmiddleware.isUser, userController.getUsersReferredByUser);

module.exports = router;
