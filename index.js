const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const path = require('path'); 
const connectDB = require("./config/db");
const config = require("./config/config");
const routes = require("./routes");
const cron = require('node-cron');
const { checkLotterySetResults } = require('./service/lottery/lotterySets.service');
const { huaylaocronjob, huaylaoextracronjob, huaylaostarcronjob, huaylaounioncronjob } = require('./service/cronjob/cronjob.service');

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

// ออกผลหวย 
cron.schedule('* * * * *', async () => {
  // console.log('Running lottery sets check...');
  await checkLotterySetResults();

  // ลองtest ฟังก์ชั่น
  // await huaylaocronjob();
  // await huaylaoextracronjob();
  // await huaylaostarcronjob();
  // await huaylaounioncronjob();

});

// ดึงข้อมูลหวยลาว ทุกวันจันทร์ พุธ ศุกร์ เวลา 20:30 น.
cron.schedule('30 20 * * 1,3,5', async () => {
  console.log('Fetching Lao lottery data...');
  try {
    await huaylaocronjob();
    console.log('Lao lottery data fetched successfully');
  } catch (error) {
    console.error('Error fetching Lao lottery data:', error.message);
  }
});

// ดึงข้อมูลหวยลาว Extra ทุกวัน เวลา 08:30 น.
cron.schedule('30 8 * * *', async () => {
  console.log('Fetching Lao Extra lottery data...');
  try {
    await huaylaoextracronjob();
    console.log('Lao Extra lottery data fetched successfully');
  } catch (error) {
    console.error('Error fetching Lao Extra lottery data:', error.message);
  }
});

// ดึงข้อมูลหวยลาวสตาร์ ทุกวัน เวลา 15:45 น.
cron.schedule('45 15 * * *', async () => {
  console.log('Fetching Lao Stars lottery data...');
  try {
    await huaylaostarcronjob();
    console.log('Lao Stars lottery data fetched successfully');
  } catch (error) {
    console.error('Error fetching Lao Stars lottery data:', error.message);
  }
});

// ดึงข้อมูลหวยลาวสามัคคี ทุกวันเสาร์และอาทิตย์ เวลา 20:30 น.
cron.schedule('30 20 * * 6,0', async () => {
  console.log('Fetching Lao Union lottery data...');
  try {
    await huaylaounioncronjob();
    console.log('Lao Union lottery data fetched successfully');
  } catch (error) {
    console.error('Error fetching Lao Union lottery data:', error.message);
  }
});

// เริ่มเซิร์ฟเวอร์
app.listen(config.port, () =>
  console.log(`API running on port ${config.port}`)
);































