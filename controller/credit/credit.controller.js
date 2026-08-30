const creditService = require("../../service/credit/credit.service");
const { handleSuccess, handleError } = require("../../utils/responseHandler");
const {
  optionalFileUpload,
  requiredFileUpload,
} = require("../../middleware/upload.middleware");

exports.createCredit = [
  optionalFileUpload("slip_image"),
  async function (req, res) {
    try {
      const {
        user_id,
        amount,
        channel,
        description,
        addcredit_admin_id,
        addcredit_admin_name,
        addcredit_admin_role,
      } = req.body;

      // ตรวจสอบว่าเป็น admin เติมเงิน หรือ user ฝาก
      const isAdminTopup =
        addcredit_admin_id && addcredit_admin_name && addcredit_admin_role;

      // ถ้าไม่ใช่ admin เติมเงิน (เป็น user ฝาก) ต้องมีรูป
      if (!isAdminTopup && !req.file) {
        const response = await handleError(
          null,
          "กรุณาแนบสลิปการโอนเงิน (User ฝากเงินต้องแนบสลิป)",
          400,
        );
        return res.status(response.status).json(response);
      }

      const credit = await creditService.createCredit({
        user_id,
        amount,
        channel,
        description,
        slip_image: req.file ? req.file.path : null,
        slip_image_original_name: req.file ? req.file.originalname : null,
        addcredit_admin_id,
        addcredit_admin_name,
        addcredit_admin_role,
      });
      if (!credit) {
        const response = await handleError(
          null,
          "Failed to create credit",
          400,
        );
        return res.status(response.status).json(response);
      }

      // ตรวจสอบว่าเป็น admin เติมเงิน (success) หรือ user ฝาก (pending)
      const message =
        credit.status === "success"
          ? "เติมเงินสำเร็จ"
          : "สร้างคำขอเติมเงินสำเร็จ รอการอนุมัติ";

      const response = await handleSuccess(credit, message);
      return res.status(response.status).json(response);
    } catch (error) {
      const response = await handleError(error);
      return res.status(response.status).json(response);
    }
  },
];

exports.createCreditUser = [
  requiredFileUpload("slip_image"),
  async function (req, res) {
    try {
      const { amount, channel, description } = req.body;
      const user_id = req.user._id;

      // ไฟล์ถูกตรวจสอบแล้วโดย requiredFileUpload middleware
      const credit = await creditService.createCredit({
        user_id,
        amount,
        channel,
        description,
        slip_image: req.file.path,
        slip_image_original_name: req.file.originalname,
      });
      if (!credit) {
        const response = await handleError(
          null,
          "Failed to create credit",
          400,
        );
        return res.status(response.status).json(response);
      }
      const response = await handleSuccess(
        credit,
        "สร้างคำขอเติมเงินสำเร็จ รอการอนุมัติ",
      );
      return res.status(response.status).json(response);
    } catch (error) {
      const response = await handleError(error);
      return res.status(response.status).json(response);
    }
  },
];

exports.getCreditsByID = async function (req, res) {
  try {
    const { id } = req.params;
    const credits = await creditService.getCreditById(id);
    const response = await handleSuccess(
      credits,
      "Get credits by user successful",
    );
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, "Failed to get credits by user");
    return res.status(response.status).json(response);
  }
};

exports.getAllCredits = async function (req, res) {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query || {};

    const result = await creditService.getAllCredits({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      startDate,
      endDate,
    });

    const response = await handleSuccess(
      result.data,
      "Get all credits successful",
      200,
      result.pagination,
    );
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, "Failed to get all credits");
    return res.status(response.status).json(response);
  }
};
// ของ admin
exports.getCreditsByUserId = async function (req, res) {
  try {
    const { user_id } = req.params;
    const { page = 1, limit = 10, status } = req.query || {};

    const result = await creditService.getCreditsByUserId(user_id, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      status,
    });

    const response = await handleSuccess(
      result.data,
      "Get credits by user ID successful",
      200,
      result.pagination,
    );
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(
      error,
      "Failed to get credits by user ID",
    );
    return res.status(response.status).json(response);
  }
};
// ของ user
exports.getCreditsBytoken = async function (req, res) {
  try {
    const user_id = req.user._id;
    const { page = 1, limit = 10, status } = req.query || {};

    const result = await creditService.getCreditsByUserId(user_id, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      status,
    });

    const response = await handleSuccess(
      result.data,
      "Get credits by user ID successful",
      200,
      result.pagination,
    );
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(
      error,
      "Failed to get credits by user ID",
    );
    return res.status(response.status).json(response);
  }
};

