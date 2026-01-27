// routes/index.js
const express = require("express");
const router = express.Router();
const userRoutes = require("./user.routes");
const authRoutes = require("../controller/auth/auth.controller");
const superadminRoutes = require("./superadmin.routes");
const adminRoutes = require("./admin.routes");
const lotteryRoutes = require("./lottery.routes");
const authadminRoutes = require("./authadmin.routes");
const masterRoutes = require("./master.routes");
const creditRoutes = require("./credit.routes");
const promotionRoutes = require("./promotion.routes");
const withdrawalRoutes = require("./withdrawal.routes");
const commissionRoutes = require("./commission.routes");

const cronjobRoutes = require("./cronjob.routes");
const dashboardRoutes = require("./dashboard.routes");
const analyticsRoutes = require("./analytics.routes");
const reportMasterRoutes = require("./reportmaster.routes");

const { authenticate } = require("../middleware/authadmin.middleware");

router.get("/check", (req, res) => {
  console.log("Response  check");
  res.status(200).json({
    status: 200,
    success: true,
    data: "Routes API v 1.0 is running",
  });
  return;
});

router.get("/test", (req, res) => {
  console.log("Test route called");
  res.status(200).json({
    status: 200,
    success: true,
    message: "Test route is working!",
    timestamp: new Date().toISOString(),
    data: {
      server: "Lottery API Server",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      randomNumber: Math.floor(Math.random() * 1000),
    },
  });
});

// ส่วน user
router.post("/login", authRoutes.login);
router.post("/refreshToken", authRoutes.refreshToken);
router.post("/logout", authRoutes.logout);
router.get("/profile/me", authenticate, authRoutes.getProfile);
router.use("/users", userRoutes);

// ส่วน admin
router.use("/superadmin", superadminRoutes);
router.use("/admin", adminRoutes);
router.use("/authadmin", authadminRoutes);
router.use("/master", masterRoutes);

// ส่วน lottery
router.use("/lottery", lotteryRoutes);

// ส่วนของ user lottery
router.use("/userlottery", userRoutes);

// ส่วนของการสร้าง credit
router.use("/credit", creditRoutes);

// ส่วนของการสร้าง promotion
router.use("/promotion", promotionRoutes);

// ส่วนของการถอนเงิน
router.use("/withdrawal", withdrawalRoutes);

// ส่วนของ commission
router.use("/commission", commissionRoutes);

// ส่วนของ cronjob logs
// router.use("/cronjob", cronjobRoutes);

// ส่วนของ analytics
router.use("/analytics", analyticsRoutes);

// ส่วนของ dashboard
router.use("/dashboard", dashboardRoutes);

// ส่วนของ report master
router.use("/reportmaster", reportMasterRoutes);

module.exports = router;
