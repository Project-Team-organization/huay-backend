const cron = require('node-cron');
const {
    huaythaigsb,
    huaythaisavings
} = require('../service/cronjob/cronjob.service');

// Cronjob สำหรับหวย ธกส - รันเดือนละครั้งในวันที่ 16 เวลา 11:20 น. (เวลาประเทศไทย)
cron.schedule('20 11 16 * *', async () => {
  try {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] Fetching ธกส lottery data...`);
    
    await huaythaisavings();
    
    console.log('✅ ธกส lottery data fetched and saved successfully');
  } catch (error) {
    console.error('❌ Error fetching ธกส lottery data:', error.message);
  }
}, { timezone: "Asia/Bangkok" });

// Cronjob สำหรับหวยออมสิน - รันเดือนละ 2 ครั้งในวันที่ 1 และ 16 เวลา 11:25 น. (เวลาประเทศไทย)
cron.schedule('25 11 1,16 * *', async () => {
  try {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] Fetching ออมสิน lottery data...`);
    
    await huaythaigsb();
    
    console.log('✅ ออมสิน lottery data fetched and saved successfully');
  } catch (error) {
    console.error('❌ Error fetching ออมสิน lottery data:', error.message);
  }
}, { timezone: "Asia/Bangkok" });

console.log('🚀 Thai lottery cronjobs scheduled successfully');