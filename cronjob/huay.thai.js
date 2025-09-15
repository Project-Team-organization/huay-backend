const cron = require('node-cron');
const {
    huaythaigsb,
    huaythaisavings
} = require('../service/cronjob/cronjob.service');

// Cronjob สำหรับหวยไทย GSB - รันเดือนละครั้งในวันที่ 16 เวลา 11:20 น. (เวลาประเทศไทย)
cron.schedule('20 11 16 * *', async () => {
  try {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] Fetching Thai GSB lottery data...`);
    
    await huaythaigsb();
    
    console.log('✅ Thai GSB lottery data fetched and saved successfully');
  } catch (error) {
    console.error('❌ Error fetching Thai GSB lottery data:', error.message);
  }
}, { timezone: "Asia/Bangkok" });

// Cronjob สำหรับหวยไทยออมสิน - รันเดือนละ 2 ครั้งในวันที่ 1 และ 16 เวลา 11:25 น. (เวลาประเทศไทย)
cron.schedule('25 11 1,16 * *', async () => {
  try {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] Fetching Thai Savings lottery data...`);
    
    await huaythaisavings();
    
    console.log('✅ Thai Savings lottery data fetched and saved successfully');
  } catch (error) {
    console.error('❌ Error fetching Thai Savings lottery data:', error.message);
  }
}, { timezone: "Asia/Bangkok" });

console.log('🚀 Thai lottery cronjobs scheduled successfully');