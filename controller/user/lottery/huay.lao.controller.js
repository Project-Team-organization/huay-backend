const huayLaoService = require("../../../service/user/lottery/huay.lao.service");

exports.getLotteryByDateAndType = async (req, res) => {
  try {
    const { lotto_date, lottory_type } = req.query;

    if (!lotto_date) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ lotto_date",
        data: null,
      });
    }

    const lotteries = await huayLaoService.fetchLotteryByDateAndType(
      lotto_date,
      lottory_type
    );

    if (!lotteries.length) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูลตามวันที่และประเภทที่ระบุ",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูลสำเร็จ",
      data: lotteries,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to retrieve lottery items.",
      error: error.message,
    });
  }
};
