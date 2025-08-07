const axios = require('axios');
const LotteryLao = require('../../models/lotterylao.model');

const fetchAndSaveLaoLottery = async () => {
  try {
    const response = await axios.get('https://test-lotto-scraper.wnimqo.easypanel.host/api/lottery/lao-lottery/latest');
    const { data } = response.data;

    const lotteryData = {
      name: data.name,
      url: data.url,
      title: data.title,
      lotto_date: data.date,
      start_spin: new Date(),
      show_result: new Date(),
      results: {
        number1: data.numbers.development[0],
        number2: data.numbers.development[1],
        number3: data.numbers.development[2],
        number4: data.numbers.development[3],
        number5: data.numbers.development[4]
      }
    };

    const lottery = new LotteryLao(lotteryData);
    await lottery.save();
    return lottery;
  } catch (error) {
    throw new Error(`Failed to fetch and save Lao lottery: ${error.message}`);
  }
};

module.exports = {
  fetchAndSaveLaoLottery
}; 