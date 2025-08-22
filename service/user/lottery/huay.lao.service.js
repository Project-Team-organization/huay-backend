const LotteryLao = require("../../../models/lotterylao.model");
const LotteryLaoExtra = require("../../../models/lotterylao.extra.model");
const LotteryLaoStars = require("../../../models/lotterylao.stars.model");
const LotteryLaoUnion = require("../../../models/lotterylao.union.model");
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

    // 📌 Lao lottery
    if (lottory_type === "lao-lottery") {
      const start = new Date(`${lotto_date}T00:00:00.000Z`);
      const end = new Date(`${lotto_date}T23:59:59.999Z`);

      const [lao, extra, stars, union] = await Promise.all([
        LotteryLao.find({ show_result: { $gte: start, $lte: end } })
          .sort({ createdAt: -1 })
          .select("-url -betting_types -__v")
          .lean(),
        LotteryLaoExtra.find({ lotto_date })
          .sort({ createdAt: -1 })
          .select("-url -betting_types -__v")
          .lean(),
        LotteryLaoStars.find({ lotto_date })
          .sort({ createdAt: -1 })
          .select("-url -betting_types -__v")
          .lean(),
        LotteryLaoUnion.find({ lotto_date })
          .sort({ createdAt: -1 })
          .select("-url -betting_types -__v")
          .lean(),
      ]);

      const data = [...lao, ...extra, ...stars, ...union];

      if (!data.length) {
        return {
          success: false,
          message: "ไม่พบข้อมูลตามวันที่และประเภทที่ระบุ",
          data: [],
        };
      }

      return {
        success: true,
        message: "ดึงข้อมูลสำเร็จ",
        data,
      };
    }

    // 📌 Thai lottery
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

      return {
        success: true,
        message: "ดึงข้อมูลสำเร็จ",
        data: Object.values(grouped),
      };
    }

    // 📌 Default
    return {
      success: false,
      message: "ไม่พบข้อมูลตามวันที่และประเภทที่ระบุ",
      data: [],
    };
  } catch (err) {
    console.error("Error in fetchLotteryByDateAndType:", err.message);
    throw err;
  }
};
