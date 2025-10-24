const express = require("express");
const router = express.Router();
const lotteryStatsController = require("../controller/analytics/lottery-stats.controller");
const lotteryOverviewController = require("../controller/analytics/lottery-overview.controller");
const authmiddleware = require("../middleware/authadmin.middleware");

// Route สำหรับดึงสถิติหวยแต่ละงวด (รายละเอียดเต็ม)
// GET /api/analytics/lottery/stats?lotterySetId=xxxxx
router.get(
    "/lottery/stats",
    authmiddleware.permissionmanageradmin,
    lotteryStatsController.getLotteryStats
);

// Route สำหรับดึงสถิติหวยตามประเภท (ทุกงวดในช่วงเวลา)
// GET /api/analytics/lottery/stats-by-type?lotteryTypeName=thai-lottery&startDate=2024-01-01&endDate=2024-01-31
router.get(
    "/lottery/stats-by-type",
    authmiddleware.permissionmanageradmin,
    lotteryStatsController.getLotteryStatsByType
);

// Route สำหรับดึงสถิติหวยทุกประเภท
// GET /api/analytics/lottery/all-stats?startDate=2024-01-01&endDate=2024-01-31
router.get(
    "/lottery/all-stats",
    authmiddleware.permissionmanageradmin,
    lotteryStatsController.getAllLotteryStats
);

// Routes แยกตามประเภทหวย
// GET /api/analytics/lottery/thai?startDate=2025-10-01&endDate=2025-10-31
router.get(
    "/lottery/thai",
    authmiddleware.permissionmanageradmin,
    lotteryStatsController.getThaiLotteryStats
);

// GET /api/analytics/lottery/lao?startDate=2025-10-01&endDate=2025-10-31
router.get(
    "/lottery/lao",
    authmiddleware.permissionmanageradmin,
    lotteryStatsController.getLaoLotteryStats
);

// GET /api/analytics/lottery/hanoi?startDate=2025-10-01&endDate=2025-10-31
router.get(
    "/lottery/hanoi",
    authmiddleware.permissionmanageradmin,
    lotteryStatsController.getHanoiLotteryStats
);

// GET /api/analytics/lottery/4d?startDate=2025-10-01&endDate=2025-10-31
router.get(
    "/lottery/4d",
    authmiddleware.permissionmanageradmin,
    lotteryStatsController.get4DLotteryStats
);

// GET /api/analytics/lottery/yeekee?startDate=2025-10-01&endDate=2025-10-31
router.get(
    "/lottery/yeekee",
    authmiddleware.permissionmanageradmin,
    lotteryStatsController.getYeeKeeLotteryStats
);

// รายงานสรุปภาพรวมหวยทุกประเภท (แบบตาราง)
// GET /api/analytics/lottery/overview?startDate=2025-10-01&endDate=2025-10-31
router.get(
    "/lottery/overview",
    authmiddleware.permissionmanageradmin,
    lotteryOverviewController.getLotteryOverviewReport
);

module.exports = router;
