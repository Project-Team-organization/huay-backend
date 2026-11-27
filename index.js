const express = require("express");
const http = require("http");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const connectDB = require("./config/db");
const config = require("./config/config");
const routes = require("./routes");
const { initSocket } = require("./utils/socket");
const { globalApiLimiter } = require("./middleware/rateLimiter.middleware");

function sanitizeNoSql(obj) {
  if (!obj || typeof obj !== "object") return;
  if (Array.isArray(obj)) {
    for (const item of obj) sanitizeNoSql(item);
    return;
  }
  for (const key of Object.keys(obj)) {
    if (key.startsWith("$") || key === "__proto__" || key === "constructor" || key === "prototype") {
      delete obj[key];
    } else {
      sanitizeNoSql(obj[key]);
    }
  }
}

// Import cron job functions
require("./cronjob/cronjob_set");
require("./cronjob/cleanup.logs");

async function startServer() {
  const app = express();

  // Trust reverse proxy (Nginx) for accurate client IP in rate limiting & logs
  app.set("trust proxy", 1);
  const server = http.createServer(app);

  // setup socket.io
  initSocket(server);

  // Middleware
  app.use(
    cors({
      origin: [
        "https://admin.kaojing.online",
        "https://xian.kaojing.online",
        "https://asia.kaojing.online",
        "https://kaojing.online",
        "https://admin.luckyk168.com",
        "https://sain.luckyk168.com",
        "https://www.luckyk168.com",
        "https://luckyk168.com",
        "http://localhost:3000",
        "http://localhost:5173",
        "https://asian.luckyk168.com",
      ],
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      credentials: true,
    }),
  );

  // Body parser - ต้องอยู่ก่อน routes
  app.use(
    "/api/callback/hentory",
    express.json({
      verify: (req, res, buf) => {
        req.rawBody = buf.toString("utf8");
      },
    })
  );
  app.disable("x-powered-by");
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    next();
  });
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));
  app.use(cookieParser());
  app.use((req, res, next) => {
    sanitizeNoSql(req.body);
    sanitizeNoSql(req.query);
    sanitizeNoSql(req.params);
    next();
  });
  app.use(cookieParser());

  // Static files
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

  app.use("/api", globalApiLimiter, routes);

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
  server.listen(config.port, () =>
    console.log(`API and Socket running on port ${config.port}`),
  );
}

// run
startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
