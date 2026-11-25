const express = require("express");
const router = express.Router();
const dashboardController = require("../controller/admin/dashboard.controller");
const { isAdmin } = require("../middleware/authadmin.middleware");

// Dashboard Summary - API เส้นเดียว (Admin เท่านั้น)
router.get(
  "/summary",
  isAdmin,
  dashboardController.getDashboardSummary
);

// Player Report - รายงานผู้เล่นพร้อม pagination (Admin เท่านั้น)
router.get(
  "/player-report",
  isAdmin,
  dashboardController.getPlayerReport
);

module.exports = router;
