const cron = require('node-cron');
const { fetchAndSaveMagnum4dLottery } = require('../service/lottery/lottery_magnum_4d.service');
const { fetchAndSaveSingapore4dLottery } = require('../service/lottery/lottery_singapore_4d.service');
const { fetchAndSaveGrandDragon4dLottery } = require('../service/lottery/lottery_grand_dragon_4d.service');

// Cronjob สำหรับหวย Magnum 4D - รันวันพุธ วันเสาร์ และวันอาทิตย์ เวลา 19:00 น. (เวลาไทย)
// มี Special Draw วันอังคาร เวลา 19:00 น.
cron.schedule('0 19 * * 2,3,6,0', async () => {
  try {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 6 = Saturday
    
    let drawType = "Regular Draw";
    if (dayOfWeek === 2) { // Tuesday
      drawType = "Special Draw";
    }
    
    console.log(`🕐 Starting Magnum 4D lottery cronjob (${drawType}) at:`, new Date().toLocaleString('th-TH'));
    
    // Retry mechanism - ลอง 3 ครั้ง
    let result = null;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries && !result) {
      try {
        console.log(`🔄 Attempt ${retryCount + 1}/${maxRetries} to fetch Magnum 4D lottery data...`);
        result = await fetchAndSaveMagnum4dLottery();
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
      console.log(`✅ Magnum 4D ${drawType} data fetched and saved successfully`);
      console.log('📅 Lottery date:', result.lotto_date);
      console.log('🎯 Results:', result.results);
    } else {
      console.error(`❌ All retry attempts failed for Magnum 4D ${drawType}`);
    }
  } catch (error) {
    console.error('❌ Error in Magnum 4D lottery cronjob:', error.message);
  }
}, {
  timezone: "Asia/Bangkok"
});

// Cronjob สำหรับหวยสิงคโปร์ 4D - รันวันพุธ วันเสาร์ และวันอาทิตย์ เวลา 18:00 น. (เวลาประเทศไทย)
cron.schedule('0 18 * * 3,6,0', async () => {
  try {
    console.log('🕐 Starting Singapore 4D lottery cronjob at:', new Date().toLocaleString('th-TH'));
    
    // Retry mechanism - ลอง 3 ครั้ง
    let result = null;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries && !result) {
      try {
        console.log(`🔄 Attempt ${retryCount + 1}/${maxRetries} to fetch Singapore 4D lottery data...`);
        result = await fetchAndSaveSingapore4dLottery();
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
      console.log('✅ Singapore 4D lottery data fetched and saved successfully');
      console.log('📅 Lottery date:', result.lotto_date);
      console.log('🎯 Results:', result.results);
    } else {
      console.error('❌ All retry attempts failed for Singapore 4D lottery');
    }
  } catch (error) {
    console.error('❌ Error in Singapore 4D lottery cronjob:', error.message);
  }
}, {
  timezone: "Asia/Bangkok"
});

// Cronjob สำหรับหวย Grand Dragon 4D - รันวันพุธ วันเสาร์ และวันอาทิตย์ เวลา 17:30 น. (เวลาประเทศไทย)
cron.schedule('30 17 * * 3,6,0', async () => {
  try {
    console.log('🕐 Starting Grand Dragon 4D lottery cronjob at:', new Date().toLocaleString('th-TH'));
    
    // Retry mechanism - ลอง 3 ครั้ง
    let result = null;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries && !result) {
      try {
        console.log(`🔄 Attempt ${retryCount + 1}/${maxRetries} to fetch Grand Dragon 4D lottery data...`);
        result = await fetchAndSaveGrandDragon4dLottery();
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
      console.log('✅ Grand Dragon 4D lottery data fetched and saved successfully');
      console.log('📅 Lottery date:', result.lotto_date);
      console.log('🎯 Results:', result.results);
    } else {
      console.error('❌ All retry attempts failed for Grand Dragon 4D lottery');
    }
  } catch (error) {
    console.error('❌ Error in Grand Dragon 4D lottery cronjob:', error.message);
  }
}, {
  timezone: "Asia/Bangkok"
});

console.log('🚀 Magnum 4D, Singapore 4D, and Grand Dragon 4D lottery cronjobs scheduled successfully');



