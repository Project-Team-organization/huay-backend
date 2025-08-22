const mongoose = require("mongoose");
const axios = require("axios");
const lotteryLaoService = require('../lottery/lottery_lao.service');
const lotteryLaoExtraService = require('../lottery/lottery_lao_extra.service');
const lotteryLaoStarsService = require('../lottery/lottery_lao_stars.service');
const lotteryLaoUnionService = require('../lottery/lottery_lao_union.service');

// Import services สำหรับหวยลาวแต่ละประเภท
const lotteryLaoHdService = require('../lottery/lottery_lao_hd.service');
const lotteryLaoVipService = require('../lottery/lottery_lao_vip.service');
const lotteryLaoStarsVipService = require('../lottery/lottery_lao_stars_vip.service');
const lotteryLaoRedcrossService = require('../lottery/lottery_lao_redcross.service');
const lotteryLaoThakhek5dService = require('../lottery/lottery_lao_thakhek_5d.service');
const lotteryLaoThakhekVipService = require('../lottery/lottery_lao_thakhek_vip.service');
const lotteryLaoTvService = require('../lottery/lottery_lao_tv.service');

// หวยลาวพัฒนา
exports.huaylaocronjob = async function () {
  try {
    // ดึงข้อมูลหวยลาวล่าสุด
    const result = await lotteryLaoService.fetchAndSaveLaoLottery();
    console.log('Lao lottery data fetched successfully:', result);
    return result;
  } catch (error) {
    console.error('Error fetching Lao lottery data:', error.message);
    throw error;
  }
}

// หวยลาว Extra
exports.huaylaoextracronjob = async function () {
  try {
    // ดึงข้อมูลหวยลาว Extra ล่าสุด
    const result = await lotteryLaoExtraService.fetchAndSaveLaoExtraLottery();
    console.log('Lao Extra lottery data fetched successfully:', result);
    return result;
  } catch (error) {
    console.error('Error fetching Lao Extra lottery data:', error.message);
    throw error;
  }
}

// หวยลาวสตาร์
exports.huaylaostarcronjob = async function () {
  try {
    // ดึงข้อมูลหวยลาวสตาร์ล่าสุด
    const result = await lotteryLaoStarsService.fetchAndSaveLaoStarsLottery();
    console.log('Lao Stars lottery data fetched successfully:', result);
    return result;
  } catch (error) {
    console.error('Error fetching Lao Stars lottery data:', error.message);
    throw error;
  }
}

// หวยลาวสามัคคี
exports.huaylaounioncronjob = async function () {
  try {
    // ดึงข้อมูลหวยลาวสามัคคีล่าสุด
    const result = await lotteryLaoUnionService.fetchLatestResult();
    console.log('Lao Union lottery data fetched successfully:', result);
    return result;
  } catch (error) {
    console.error('Error fetching Lao Union lottery data:', error.message);
    throw error;
  }
}

// หวยลาว HD
exports.huaylaohd = async function () {
  try {
    const result = await lotteryLaoHdService.fetchAndSaveLaoHdLottery();
    console.log('Lao HD lottery data fetched successfully:', result);
    return result;
  } catch (error) {
    console.error('Error fetching Lao HD lottery data:', error.message);
    throw error;
  }
}

// หวยลาว VIP
exports.huaylaovip = async function () {
  try {
    const result = await lotteryLaoVipService.fetchAndSaveLaoVipLottery();
    console.log('Lao VIP lottery data fetched successfully:', result);
    return result;
  } catch (error) {
    console.error('Error fetching Lao VIP lottery data:', error.message);
    throw error;
  }
}

// หวยลาวสตาร์ VIP
exports.huaylaostarvip = async function () {
  try {
    const result = await lotteryLaoStarsVipService.fetchAndSaveLaoStarsVipLottery();
    console.log('Lao Stars VIP lottery data fetched successfully:', result);
    return result;
  } catch (error) {
    console.error('Error fetching Lao Stars VIP lottery data:', error.message);
    throw error;
  }
}

// หวยลาวกาชาด
exports.huylaogachad = async function () {
  try {
    const result = await lotteryLaoRedcrossService.fetchAndSaveLaoRedcrossLottery();
    console.log('Lao Redcross lottery data fetched successfully:', result);
    return result;
  } catch (error) {
    console.error('Error fetching Lao Redcross lottery data:', error.message);
    throw error;
  }
}

// หวยลาวทำเนียบ 5D
exports.huaylaothakhek5d = async function () {
  try {
    const result = await lotteryLaoThakhek5dService.fetchAndSaveLaoThakhek5dLottery();
    console.log('Lao Thakhek 5D lottery data fetched successfully:', result);
    return result;
  } catch (error) {
    console.error('Error fetching Lao Thakhek 5D lottery data:', error.message);
    throw error;
  }
}

// หวยลาวทำเนียบ VIP
exports.huaylaothakhekvip = async function () {
  try {
    const result = await lotteryLaoThakhekVipService.fetchAndSaveLaoThakhekVipLottery();
    console.log('Lao Thakhek VIP lottery data fetched successfully:', result);
    return result;
  } catch (error) {
    console.error('Error fetching Lao Thakhek VIP lottery data:', error.message);
    throw error;
  }
}

// หวยลาว TV
exports.huaylaotv = async function () {
  try {
    const result = await lotteryLaoTvService.fetchAndSaveLaoTvLottery();
    console.log('Lao TV lottery data fetched successfully:', result);
    return result;
  } catch (error) {
    console.error('Error fetching Lao TV lottery data:', error.message);
    throw error;
  }
}