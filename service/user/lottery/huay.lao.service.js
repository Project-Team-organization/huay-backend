const LotteryLao = require("../../../models/lotterylao.model");
const LotteryLaoExtra = require("../../../models/lotterylao.extra.model");
const LotteryLaoStars = require("../../../models/lotterylao.stars.model");
const Huay = require("../../../models/huay.model");

const isValidYYYYMMDD = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);

exports.fetchLotteryByDateAndType = async (lotto_date, lottory_type) => {
  try {
    if (!lotto_date || !lottory_type) {
      throw new Error('ต้องส่ง "lotto_date" และ "lottory_type"');
    }
    if (!isValidYYYYMMDD(lotto_date)) {
      throw new Error('Invalid "lotto_date": ต้องอยู่ในรูปแบบ YYYY-MM-DD');
    }

    const format = (doc, name) => (doc ? { ...doc, name } : null);

    if (lottory_type === "lao-lottery") {
      const [lao, extra, stars] = await Promise.all([
        LotteryLao.findOne({ lotto_date })
          .sort({ createdAt: -1 })
          .select("-url")
          .lean(),
        LotteryLaoExtra.findOne({ lotto_date })
          .sort({ createdAt: -1 })
          .select("-url")
          .lean(),
        LotteryLaoStars.findOne({ lotto_date })
          .sort({ createdAt: -1 })
          .select("-url")
          .lean(),
      ]);

      return [
        format(lao, "lao"),
        format(extra, "lao-extra"),
        format(stars, "lao-stars"),
      ].filter(Boolean);
    }

    if (lottory_type === "thai-lottery") {
      const start = new Date(`${lotto_date}T00:00:00.000Z`);
      const end = new Date(`${lotto_date}T23:59:59.999Z`);

      const codesToShow = ["6d_top", "3d_front_2", "3d_bottom", "2d_bottom"];

      const huayList = await Huay.find({
        createdAt: { $gte: start, $lte: end },
        code: { $in: codesToShow },
      })
        .sort({ createdAt: -1 })
        .lean();

      const grouped = huayList.reduce((acc, doc) => {
        const setId = doc.lottery_set_id.toString();
        if (!acc[setId]) {
          acc[setId] = {
            lottery_set_id: setId,
            name: "thai-lottery",
            numbers: {},
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
          };
        }
        acc[setId].numbers[doc.code] = doc.huay_number;
        return acc;
      }, {});

      return Object.values(grouped);
    }

    return [];
  } catch (err) {
    console.error("Error in fetchLotteryByDateAndType:", err.message);
    throw err;
  }
};
