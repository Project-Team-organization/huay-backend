const express = require("express");
const router = express.Router();
const dashboardController = require("../controller/admin/dashboard.controller");
const authmiddleware = require("../middleware/authadmin.middleware");

// Dashboard Summary - API เส้นเดียว
router.get(
  "/summary",
  // authmiddleware.permissionmanageradmin,
  dashboardController.getDashboardSummary
);

module.exports = router;
