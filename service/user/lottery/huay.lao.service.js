const LotteryLao = require("../../../models/lotterylao.model");
const LotteryLaoExtra = require("../../../models/lotterylao.extra.model");
const LotteryLaoStars = require("../../../models/lotterylao.stars.model");

const isValidDateString = (dateStr) => /^\d{4}-\d{2}-\d{2}$/.test(dateStr);

exports.fetchLotteryByDateAndType = async (lotto_date, lottory_type) => {
  console.log(
    "Fetching lottery by date:",
    lotto_date,
    "and type:",
    lottory_type
  );
  try {
    if (!isValidDateString(lotto_date)) {
      throw new Error('Invalid "lotto_date": ต้องอยู่ในรูปแบบ YYYY-MM-DD');
    }

    const formatData = (doc) => {
      if (!doc) return null;
      const { url, ...rest } = doc;
      return {
        ...rest,
        name: "lao-lottery",
      };
    };

    // ดึงจากทุกตาราง ถ้า type เป็น lao-lottery หรือไม่ได้ส่ง
    if (lottory_type === "lao-lottery" || !lottory_type) {
      const [lao, extra, stars] = await Promise.all([
        LotteryLao.findOne({ lotto_date }).sort({ createdAt: -1 }).lean(),
        LotteryLaoExtra.findOne({ lotto_date }).sort({ createdAt: -1 }).lean(),
        LotteryLaoStars.findOne({ lotto_date }).sort({ createdAt: -1 }).lean(),
      ]);

      const results = [];
      if (lao) results.push(formatData(lao));
      if (extra) results.push(formatData(extra));
      if (stars) results.push(formatData(stars));

      return results;
    }

    // ดึงเฉพาะประเภทเดียว
    let Model = null;
    if (lottory_type === "lao") Model = LotteryLao;
    else if (lottory_type === "lao-extra") Model = LotteryLaoExtra;
    else if (lottory_type === "lao-stars") Model = LotteryLaoStars;

    if (!Model) return [];

    const doc = await Model.findOne({ lotto_date })
      .sort({ createdAt: -1 })
      .lean();

    return doc ? [formatData(doc)] : [];
  } catch (err) {
    console.error("Error in fetchLotteryByDateAndType:", err.message);
    throw err;
  }
};
