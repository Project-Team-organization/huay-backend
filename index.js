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
require('./cronjob/huay.foreign.stock');

async function startServer() {
  const app = express();

  // setup lens monitoring
  await lens({
    app,
    enabled: true,
  });

  // Middleware
  app.use(cors());
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

  // start server
  app.listen(config.port, () =>
    console.log(`API running on port ${config.port}`)
  );
}

// run
startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
