const axios = require('axios');
const LotteryLaoExtra = require('../../models/lotterylao.extra.model');

const fetchAndSaveLaoExtraLottery = async () => {
  try {
    const response = await axios.get('https://test-lotto-scraper.wnimqo.easypanel.host/api/lottery/lao-extra/latest');
    const { data } = response.data;

    const lotteryData = {
      name: data.name,
      url: data.url,
      lotto_date: data.lotto_date,
      start_spin: new Date(data.start_spin),
      show_result: new Date(data.show_result),
      results: {
        number1: data.results.digit5,
        number2: data.results.digit4,
        number3: data.results.digit3,
        number4: data.results.digit2_top,
        number5: data.results.digit2_bottom
      }
    };

    const lottery = new LotteryLaoExtra(lotteryData);
    await lottery.save();
    return lottery;
  } catch (error) {
    throw new Error(`Failed to fetch and save Lao Extra lottery: ${error.message}`);
  }
};

module.exports = {
  fetchAndSaveLaoExtraLottery
}; 