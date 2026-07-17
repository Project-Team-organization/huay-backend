const hentoryService = require("../../service/hentory/hentory.service");
const UserTransaction = require("../../models/user.transection.model");
const { handleSuccess, handleError } = require("../../utils/responseHandler");
const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");

const loginGameSchema = Joi.object({
  username: Joi.string().required().messages({
    "string.empty": "กรุณาระบุ username",
    "any.required": "กรุณาระบุ username",
  }),
  productId: Joi.string().required().messages({
    "string.empty": "กรุณาระบุ productId",
    "any.required": "กรุณาระบุ productId",
  }),
  gameCode: Joi.string().required().messages({
    "string.empty": "กรุณาระบุ gameCode",
    "any.required": "กรุณาระบุ gameCode",
  }),
  isMobileLogin: Joi.boolean().required().messages({
    "any.required": "กรุณาระบุ isMobileLogin",
  }),
  limit: Joi.number().optional(),
  currency: Joi.string().optional(),
  language: Joi.string().max(5).optional(),
  callbackUrl: Joi.string().uri().optional(),
  betLimit: Joi.array().items(Joi.object()).optional(),
  sessionToken: Joi.string().optional(),
});

exports.getProducts = async (req, res) => {
  try {
    const products = await hentoryService.getProducts();
    const response = await handleSuccess(products, "ดึงรายการ products สำเร็จ");
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, "เกิดข้อผิดพลาดในการดึง products");
    return res.status(response.status).json(response);
  }
};

exports.getGames = async (req, res) => {
  try {
    const { productId } = req.query;

    if (!productId) {
      const response = await handleError(null, "กรุณาระบุ productId", 400);
      return res.status(response.status).json(response);
    }

    const games = await hentoryService.getGames(productId);
    const response = await handleSuccess(games, "ดึงรายการ games สำเร็จ");
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, "เกิดข้อผิดพลาดในการดึง games");
    return res.status(response.status).json(response);
  }
};

exports.loginGame = async (req, res) => {
  try {
    const { error, value } = loginGameSchema.validate(req.body, { abortEarly: false });

    if (error) {
      const messages = error.details.map((d) => d.message).join(", ");
      const response = await handleError(null, messages, 400);
      return res.status(response.status).json(response);
    }

    const { username, productId, gameCode, isMobileLogin, currency, language, callbackUrl, sessionToken } = value;

    let selectedLimit = 1;
    try {
      const limitsResponse = await hentoryService.getBetLimitsV2(productId);
      if (
        limitsResponse &&
        limitsResponse.code === 0 &&
        Array.isArray(limitsResponse.data) &&
        limitsResponse.data.length > 0 &&
        limitsResponse.data[0] &&
        Array.isArray(limitsResponse.data[0].BetLimit) &&
        limitsResponse.data[0].BetLimit.length > 0
      ) {
        const betLimits = limitsResponse.data[0].BetLimit;
        let minLimitObj = betLimits[0];
        for (let i = 1; i < betLimits.length; i++) {
          if (betLimits[i].Min < minLimitObj.Min) {
            minLimitObj = betLimits[i];
          }
        }
        if (minLimitObj && minLimitObj.limit !== undefined) {
          selectedLimit = minLimitObj.limit;
        }
      }
    } catch (limitError) {
      console.error("⚠️ Failed to fetch bet limits from Hentory, falling back to limit 1:", limitError.message);
    }

    const finalSessionToken = sessionToken || uuidv4();

    const data = {
      username,
      productId,
      gameCode,
      isMobileLogin,
      sessionToken: finalSessionToken,
      limit: selectedLimit,
    };

    if (currency) data.currency = currency;
    if (language) data.language = language;
    if (callbackUrl) data.callbackUrl = callbackUrl;

    const result = await hentoryService.loginGame(data);
    const response = await handleSuccess(result, "เข้าสู่เกมสำเร็จ");
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, "เกิดข้อผิดพลาดในการเข้าสู่เกม");
    return res.status(response.status).json(response);
  }
};

