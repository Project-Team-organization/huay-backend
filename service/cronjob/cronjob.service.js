const mongoose = require("mongoose");
const axios = require("axios");
const lotteryLaoService = require('../lottery/lottery_lao.service');
const lotteryLaoExtraService = require('../lottery/lottery_lao_extra.service');
const lotteryLaoStarsService = require('../lottery/lottery_lao_stars.service');
const lotteryLaoUnionService = require('../lottery/lottery_lao_union.service');

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