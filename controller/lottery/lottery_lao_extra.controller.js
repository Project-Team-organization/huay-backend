const { fetchAndSaveLaoExtraLottery } = require('../../service/lottery/lottery_lao_extra.service');
const { responseHandler } = require('../../utils/responseHandler');

const fetchLatestLaoExtraLottery = async (req, res) => {
  try {
    const lottery = await fetchAndSaveLaoExtraLottery();
    return responseHandler.success(res, lottery);
  } catch (error) {
    return responseHandler.error(res, error.message);
  }
};

module.exports = {
  fetchLatestLaoExtraLottery
}; 