exports.getBetTransactions = async (req, res) => {
  try {
    const { productId, date, startTime, endTime, nextId } = req.query;

    if (!productId) {
      const response = await handleError(null, "กรุณาระบุ productId", 400);
      return res.status(response.status).json(response);
    }

    if (!date && (!startTime || !endTime)) {
      const response = await handleError(null, "กรุณาระบุ date หรือ startTime และ endTime", 400);
      return res.status(response.status).json(response);
    }

    const params = { productId };
    if (date) params.date = date;
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;
    if (nextId) params.nextId = nextId;

    const result = await hentoryService.getBetTransactions(params);
    const response = await handleSuccess(result, "ดึงข้อมูล transactions สำเร็จ");
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, "เกิดข้อผิดพลาดในการดึง transactions");
    return res.status(response.status).json(response);
  }
};

exports.getAgentCredit = async (req, res) => {
  try {
    const result = await hentoryService.getAgentCredit();
    const response = await handleSuccess(result, "ดึงข้อมูลเครดิตเอเย่นต์สำเร็จ");
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, "เกิดข้อผิดพลาดในการดึงเครดิตเอเย่นต์");
    return res.status(response.status).json(response);
  }
};

exports.getBetTransactionsV2 = async (req, res) => {
  try {
    const { productId, date, startTime, endTime } = req.query;

    let query = { category: "game" };

    if (productId && productId !== "ALL") {
      query.provider_name = productId;
    }

    if (date) {
      const start = new Date(date + "T00:00:00.000Z");
      const end = new Date(date + "T23:59:59.999Z");
      query.created_at = { $gte: start, $lte: end };
    } else if (startTime || endTime) {
      query.created_at = {};
      if (startTime) query.created_at.$gte = new Date(startTime);
      if (endTime) query.created_at.$lte = new Date(endTime);
    } else {
      // Default to today
      const today = new Date().toISOString().split('T')[0];
      const start = new Date(today + "T00:00:00.000Z");
      const end = new Date(today + "T23:59:59.999Z");
      query.created_at = { $gte: start, $lte: end };
    }

    const txns = await UserTransaction.find(query)
      .populate("user_id", "username phone")
      .sort({ created_at: -1 })
      .lean();

    const grouped = {};
    for (const t of txns) {
      const bId = t.bet_id || t._id.toString();
      if (!grouped[bId]) {
        grouped[bId] = {
          id: bId,
          betId: bId,
          username: t.user_id?.username || t.user_id?.phone || "Unknown",
          currency: "THB",
          accountingDate: t.created_at || t.createdAt,
          updatedDate: t.created_at || t.createdAt,
          stake: 0,
          payout: 0,
          productId: t.provider_name || "GAME",
          gameCode: t.game_name || "",
          gameName: t.game_name || "",
          roundId: bId,
          betStatus: t.status || "LOSE",
          payoutStatus: t.status || "LOSE",
          commission: 0
        };
      }

      if (t.type === "bet") {
        grouped[bId].stake += t.amount || 0;
      } else if (t.type === "payout") {
        grouped[bId].payout += t.amount || 0;
      } else if (t.type === "refund") {
        grouped[bId].payout += t.amount || 0;
        grouped[bId].payoutStatus = "CANCEL";
        grouped[bId].betStatus = "CANCEL";
      }

      if (grouped[bId].payoutStatus !== "CANCEL") {
        if (grouped[bId].payout > 0) {
          grouped[bId].payoutStatus = "WIN";
          grouped[bId].betStatus = "WIN";
        } else if (t.status === "PENDING" || grouped[bId].betStatus === "PENDING") {
          grouped[bId].payoutStatus = "PENDING";
          grouped[bId].betStatus = "PENDING";
        } else {
          grouped[bId].payoutStatus = "LOSE";
          grouped[bId].betStatus = "LOSE";
        }
      }
    }

    const txnsList = Object.values(grouped);
    const response = await handleSuccess({ txns: txnsList }, "ดึงข้อมูลรายการเดิมพันสำเร็จ");
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, "เกิดข้อผิดพลาดในการดึงรายการเดิมพัน");
    return res.status(response.status).json(response);
  }
};
