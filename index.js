const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const path = require('path');
const connectDB = require("./config/db");
const config = require("./config/config");
const routes = require("./routes");
const cron = require('node-cron');
const { checkLotterySetResults } = require('./service/lottery/lotterySets.service');
const {
  huaylaocronjob,
  huaylaoextracronjob,
  huaylaostarcronjob,
  huaylaounioncronjob,
  huaylaohd,
  huaylaovip,
  huaylaostarvip,
  huylaogachad,
  huaylaothakhek5d,
  huaylaothakhekvip,
  huaylaotv
} = require('./service/cronjob/cronjob.service');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// เชื่อมต่อ MongoDB
connectDB();

app.get("/check", (req, res) => {
  console.log("Response  check");
  res.status(200).json({
    status: 200,
    success: true,
    data: "API v 1.0 is running",
  });
  return;
});

app.use("/api", routes);

// ===== CRONJOB สำหรับหวยลาวแต่ละประเภท (ตามเวลาสิ้นสุด) =====
cron.schedule('30 8 * * *', async () => {
  console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] Fetching Lao Extra lottery data...`);
  try {
    await huaylaoextracronjob();
  } catch (error) {
    console.error('Error fetching Lao Extra lottery data:', error.message);
  }
}, { timezone: "Asia/Bangkok" });

// หวยลาว TV ทุกวัน เวลา 10:30 น.
cron.schedule('30 10 * * *', async () => {
  console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] Fetching Lao TV lottery data...`);
  try {
    await huaylaotv();
  } catch (error) {
    console.error('Error fetching Lao TV lottery data:', error.message);
  }
}, { timezone: "Asia/Bangkok" });

// หวยลาว HD ทุกวัน เวลา 13:45 น.
cron.schedule('45 13 * * *', async () => {
  console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] Fetching Lao HD lottery data...`);
  try {
    await huaylaohd();
  } catch (error) {
    console.error('Error fetching Lao HD lottery data:', error.message);
  }
}, { timezone: "Asia/Bangkok" });

// หวยลาวสตาร์ ทุกวัน เวลา 15:45 น.
cron.schedule('45 15 * * *', async () => {
  console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] Fetching Lao Stars lottery data...`);
  try {
    await huaylaostarcronjob();
  } catch (error) {
    console.error('Error fetching Lao Stars lottery data:', error.message);
  }
}, { timezone: "Asia/Bangkok" });

// หวยลาวท่าแขก VIP ทุกวัน เวลา 20:00 น.
cron.schedule('0 20 * * *', async () => {
  console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] Fetching Lao Thakhek VIP lottery data...`);
  try {
    await huaylaothakhekvip();
  } catch (error) {
    console.error('Error fetching Lao Thakhek VIP lottery data:', error.message);
  }
}, { timezone: "Asia/Bangkok" });

// หวยลาวพัฒนา ทุกวันจันทร์ และพฤหัสบดี เวลา 20:30 น.
cron.schedule('30 20 * * 1,4', async () => {
  console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] Fetching Lao lottery data...`);
  try {
    await huaylaocronjob();
  } catch (error) {
    console.error('Error fetching Lao lottery data:', error.message);
  }
}, { timezone: "Asia/Bangkok" });

// หวยลาวสามัคคี ทุกวันอังคาร พุธ ศุกร์ เสาร์ และอาทิตย์ เวลา 20:40 น.
cron.schedule('40 20 * * 2,3,5,6,0', async () => {
  console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] Fetching Lao Union lottery data...`);
  try {
    await huaylaounioncronjob();
  } catch (error) {
    console.error('Error fetching Lao Union lottery data:', error.message);
  }
}, { timezone: "Asia/Bangkok" });

// หวยลาว VIP ทุกวัน เวลา 21:30 น.
cron.schedule('30 21 * * *', async () => {
  console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] Fetching Lao VIP lottery data...`);
  try {
    await huaylaovip();
  } catch (error) {
    console.error('Error fetching Lao VIP lottery data:', error.message);
  }
}, { timezone: "Asia/Bangkok" });

// หวยลาวท่าแขก 5D ทุกวัน เวลา 21:45 น.
cron.schedule('45 21 * * *', async () => {
  console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] Fetching Lao Thakhek 5D lottery data...`);
  try {
    await huaylaothakhek5d();
  } catch (error) {
    console.error('Error fetching Lao Thakhek 5D lottery data:', error.message);
  }
}, { timezone: "Asia/Bangkok" });

// หวยลาวสตาร์ VIP ทุกวัน เวลา 22:00 น.
cron.schedule('0 22 * * *', async () => {
  console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] Fetching Lao Stars VIP lottery data...`);
  try {
    await huaylaostarvip();
  } catch (error) {
    console.error('Error fetching Lao Stars VIP lottery data:', error.message);
  }
}, { timezone: "Asia/Bangkok" });

// หวยลาวกาชาด ทุกวัน เวลา 23:30 น.
cron.schedule('30 23 * * *', async () => {
  console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] Fetching Lao Redcross lottery data...`);
  try {
    await huylaogachad();
  } catch (error) {
    console.error('Error fetching Lao Redcross lottery data:', error.message);
  }
}, { timezone: "Asia/Bangkok" });

// ออกผลหวย ทุกนาที (สำหรับตรวจสอบผลหวยอื่นๆ)
cron.schedule('* * * * *', async () => {
  await checkLotterySetResults();
}, { timezone: "Asia/Bangkok" });


// หวยลาว TEST ทุกวัน เวลา 12:35 น.

cron.schedule('40 12 * * *', async () => {
  console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] CRON TEST Triggered`);
}, { timezone: "Asia/Bangkok" });



// เริ่มเซิร์ฟเวอร์
app.listen(config.port, () =>
  console.log(`API running on port ${config.port}`)
);