exports.updateCredit = async function (req, res) {
  try {
    const { id } = req.params;
    const { amount, channel, description } = req.body;
    const credit = await creditService.updateCredit({
      id,
      amount,
      channel,
      description,
    });
    if (!credit.success) {
      return res.status(credit.status).json(credit);
    }
    return res.status(credit.status).json(credit);
  } catch (error) {
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

exports.approveCredit = async function (req, res) {
  try {
    const { id } = req.params;
    const credit = await creditService.approveCredit({ id });

    const response = await handleSuccess(credit, "อนุมัติการฝากเงินสำเร็จ");
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

exports.cancelCredit = async function (req, res) {
  try {
    const { id } = req.params;
    const credit = await creditService.cancelCredit({ id });

    const response = await handleSuccess(credit, "ยกเลิกการฝากเงินสำเร็จ");
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

exports.deleteCredit = async function (req, res) {
  try {
    const { id } = req.params;
    const result = await creditService.deleteCredit({ id });

    const response = await handleSuccess(
      result,
      result.message || "ลบข้อมูล credit สำเร็จ",
    );
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

// ยังไม่ใช้
exports.getCreditStats = async function (req, res) {
  try {
    const { id } = req.params;
    const stats = await creditService.getCreditStatsByUserId(id);

    const response = await handleSuccess(
      stats,
      "Credit stats fetched successfully",
    );

    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, "Failed to fetch credit stats");
    return res.status(response.status).json(response);
  }
};

exports.getTopupDays = async function (req, res) {
  try {
    const { user_id, promotion_id } = req.query;

    if (!user_id || !promotion_id) {
      const response = await handleError(
        null,
        "user_id and promotion_id are required",
        400,
      );
      return res.status(response.status).json(response);
    }

    const uniqueDaysCount = await creditService.getUniqueTopupDays(
      user_id,
      promotion_id,
    );

    const response = await handleSuccess(
      { uniqueDaysCount },
      "Unique topup days fetched successfully",
    );
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

// ดึง transaction ของ user (สำหรับ admin)
exports.getUserTransactions = async function (req, res) {
  try {
    const { user_id } = req.params;
    const { page = 1, limit = 10, type, startDate, endDate } = req.query || {};

    const result = await creditService.getUserTransactions(user_id, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      type,
      startDate,
      endDate,
    });

    const response = await handleSuccess(
      result.data,
      "Get user transactions successful",
      200,
      {
        ...result.pagination,
        summary: result.summary,
      },
    );
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(
      error,
      "Failed to get user transactions",
    );
    return res.status(response.status).json(response);
  }
};

// ดึง transaction ของตัวเอง (สำหรับ user)
exports.getMyTransactions = async function (req, res) {
  try {
    const user_id = req.user._id;
    const { page = 1, limit = 10, type, startDate, endDate } = req.query || {};

    const result = await creditService.getUserTransactions(user_id, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      type,
      startDate,
      endDate,
    });

    const response = await handleSuccess(
      result.data,
      "Get my transactions successful",
      200,
      {
        ...result.pagination,
        summary: result.summary,
      },
    );
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, "Failed to get transactions");
    return res.status(response.status).json(response);
  }
};

//

// ดูรูปสลิป
exports.getCreditSlip = async function (req, res) {
  try {
    const { id } = req.params;
    const credit = await creditService.getCreditById(id);

    if (!credit) {
      const response = await handleError(null, "ไม่พบข้อมูล credit", 404);
      return res.status(response.status).json(response);
    }

    if (!credit.slip_image) {
      const response = await handleError(null, "ไม่พบรูปสลิป", 404);
      return res.status(response.status).json(response);
    }

    const response = await handleSuccess(
      {
        slip_image_url: `/${credit.slip_image}`,
        original_name: credit.slip_image_original_name,
      },
      "ดึงข้อมูลรูปสลิปสำเร็จ",
    );

    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

// สรุปยอดภาพรวม เติมเงิน - ถอนเงิน
exports.getFinancialSummary = async function (req, res) {
  try {
    const Credit = require("../../models/credit.models");
    const Withdrawal = require("../../models/withdrawal.models");

    const { period = "month", month } = req.query; // 'month' (default), 'today', 'all', or specific month e.g. '2026-08'

    let dateMatch = {};
    const now = new Date();

    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const [year, m] = month.split("-").map(Number);
      const startOfMonth = new Date(year, m - 1, 1, 0, 0, 0, 0);
      const endOfMonth = new Date(year, m, 0, 23, 59, 59, 999);
      dateMatch = { created_at: { $gte: startOfMonth, $lte: endOfMonth } };
    } else if (period === "today") {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      dateMatch = { created_at: { $gte: startOfDay, $lte: endOfDay } };
    } else if (period === "month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      dateMatch = { created_at: { $gte: startOfMonth, $lte: endOfMonth } };
    }
    // period === 'all' -> dateMatch remains {}

    const depositMatch = { status: "success", ...dateMatch };
    const withdrawalMatch = { status: { $in: ["completed", "approved"] }, ...dateMatch };

    const depositAgg = await Credit.aggregate([
      { $match: depositMatch },
      { $group: { _id: null, totalAmount: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]);

    const withdrawalAgg = await Withdrawal.aggregate([
      { $match: withdrawalMatch },
      { $group: { _id: null, totalAmount: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]);

    const totalDeposit = depositAgg.length > 0 ? depositAgg[0].totalAmount : 0;
    const totalDepositCount = depositAgg.length > 0 ? depositAgg[0].count : 0;

    const totalWithdrawal = withdrawalAgg.length > 0 ? withdrawalAgg[0].totalAmount : 0;
    const totalWithdrawalCount = withdrawalAgg.length > 0 ? withdrawalAgg[0].count : 0;

    const netAmount = totalDeposit - totalWithdrawal;

    const data = {
      period: month || period,
      total_deposit: totalDeposit,
      total_deposit_count: totalDepositCount,
      total_withdrawal: totalWithdrawal,
      total_withdrawal_count: totalWithdrawalCount,
      net_amount: netAmount,
    };

    const response = await handleSuccess(data, "ดึงข้อมูลสรุปการเงินสำเร็จ");
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, "เกิดข้อผิดพลาดในการดึงข้อมูลสรุปการเงิน");
    return res.status(response.status).json(response);
  }
};

