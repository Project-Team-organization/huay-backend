const cron = require('node-cron');
const {
    huayhanoiasean,
    huayhanoihd,
    huayhanoistar,
    huayhanoitv,
    huayhanoispecial,
    huayhanoiredcross,
    huayhanoispecialapi,
    huayhanoi,
    huayhanoidevelop,
    huayhanoivip,
    huayhanoiextra
} = require('../service/cronjob/cronjob.service');

// Cronjob สำหรับหวยฮานอยอาเซียน - ทุกวัน เวลา 09:30 น. (เวลาประเทศไทย)
cron.schedule('32 9 * * *', async () => {
  try {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] Fetching Hanoi ASEAN lottery data...`);
    
    await huayhanoiasean();
    
    console.log('✅ Hanoi ASEAN lottery data fetched and saved successfully');
  } catch (error) {
    console.error('❌ Error fetching Hanoi ASEAN lottery data:', error.message);
  }
}, { timezone: "Asia/Bangkok" });

// Cronjob สำหรับหวยฮานอย HD - ทุกวัน เวลา 11:30 น. (เวลาประเทศไทย)
cron.schedule('32 11 * * *', async () => {
  try {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] Fetching Hanoi HD lottery data...`);
    
    await huayhanoihd();
    
    console.log('✅ Hanoi HD lottery data fetched and saved successfully');
  } catch (error) {
    console.error('❌ Error fetching Hanoi HD lottery data:', error.message);
  }
}, { timezone: "Asia/Bangkok" });

// Cronjob สำหรับหวยฮานอยสตาร์ - ทุกวัน เวลา 12:30 น. (เวลาประเทศไทย)
cron.schedule('32 12 * * *', async () => {
  try {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] Fetching Hanoi Star lottery data...`);
    
    await huayhanoistar();
    
    console.log('✅ Hanoi Star lottery data fetched and saved successfully');
  } catch (error) {
    console.error('❌ Error fetching Hanoi Star lottery data:', error.message);
  }
}, { timezone: "Asia/Bangkok" });

// Cronjob สำหรับหวยฮานอย TV - ทุกวัน เวลา 14:30 น. (เวลาประเทศไทย)
cron.schedule('32 14 * * *', async () => {
  try {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] Fetching Hanoi TV lottery data...`);
    
    await huayhanoitv();
    
    console.log('✅ Hanoi TV lottery data fetched and saved successfully');
  } catch (error) {
    console.error('❌ Error fetching Hanoi TV lottery data:', error.message);
  }
}, { timezone: "Asia/Bangkok" });

// Cronjob สำหรับหวยฮานอยเฉพาะกิจ - ทุกวัน เวลา 16:30 น. (เวลาประเทศไทย)
cron.schedule('32 16 * * *', async () => {
  try {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] Fetching Hanoi Special lottery data...`);
    
    await huayhanoispecial();
    
    console.log('✅ Hanoi Special lottery data fetched and saved successfully');
  } catch (error) {
    console.error('❌ Error fetching Hanoi Special lottery data:', error.message);
  }
}, { timezone: "Asia/Bangkok" });

// Cronjob สำหรับหวยฮานอยกาชาด - ทุกวัน เวลา 16:35 น. (เวลาประเทศไทย)
cron.schedule('35 16 * * *', async () => {
  try {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] Fetching Hanoi Redcross lottery data...`);
    
    await huayhanoiredcross();
    
    console.log('✅ Hanoi Redcross lottery data fetched and saved successfully');
  } catch (error) {
    console.error('❌ Error fetching Hanoi Redcross lottery data:', error.message);
  }
}, { timezone: "Asia/Bangkok" });

// Cronjob สำหรับหวยฮานอยพิเศษ - ทุกวัน เวลา 17:30 น. (เวลาประเทศไทย)
cron.schedule('32 17 * * *', async () => {
  try {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] Fetching Hanoi Special API lottery data...`);
    
    await huayhanoispecialapi();
    
    console.log('✅ Hanoi Special API lottery data fetched and saved successfully');
  } catch (error) {
    console.error('❌ Error fetching Hanoi Special API lottery data:', error.message);
  }
}, { timezone: "Asia/Bangkok" });

// Cronjob สำหรับหวยฮานอย - ทุกวัน เวลา 18:35 น. (เวลาประเทศไทย)
cron.schedule('35 18 * * *', async () => {
  try {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] Fetching Hanoi lottery data...`);
    
    await huayhanoi();
    
    console.log('✅ Hanoi lottery data fetched and saved successfully');
  } catch (error) {
    console.error('❌ Error fetching Hanoi lottery data:', error.message);
  }
}, { timezone: "Asia/Bangkok" });

// Cronjob สำหรับหวยฮานอยพัฒนา - ทุกวัน เวลา 19:30 น. (เวลาประเทศไทย)
cron.schedule('32 19 * * *', async () => {
  try {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] Fetching Hanoi Develop lottery data...`);
    
    await huayhanoidevelop();
    
    console.log('✅ Hanoi Develop lottery data fetched and saved successfully');
  } catch (error) {
    console.error('❌ Error fetching Hanoi Develop lottery data:', error.message);
  }
}, { timezone: "Asia/Bangkok" });

// Cronjob สำหรับหวยฮานอย VIP - ทุกวัน เวลา 19:35 น. (เวลาประเทศไทย)
cron.schedule('35 19 * * *', async () => {
  try {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] Fetching Hanoi VIP lottery data...`);
    
    await huayhanoivip();
    
    console.log('✅ Hanoi VIP lottery data fetched and saved successfully');
  } catch (error) {
    console.error('❌ Error fetching Hanoi VIP lottery data:', error.message);
  }
}, { timezone: "Asia/Bangkok" });

// Cronjob สำหรับหวยฮานอย EXTRA - ทุกวัน เวลา 22:15 น. (เวลาประเทศไทย)
cron.schedule('17 22 * * *', async () => {
  try {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] Fetching Hanoi Extra lottery data...`);
    
    await huayhanoiextra();
    
    console.log('✅ Hanoi Extra lottery data fetched and saved successfully');
  } catch (error) {
    console.error('❌ Error fetching Hanoi Extra lottery data:', error.message);
  }
}, { timezone: "Asia/Bangkok" });

console.log('🚀 Hanoi lottery cronjobs scheduled successfully');
