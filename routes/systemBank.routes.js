const express = require("express");
const router = express.Router();
const systemBankController = require("../controller/bank/systemBank.controller");
const { permissionmanageradmin } = require("../middleware/authadmin.middleware");

router.get("/", systemBankController.getSystemBank);
router.put("/", permissionmanageradmin, systemBankController.updateSystemBank);

module.exports = router;
