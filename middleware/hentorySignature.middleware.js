const crypto = require("crypto");

const hentorySignature = (req, res, next) => {
  const timestamp = req.headers["sapi-timestamp"];
  const signature = req.headers["sapi-signature"];
  const signatureKey = process.env.HENTORY_SIGNATURE_KEY;

  if (!timestamp || !signature) {
    console.warn("⚠️ Hentory signature verification failed: Missing headers");
    return res.status(400).json({ status: 30002, message: "Invalid Signature" });
  }

  if (!signatureKey) {
    console.error("❌ Hentory signature verification failed: HENTORY_SIGNATURE_KEY is not set in environment");
    return res.status(500).json({ status: 30002, message: "Server Configuration Error" });
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
      return res.status(400).json({ status: 30002, message: "Invalid Signature" });
    }

    if (!crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) {
      console.warn("⚠️ Hentory signature verification failed: Signature mismatch");
      return res.status(400).json({ status: 30002, message: "Invalid Signature" });
    }

    return next();
  } catch (error) {
    console.error("❌ Error during Hentory signature verification:", error.message);
    return res.status(400).json({ status: 30002, message: "Invalid Signature" });
  }
};

module.exports = hentorySignature;
