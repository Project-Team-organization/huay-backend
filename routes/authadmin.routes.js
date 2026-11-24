const express = require("express");
const router = express.Router();
const authadminController = require("../controller/authadmin/authadmin.controller");
const authmiddleware = require("../middleware/authadmin.middleware");
const { adminLoginLimiter } = require("../middleware/rateLimiter.middleware");

// ป้องกัน Brute-force สุ่มรหัสผ่านด้วย adminLoginLimiter (จำกัด 5 ครั้งผิดพลาด / 15 นาที)
router.post("/login", adminLoginLimiter, authadminController.login);
router.post("/refresh-token", authadminController.refreshToken);
router.post("/logout", authadminController.logout);
router.post("/login-master", adminLoginLimiter, authadminController.loginMaster);
router.put("/change-password-master", authmiddleware.isMaster, authadminController.changePasswordMaster);

module.exports = router;
