const LotteryLao = require("../../../models/lotterylao.model");
const LotteryLaoExtra = require("../../../models/lotterylao.extra.model");
const LotteryLaoStars = require("../../../models/lotterylao.stars.model");

const isValidDateString = (dateStr) => /^\d{4}-\d{2}-\d{2}$/.test(dateStr);

exports.fetchLotteryByDateAndType = async (lotto_date, lottory_type) => {
  try {
    if (!isValidDateString(lotto_date)) {
      throw new Error('Invalid "lotto_date": ต้องอยู่ในรูปแบบ YYYY-MM-DD');
    }

    // ถ้ามีการระบุประเภท
    if (lottory_type) {
      let Model;
      let kind = '';

      if (lottory_type === 'lao') {
        Model = LotteryLao;
        kind = 'lao';
      } else if (lottory_type === 'lao-extra') {
        Model = LotteryLaoExtra;
        kind = 'lao-extra';
      } else if (lottory_type === 'lao-stars') {
        Model = LotteryLaoStars;
        kind = 'lao-stars';
      } else {
        throw new Error('Unknown "lottory_type": ไม่รู้จักประเภทหวยที่ระบุ');
      }

      const doc = await Model.findOne({ lotto_date })
        .sort({ createdAt: -1 })
        .lean();

      return doc ? [{ kind, ...doc }] : [];
    }

    // ถ้าไม่ระบุประเภท → ดึงทุกประเภท
    const [lao, extra, stars] = await Promise.all([
      LotteryLao.findOne({ lotto_date }).sort({ createdAt: -1 }).lean(),
      LotteryLaoExtra.findOne({ lotto_date }).sort({ createdAt: -1 }).lean(),
      LotteryLaoStars.findOne({ lotto_date }).sort({ createdAt: -1 }).lean(),
    ]);

    const results = [];
    if (lao) results.push({ kind: 'lao', ...lao });
    if (extra) results.push({ kind: 'lao-extra', ...extra });
    if (stars) results.push({ kind: 'lao-stars', ...stars });

    return results;
  } catch (err) {
    console.error('Error in fetchLotteryByDateAndType:', err.message);
    throw err;
  }
};
