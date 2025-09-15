const cron = require('node-cron');
const {
    huaymagnum4d,
    huaysingapore4d,
    huaygranddragon4d
} = require('../service/cronjob/cronjob.service');

// Cronjob สำหรับหวย Magnum 4D - รันวันพุธ วันเสาร์ และวันอาทิตย์ เวลา 18:10 น. (เวลาไทย)
// มี Special Draw วันอังคาร เวลา 19:00 น.
cron.schedule('10 18 * * 2,3,6,0', async () => {
  try {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 6 = Saturday
    
    let drawType = "Regular Draw";
    if (dayOfWeek === 2) { // Tuesday
      drawType = "Special Draw";
    }
    
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] Fetching Magnum 4D lottery data (${drawType})...`);
    
    await huaymagnum4d();
    
    console.log(`✅ Magnum 4D ${drawType} data fetched and saved successfully`);
  } catch (error) {
    console.error('❌ Error fetching Magnum 4D lottery data:', error.message);
  }
}, { timezone: "Asia/Bangkok" });

// Cronjob สำหรับหวยสิงคโปร์ 4D - รันวันพุธ วันเสาร์ และวันอาทิตย์ เวลา 18:00 น. (เวลาประเทศไทย)
cron.schedule('0 17 * * 3,6,0', async () => {
  try {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] Fetching Singapore 4D lottery data...`);
    
    await huaysingapore4d();
    
    console.log('✅ Singapore 4D lottery data fetched and saved successfully');
  } catch (error) {
    console.error('❌ Error fetching Singapore 4D lottery data:', error.message);
  }
}, { timezone: "Asia/Bangkok" });

// Cronjob สำหรับหวย Grand Dragon 4D - รันวันพุธ วันเสาร์ และวันอาทิตย์ เวลา 17:30 น. (เวลาประเทศไทย)
cron.schedule('10 18 * * 3,6,0', async () => {
  try {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] Fetching Grand Dragon 4D lottery data...`);
    
    await huaygranddragon4d();
    
    console.log('✅ Grand Dragon 4D lottery data fetched and saved successfully');
  } catch (error) {
    console.error('❌ Error fetching Grand Dragon 4D lottery data:', error.message);
  }
}, { timezone: "Asia/Bangkok" });

console.log('🚀 Magnum 4D, Singapore 4D, and Grand Dragon 4D lottery cronjobs scheduled successfully');



