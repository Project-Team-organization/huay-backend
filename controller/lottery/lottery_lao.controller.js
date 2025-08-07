const { fetchAndSaveLaoLottery } = require('../../service/lottery/lottery_lao.service');
const { responseHandler } = require('../../utils/responseHandler');

const fetchLatestLaoLottery = async (req, res) => {
  try {
    const lottery = await fetchAndSaveLaoLottery();
    return responseHandler.success(res, lottery);
  } catch (error) {
    return responseHandler.error(res, error.message);
  }
};

module.exports = {
  fetchLatestLaoLottery
}; 