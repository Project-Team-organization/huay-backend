const hentoryService = require("../../service/hentory/hentory.service");
const { handleSuccess, handleError } = require("../../utils/responseHandler");
const { v4: uuidv4 } = require("uuid");

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
    const { username, productId, gameCode, isMobileLogin, limit, currency, language, callbackUrl, betLimit } = req.body;

    if (!username || !productId || !gameCode || isMobileLogin === undefined) {
      const response = await handleError(null, "กรุณาระบุ username, productId, gameCode, isMobileLogin", 400);
      return res.status(response.status).json(response);
    }

    const sessionToken = uuidv4();

    const data = {
      username,
      productId,
      gameCode,
      isMobileLogin,
      sessionToken,
    };

    if (limit !== undefined) data.limit = limit;
    if (currency) data.currency = currency;
    if (language) data.language = language;
    if (callbackUrl) data.callbackUrl = callbackUrl;
    if (betLimit) data.betLimit = betLimit;

    const result = await hentoryService.loginGame(data);
    const response = await handleSuccess(result, "เข้าสู่เกมสำเร็จ");
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, "เกิดข้อผิดพลาดในการเข้าสู่เกม");
    return res.status(response.status).json(response);
  }
};
