const hentoryService = require("../../service/hentory/hentory.service");
const { handleSuccess, handleError } = require("../../utils/responseHandler");

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
