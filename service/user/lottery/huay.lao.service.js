const LotteryLao = require("../../../models/lotterylao.model");
const LotteryLaoExtra = require("../../../models/lotterylao.extra.model");
const LotteryLaoStars = require("../../../models/lotterylao.stars.model");
const Huay = require("../../../models/huay.model");

const isValidDateString = (dateStr) => /^\d{4}-\d{2}-\d{2}$/.test(dateStr);

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
        LotteryLao.findOne({ lotto_date }).sort({ createdAt: -1 }).lean(),
        LotteryLaoExtra.findOne({ lotto_date }).sort({ createdAt: -1 }).lean(),
        LotteryLaoStars.findOne({ lotto_date }).sort({ createdAt: -1 }).lean(),
      ]);

      return [
        format(lao, "lao"),
        format(extra, "lao-extra"),
        format(stars, "lao-stars"),
      ].filter(Boolean);
    }

    if (lottory_type === "thai-lottery") {
      // ค้นจาก Huay ด้วยช่วงเวลาของวันนั้น (ตาม createdAt)
      const start = new Date(lotto_date);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      const huay = await Huay.findOne({
        createdAt: { $gte: start, $lt: end },
      })
        .sort({ createdAt: -1 })
        .lean();

      return huay ? [format(huay, "thai-lottery")] : [];
    }

    // ถ้า type ไม่ตรงที่เรารองรับ
    return [];
  } catch (err) {
    console.error("Error in fetchLotteryByDateAndType:", err.message);
    throw err;
  }
};
