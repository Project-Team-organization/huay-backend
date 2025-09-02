const cron = require('node-cron');
const { fetchAndSaveThaiGsbLottery } = require('../service/lottery/lottery_thai_gsb.service');
const { fetchAndSaveThaiSavingsLottery } = require('../service/lottery/lottery_thai_savings.service');

// Cronjob สำหรับหวยไทย GSB - รันเดือนละครั้งในวันที่ 16 เวลา 11:20 น. (เวลาประเทศไทย)
cron.schedule('20 11 16 * *', async () => {
  try {
    console.log('🕐 Starting Thai GSB lottery cronjob at:', new Date().toLocaleString('th-TH'));
    
    // Retry mechanism - ลอง 3 ครั้ง
    let result = null;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries && !result) {
      try {
        console.log(`🔄 Attempt ${retryCount + 1}/${maxRetries} to fetch Thai GSB lottery data...`);
        result = await fetchAndSaveThaiGsbLottery();
        break; // ถ้าสำเร็จให้ออกจาก loop
      } catch (error) {
        retryCount++;
        console.log(`⚠️ Attempt ${retryCount} failed: ${error.message}`);
        
        if (retryCount < maxRetries) {
          // รอ 5 นาทีก่อนลองใหม่
          console.log(`⏳ Waiting 5 minutes before retry...`);
          await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
        }
      }
    }
    
    if (result) {
      console.log('✅ Thai GSB lottery data fetched and saved successfully');
      console.log('📅 Lottery date:', result.lotto_date);
      console.log('🎯 Results:', result.results);
    } else {
      console.error('❌ All retry attempts failed for Thai GSB lottery');
    }
  } catch (error) {
    console.error('❌ Error in Thai GSB lottery cronjob:', error.message);
  }
}, {
  timezone: "Asia/Bangkok"
});

// Cronjob สำหรับหวยไทยออมสิน - รันเดือนละ 2 ครั้งในวันที่ 1 และ 16 เวลา 11:25 น. (เวลาประเทศไทย)
cron.schedule('25 11 1,16 * *', async () => {
  try {
    console.log('🕐 Starting Thai Savings lottery cronjob at:', new Date().toLocaleString('th-TH'));
    
    // Retry mechanism - ลอง 3 ครั้ง
    let result = null;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries && !result) {
      try {
        console.log(`🔄 Attempt ${retryCount + 1}/${maxRetries} to fetch Thai Savings lottery data...`);
        result = await fetchAndSaveThaiSavingsLottery();
        break; // ถ้าสำเร็จให้ออกจาก loop
      } catch (error) {
        retryCount++;
        console.log(`⚠️ Attempt ${retryCount} failed: ${error.message}`);
        
        if (retryCount < maxRetries) {
          // รอ 5 นาทีก่อนลองใหม่
          console.log(`⏳ Waiting 5 minutes before retry...`);
          await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
        }
      }
    }
    
    if (result) {
      console.log('✅ Thai Savings lottery data fetched and saved successfully');
      console.log('📅 Lottery date:', result.lotto_date);
      console.log('🎯 Results:', result.results);
    } else {
      console.error('❌ All retry attempts failed for Thai Savings lottery');
    }
  } catch (error) {
    console.error('❌ Error in Thai Savings lottery cronjob:', error.message);
  }
}, {
  timezone: "Asia/Bangkok"
});

console.log('🚀 Thai lottery cronjobs scheduled successfully');