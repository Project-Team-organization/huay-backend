const cron = require('node-cron');
const { huayegyptstock, huaykoreanstockvip } = require('../service/cronjob/cronjob.service');

// Cronjob สำหรับหวยหุ้นอิยิปต์ - จันทร์-ศุกร์ เวลา 19:45 น. (เวลาประเทศไทย)
cron.schedule('45 19 * * 1-5', async () => {
  try {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] Fetching Egypt Stock lottery data...`);
    
    await huayegyptstock();
    
    console.log('✅ Egypt Stock lottery data fetched and saved successfully');
  } catch (error) {
    console.error('❌ Error fetching Egypt Stock lottery data:', error.message);
  }
}, { timezone: "Asia/Bangkok" });

// Cronjob สำหรับหวยหุ้นเกาหลี VIP - จันทร์-ศุกร์ เวลา 12:35 น. (เวลาประเทศไทย)
cron.schedule('35 12 * * 1-5', async () => {
  try {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] Fetching Korean Stock VIP lottery data...`);
    
    await huaykoreanstockvip();
    
    console.log('✅ Korean Stock VIP lottery data fetched and saved successfully');
  } catch (error) {
    console.error('❌ Error fetching Korean Stock VIP lottery data:', error.message);
  }
}, { timezone: "Asia/Bangkok" });

console.log('🚀 Foreign Stock lottery cronjobs scheduled successfully');
