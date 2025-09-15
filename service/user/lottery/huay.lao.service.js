const LotteryLao = require("../../../models/lotterylao.model");
const LotteryLaoExtra = require("../../../models/lotterylao.extra.model");
const LotteryLaoStars = require("../../../models/lotterylao.stars.model");
const LotteryLaoStarsVip = require("../../../models/lottery_lao_stars_vip.model");
const LotteryLaoUnion = require("../../../models/lotterylao.union.model");
const LotteryLaoRedcross = require("../../../models/lottery_lao_redcross.model");
const LotteryLaoThakhek5d = require("../../../models/lottery_lao_thakhek_5d.model");
const LotteryLaoThakhekVip = require("../../../models/lottery_lao_thakhek_vip.model");
const LotteryLaoTv = require("../../../models/lottery_lao_tv.model");
const LotteryLaoVip = require("../../../models/lottery_lao_vip.model");
const LotteryLaoHd = require("../../../models/lottery_lao_hd.model");
const LotterySingapore4d = require("../../../models/lottery_singapore_4d.model");
const LotteryMagnum4d = require("../../../models/lottery_magnum_4d.model");
const LotteryGrandDragon4d = require("../../../models/lottery_grand_dragon_4d.model");
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

      const [
        lao,
        extra,
        stars,
        starsVip,
        union,
        redcross,
        thakhek5d,
        thakhekVip,
        tv,
        vip,
        hd,
        singapore4d,
        magnum4d,
        grandDragon4d,
      ] = await Promise.all([
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
        LotteryLaoStarsVip.find({ lotto_date })
          .sort({ createdAt: -1 })
          .select("-url -betting_types -__v")
          .lean(),
        LotteryLaoUnion.find({ lotto_date })
          .sort({ createdAt: -1 })
          .select("-url -betting_types -__v")
          .lean(),
        LotteryLaoRedcross.find({ lotto_date })
          .sort({ createdAt: -1 })
          .select("-url -betting_types -__v -scraper -scrapedAt")
          .lean(),
        LotteryLaoThakhek5d.find({ lotto_date })
          .sort({ createdAt: -1 })
          .select("-url -betting_types -__v -scraper -scrapedAt")
          .lean(),
        LotteryLaoThakhekVip.find({ lotto_date })
          .sort({ createdAt: -1 })
          .select("-url -betting_types -__v -scraper -scrapedAt")
          .lean(),
        LotteryLaoTv.find({ lotto_date })
          .sort({ createdAt: -1 })
          .select("-url -betting_types -__v -scraper -scrapedAt")
          .lean(),
        LotteryLaoVip.find({ lotto_date })
          .sort({ createdAt: -1 })
          .select("-url -betting_types -__v -scraper -scrapedAt")
          .lean(),
        LotteryLaoHd.find({ lotto_date })
          .sort({ createdAt: -1 })
          .select("-url -betting_types -__v -scraper -scrapedAt")
          .lean(),
        LotterySingapore4d.find({ lotto_date })
          .sort({ createdAt: -1 })
          .select("-url -betting_types -__v -scraper -scrapedAt")
          .lean(),
        LotteryMagnum4d.find({ lotto_date })
          .sort({ createdAt: -1 })
          .select("-url -betting_types -__v -scraper -scrapedAt")
          .lean(),
        LotteryGrandDragon4d.find({ lotto_date })
          .sort({ createdAt: -1 })
          .select("-url -betting_types -__v -scraper -scrapedAt")
          .lean(),
      ]);

      const data = [
        ...lao,
        ...extra,
        ...stars,
        ...starsVip,
        ...union,
        ...redcross,
        ...thakhek5d,
        ...thakhekVip,
        ...tv,
        ...vip,
        ...hd,
        ...singapore4d,
        ...magnum4d,
        ...grandDragon4d,
      ];

      if (!data.length) {
        return [];
      }

      return data;
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

      return Object.values(grouped);
    }

    // 📌 Default
    return [];
  } catch (err) {
    console.error("Error in fetchLotteryByDateAndType:", err.message);
    throw err;
  }
};
