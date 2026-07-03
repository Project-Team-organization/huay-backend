const hentoryCallbackService = require("../../service/hentory/hentory.callback.service");

exports.getBalance = async (req, res) => {
  try {
    const result = await hentoryCallbackService.getBalance(req.body, req.headers, req.rawBody);
    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Controller getBalance error:", error.message);
    return res.status(200).json({ statusCode: 10001, message: error.message });
  }
};

exports.placeBets = async (req, res) => {
  try {
    const result = await hentoryCallbackService.placeBets(req.body, req.headers, req.rawBody, req.path);
    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Controller placeBets error:", error.message);
    return res.status(200).json({ statusCode: 10001, message: error.message });
  }
};

exports.settleBets = async (req, res) => {
  try {
    const result = await hentoryCallbackService.settleBets(req.body, req.headers, req.rawBody, req.path);
    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Controller settleBets error:", error.message);
    return res.status(200).json({ statusCode: 10001, message: error.message });
  }
};

exports.cancelBets = async (req, res) => {
  try {
    const result = await hentoryCallbackService.cancelBets(req.body, req.headers, req.rawBody, req.path);
    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Controller cancelBets error:", error.message);
    return res.status(200).json({ statusCode: 10001, message: error.message });
  }
};

exports.adjustBets = async (req, res) => {
  try {
    const result = await hentoryCallbackService.adjustBets(req.body, req.headers, req.rawBody, req.path);
    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Controller adjustBets error:", error.message);
    return res.status(200).json({ statusCode: 10001, message: error.message });
  }
};

exports.rollbackBets = async (req, res) => {
  try {
    const result = await hentoryCallbackService.rollbackBets(req.body, req.headers, req.rawBody, req.path);
    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Controller rollbackBets error:", error.message);
    return res.status(200).json({ statusCode: 10001, message: error.message });
  }
};

exports.winRewards = async (req, res) => {
  try {
    const result = await hentoryCallbackService.winRewards(req.body, req.headers, req.rawBody, req.path);
    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Controller winRewards error:", error.message);
    return res.status(200).json({ statusCode: 10001, message: error.message });
  }
};

exports.placeTips = async (req, res) => {
  try {
    const result = await hentoryCallbackService.placeTips(req.body, req.headers, req.rawBody, req.path);
    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Controller placeTips error:", error.message);
    return res.status(200).json({ statusCode: 10001, message: error.message });
  }
};

exports.cancelTips = async (req, res) => {
  try {
    const result = await hentoryCallbackService.cancelTips(req.body, req.headers, req.rawBody, req.path);
    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Controller cancelTips error:", error.message);
    return res.status(200).json({ statusCode: 10001, message: error.message });
  }
};

exports.voidSettled = async (req, res) => {
  try {
    const result = await hentoryCallbackService.voidSettled(req.body, req.headers, req.rawBody, req.path);
    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Controller voidSettled error:", error.message);
    return res.status(200).json({ statusCode: 10001, message: error.message });
  }
};

exports.adjustBalance = async (req, res) => {
  try {
    const result = await hentoryCallbackService.adjustBalance(req.body, req.headers, req.rawBody, req.path);
    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Controller adjustBalance error:", error.message);
    return res.status(200).json({ statusCode: 10001, message: error.message });
  }
};
