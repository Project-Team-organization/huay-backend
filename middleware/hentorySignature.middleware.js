const crypto = require("crypto");
const HentoryLog = require("../models/hentoryLog.model");

const logSignatureError = async (req, statusCode, errorMsg, responseData) => {
  try {
    await HentoryLog.create({
      endpoint: req.originalUrl || req.path,
      headers: req.headers,
      body: req.body,
      rawBody: req.rawBody,
      response: responseData,
      error: `[Signature Middleware Error] ${errorMsg}`,
    });
  } catch (err) {
    console.error("❌ Failed to log signature error to HentoryLog:", err.message);
  }
};

const hentorySignature = async (req, res, next) => {
  const timestamp = req.headers["sapi-timestamp"];
  const signature = req.headers["sapi-signature"];
  const signatureKey = process.env.HENTORY_SIGNATURE_KEY;

  if (!timestamp || !signature) {
    console.warn("⚠️ Hentory signature verification failed: Missing headers");
    const responseData = { status: 30002, message: "Invalid Signature" };
    await logSignatureError(req, 400, "Missing sapi-timestamp or sapi-signature headers", responseData);
    return res.status(400).json(responseData);
  }

  if (!signatureKey) {
    console.error("❌ Hentory signature verification failed: HENTORY_SIGNATURE_KEY is not set in environment");
    const responseData = { status: 30002, message: "Server Configuration Error" };
    await logSignatureError(req, 500, "HENTORY_SIGNATURE_KEY is not set in environment", responseData);
    return res.status(500).json(responseData);
  }

  try {
    const rawBody = req.rawBody || "";
    const signingString = `${rawBody}.${timestamp}`;

    const expectedSignature = crypto
      .createHmac("sha256", signatureKey)
      .update(signingString)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const receivedBuffer = Buffer.from(signature, "hex");

    // timingSafeEqual requires buffers to be of equal length
    if (expectedBuffer.length !== receivedBuffer.length) {
      console.warn("⚠️ Hentory signature verification failed: Signature length mismatch");
      const responseData = { status: 30002, message: "Invalid Signature" };
      await logSignatureError(req, 400, "Signature length mismatch", responseData);
      return res.status(400).json(responseData);
    }

    if (!crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) {
      console.warn("⚠️ Hentory signature verification failed: Signature mismatch");
      const responseData = { status: 30002, message: "Invalid Signature" };
      await logSignatureError(req, 400, "Signature mismatch", responseData);
      return res.status(400).json(responseData);
    }

    return next();
  } catch (error) {
    console.error("❌ Error during Hentory signature verification:", error.message);
    const responseData = { status: 30002, message: "Invalid Signature" };
    await logSignatureError(req, 400, `Exception during signature check: ${error.message}`, responseData);
    return res.status(400).json(responseData);
  }
};

module.exports = hentorySignature;
