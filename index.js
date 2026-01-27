const express = require("express");
const { lens } = require("@lensjs/express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const config = require("./config/config");
const routes = require("./routes");

// Import cron job functions

require("./cronjob/huay.lao");
require("./cronjob/huay.thai");
require("./cronjob/huay.magnum4d");
require("./cronjob/huay.hanoi");
require("./cronjob/cronjob_set");
// require('./cronjob/huay.foreign.stock');


async function startServer() {
  const app = express();

  // setup lens monitoring
  await lens({
    app,
    enabled: true,
  });

  // Middleware
  app.use(cors({
    origin: [
      'https://admin.kaojing.online',
      'https://xian.kaojing.online',
      'https://asia.kaojing.online',
      'https://kaojing.online',
      'http://localhost:3000',
      'http://localhost:5173'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(fileUpload());
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  // connect MongoDB
  connectDB();

  app.get("/check", (req, res) => {
    console.log("Response check");
    res.status(200).json({
      status: 200,
      success: true,
      data: "API v 1.0 is running",
    });
  });

  app.use("/api", routes);

  // Log routes loaded
  console.log("\n📋 Routes loaded:");
  console.log("  - /api/authadmin (login, logout, refresh-token)");
  console.log("  - /api/admin");
  console.log("  - /api/superadmin");
  console.log("  - /api/users");
  console.log("  - /api/lottery");
  console.log("  - /api/credit");
  console.log("  - /api/withdrawal");
  console.log("  - /api/analytics");
  console.log("  - /api/dashboard");
  console.log("📋 End of Routes\n");

  // start server
  app.listen(config.port, () =>
    console.log(`API running on port ${config.port}`)
  );
}

// run
startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
