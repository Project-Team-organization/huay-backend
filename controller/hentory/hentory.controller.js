const hentoryService = require("../../service/hentory/hentory.service");
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
    const { productId, date, startTime, endTime, nextId } = req.query;

    if (!productId) {
      const response = await handleError(null, "กรุณาระบุ productId", 400);
      return res.status(response.status).json(response);
    }

    const params = { productId };
    if (date) {
      params.date = date;
    } else if (startTime) {
      params.startTime = startTime;
      if (endTime) params.endTime = endTime;
    } else if (endTime) {
      params.endTime = endTime;
    } else {
      const tzOffset = 7 * 60 * 60 * 1000;
      const localDate = new Date(Date.now() + tzOffset);
      params.date = localDate.toISOString().split('T')[0];
    }
    if (nextId) params.nextId = nextId;

    const result = await hentoryService.getBetTransactions(params);
    const response = await handleSuccess(result, "ดึงข้อมูลรายการเดิมพันสำเร็จ");
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, "เกิดข้อผิดพลาดในการดึงรายการเดิมพัน");
    return res.status(response.status).json(response);
  }
};
