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
const LotteryHanoiAsean = require("../../../models/lottery_hanoi_asean.model");
const LotteryHanoiHd = require("../../../models/lottery_hanoi_hd.model");
const LotteryHanoiStar = require("../../../models/lottery_hanoi_star.model");
const LotteryHanoiTv = require("../../../models/lottery_hanoi_tv.model");
const LotteryHanoiSpecial = require("../../../models/lottery_hanoi_special.model");
const LotteryHanoiRedcross = require("../../../models/lottery_hanoi_redcross.model");
const LotteryHanoiSpecialApi = require("../../../models/lottery_hanoi_special_api.model");
const LotteryHanoi = require("../../../models/lottery_hanoi.model");
const LotteryHanoiDevelop = require("../../../models/lottery_hanoi_develop.model");
const LotteryHanoiVip = require("../../../models/lottery_hanoi_vip.model");
const LotteryHanoiExtra = require("../../../models/lottery_hanoi_extra.model");
const LotteryThaiGsb = require("../../../models/lottery_thai_gsb.model");
const LotteryThaiSavings = require("../../../models/lottery_thai_savings.model");
const Huay = require("../../../models/huay.model");



const LotteryResult = require("../../../models/lottery_results.model");
const LotteryResultItem = require("../../../models/lottery_result_items.model");
const LotterySets = require("../../../models/lotterySets.model");
const LotteryType = require("../../../models/lotteryType.model");

const isValidYYYYMMDD = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);

exports.fetchLotteryByDateAndType = async (startDate, endDate, lottory_type, page = 1, limit = 10) => {
  try {
    if (!startDate || !endDate || !lottory_type) {
      throw new Error('ต้องส่ง "startDate", "endDate" และ "lottory_type"');
    }
    if (!isValidYYYYMMDD(startDate) || !isValidYYYYMMDD(endDate)) {
      throw new Error('รูปแบบวันที่ต้องเป็น YYYY-MM-DD');
    }

    // 1. หาประเภทหวยที่สัมพันธ์กับ lottory_type
    let queryConditions = {};
    if (lottory_type === "lao-lottery") {
      queryConditions = { lottery_type: /ลาว/ };
    } else if (lottory_type === "thai-lottery") {
      queryConditions = { lottery_type: /ไทย|รัฐบาล|ออมสิน|ธกส/ };
    } else if (lottory_type === "hanoi-lottery") {
      queryConditions = { lottery_type: /ฮานอย/ };
    }

    const matchedTypes = await LotteryType.find(queryConditions).select("_id");
    const matchedTypeIds = matchedTypes.map(t => t._id);

    // 2. หางวดหวยที่สัมพันธ์กับประเภทหวย
    const matchedSets = await LotterySets.find({ lottery_type_id: { $in: matchedTypeIds } }).select("_id");
    const matchedSetIds = matchedSets.map(s => s._id);

    // 3. ค้นหาผลรางวัลในช่วงวันที่
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);

    const query = {
      lottery_set_id: { $in: matchedSetIds },
      draw_date: { $gte: start, $lte: end }
    };

    const total = await LotteryResult.countDocuments(query);
    const results = await LotteryResult.find(query)
      .sort({ draw_date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("lottery_set_id")
      .lean();

    // 4. ดึงผลรางวัลย่อย และแปลงรูปแบบให้อยู่ในโครงสร้างที่หน้าบ้านใช้งานได้
    const formattedResults = [];
    for (const res of results) {
      const items = await LotteryResultItem.find({ lottery_result_id: res._id }).lean();
      
      const findNumber = (candidates) => {
        const match = items.find(it => candidates.includes(it.betting_type_id));
        return match && match.numbers && match.numbers.length > 0 ? match.numbers[0] : "-";
      };

      const findNumberArray = (candidates) => {
        const match = items.find(it => candidates.includes(it.betting_type_id));
        return match && match.numbers ? match.numbers : [];
      };

      const formatted = {
        _id: res._id,
        lottery_set_id: res.lottery_set_id ? res.lottery_set_id._id : null,
        lottery_name: res.lottery_set_id ? res.lottery_set_id.name : "หวย",
        lotto_date: res.draw_date ? new Date(res.draw_date).toISOString().split("T")[0] : startDate,
        show_result: res.draw_date,
        createdAt: res.createdAt,
        items: items,
        results: {
          digit5: findNumber(["5d", "5d_top", "5digit"]),
          digit4: findNumber(["4d", "4d_top", "4digit"]),
          digit3: findNumber(["3d", "3top", "3d_top", "digit3"]),
          digit2_top: findNumber(["2d_top", "2top", "digit2_top"]),
          digit2_bottom: findNumber(["2d_bottom", "2bottom", "digit2_bottom"]),
          // สำหรับฮานอย
          prize_1st: findNumber(["5d", "5d_top", "5digit"]),
          digit3_top: findNumber(["3d", "3top", "3d_top", "digit3"]),
        },
        numbers: {
          "6d_top": findNumberArray(["6d_top", "6top"]),
          "3d_front_2": findNumberArray(["3d_front_2", "3d_front"]),
          "3d_bottom": findNumberArray(["3d_bottom", "3bottom"]),
          "2d_bottom": findNumberArray(["2d_bottom", "2bottom"]),
          "3top": findNumberArray(["3top"]),
          "2top": findNumberArray(["2top"]),
          "2bottom": findNumberArray(["2bottom"])
        }
      };
      formattedResults.push(formatted);
    }

    return {
      results: formattedResults,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (err) {
    console.error("Error in fetchLotteryByDateAndType:", err.message);
    throw err;
  }
};
