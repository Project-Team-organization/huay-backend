const hentoryCallbackService = require("../../service/hentory/hentory.callback.service");
const HentoryLog = require("../../models/hentoryLog.model");

const handleControllerError = async (req, res, endpointName, error) => {
  console.error(`❌ Controller ${endpointName} error:`, error.message);

  const responseData = {
    id: req.body?.id || "",
    statusCode: 10001,
    productId: req.body?.productId || "",
    timestampMillis: Date.now(),
    message: error.message,
  };

  try {
    await HentoryLog.create({
      endpoint: req.originalUrl || req.path || endpointName,
      headers: req.headers,
      body: req.body,
      rawBody: req.rawBody,
      response: responseData,
      error: `[Controller ${endpointName} Error] ${error.stack || error.message}`,
    });
  } catch (logErr) {
    console.error(`❌ Failed to save HentoryLog in ${endpointName}:`, logErr.message);
  }

  return res.status(200).json(responseData);
};

exports.getBalance = async (req, res) => {
  try {
    const result = await hentoryCallbackService.getBalance(req.body, req.headers, req.rawBody);
    return res.status(200).json(result);
  } catch (error) {
    return await handleControllerError(req, res, "getBalance", error);
  }
};

exports.placeBets = async (req, res) => {
  try {
    const result = await hentoryCallbackService.placeBets(req.body, req.headers, req.rawBody, req.path);
    return res.status(200).json(result);
  } catch (error) {
    return await handleControllerError(req, res, "placeBets", error);
  }
};

exports.settleBets = async (req, res) => {
  try {
    const result = await hentoryCallbackService.settleBets(req.body, req.headers, req.rawBody, req.path);
    return res.status(200).json(result);
  } catch (error) {
    return await handleControllerError(req, res, "settleBets", error);
  }
};

exports.cancelBets = async (req, res) => {
  try {
    const result = await hentoryCallbackService.cancelBets(req.body, req.headers, req.rawBody, req.path);
    return res.status(200).json(result);
  } catch (error) {
    return await handleControllerError(req, res, "cancelBets", error);
  }
};

exports.adjustBets = async (req, res) => {
  try {
    const result = await hentoryCallbackService.adjustBets(req.body, req.headers, req.rawBody, req.path);
    return res.status(200).json(result);
  } catch (error) {
    return await handleControllerError(req, res, "adjustBets", error);
  }
};

exports.rollbackBets = async (req, res) => {
  try {
    const result = await hentoryCallbackService.rollbackBets(req.body, req.headers, req.rawBody, req.path);
    return res.status(200).json(result);
  } catch (error) {
    return await handleControllerError(req, res, "rollbackBets", error);
  }
};

exports.winRewards = async (req, res) => {
  try {
    const result = await hentoryCallbackService.winRewards(req.body, req.headers, req.rawBody, req.path);
    return res.status(200).json(result);
  } catch (error) {
    return await handleControllerError(req, res, "winRewards", error);
  }
};

exports.placeTips = async (req, res) => {
  try {
    const result = await hentoryCallbackService.placeTips(req.body, req.headers, req.rawBody, req.path);
    return res.status(200).json(result);
  } catch (error) {
    return await handleControllerError(req, res, "placeTips", error);
  }
};

exports.cancelTips = async (req, res) => {
  try {
    const result = await hentoryCallbackService.cancelTips(req.body, req.headers, req.rawBody, req.path);
    return res.status(200).json(result);
  } catch (error) {
    return await handleControllerError(req, res, "cancelTips", error);
  }
};

exports.voidSettled = async (req, res) => {
  try {
    const result = await hentoryCallbackService.voidSettled(req.body, req.headers, req.rawBody, req.path);
    return res.status(200).json(result);
  } catch (error) {
    return await handleControllerError(req, res, "voidSettled", error);
  }
};

exports.adjustBalance = async (req, res) => {
  try {
    const result = await hentoryCallbackService.adjustBalance(req.body, req.headers, req.rawBody, req.path);
    return res.status(200).json(result);
  } catch (error) {
    return await handleControllerError(req, res, "adjustBalance", error);
  }
};
