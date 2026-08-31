const express = require("express");
const router = express.Router();
const systemBankController = require("../controller/bank/systemBank.controller");
const { permissionmanageradmin } = require("../middleware/authadmin.middleware");

// Public route สำหรับหน้าบ้าน (ไม่ต้อง login)
router.get("/public", systemBankController.getPublicSystemBank);

// Route สำหรับระบบ / admin
router.get("/", systemBankController.getSystemBank);
router.put("/", permissionmanageradmin, systemBankController.updateSystemBank);

module.exports = router;
