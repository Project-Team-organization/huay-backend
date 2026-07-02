const basicAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return res.status(401).json({
      success: false,
      status: 401,
      message: "Unauthorized",
    });
  }

  const base64 = authHeader.split(" ")[1];
  const decoded = Buffer.from(base64, "base64").toString("utf-8");
  const [username, password] = decoded.split(":");

  if (
    username === process.env.PROVIDER_AUTH_USERNAME &&
    password === process.env.PROVIDER_AUTH_PASSWORD
  ) {
    return next();
  }

  return res.status(401).json({
    success: false,
    status: 401,
    message: "Invalid credentials",
  });
};

module.exports = basicAuth;
