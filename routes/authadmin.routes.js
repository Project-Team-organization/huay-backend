const express = require("express");
const router = express.Router();
const authadminController = require("../controller/authadmin/authadmin.controller");
const authmiddleware = require("../middleware/authadmin.middleware");


router.post("/login", authadminController.login);
router.post("/refresh-token", authadminController.refreshToken);
router.post("/logout", authadminController.logout);
router.post("/login-master", authadminController.loginMaster);
router.put("/change-password-master", authmiddleware.isMaster, authadminController.changePasswordMaster);


module.exports = router;