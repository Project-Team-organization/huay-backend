const express = require("express");
const router = express.Router();
const reportMasterController = require("../controller/reportmaster/reportmaster.controller");
const authmiddleware = require("../middleware/authadmin.middleware");

// GET /api/reportmaster/:master_id
router.get("/:master_id", authmiddleware.isMaster, reportMasterController.getReportByMasterId);

module.exports = router;
