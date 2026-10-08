const huayLaoService = require("../../../service/user/lottery/huay.lao.service");

exports.getLotteryByDateAndType = async (req, res) => {
  try {
    const { lotto_date, startDate, endDate, lottory_type, page, limit } = req.query;

    const parsedStartDate = startDate || lotto_date;
    const parsedEndDate = endDate || lotto_date;

    if (!parsedStartDate) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ lotto_date หรือ startDate",
        data: null,
      });
    }

    const { results, pagination } = await huayLaoService.fetchLotteryByDateAndType(
      parsedStartDate,
      parsedEndDate,
      lottory_type,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10
    );

    if (!results || results.length === 0) {
      return res.status(200).json({
        success: true,
        message: "ไม่พบข้อมูลตามวันที่และประเภทที่ระบุ",
        data: [],
        pagination,
      });
    }
    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูลสำเร็จ",
      data: results,
      pagination,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to retrieve lottery items.",
      error: error.message,
    });
  }
};
