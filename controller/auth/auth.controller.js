const {
  loginUser,
  handleRefreshToken,
  handleLogout,
  checkExistingRefreshToken,
  findUserById,
} = require("../../service/auth/auth.service");
const validate = require("../../validators/Validator");
const { logAction } = require("../../utils/logger");
const { normalizeIP } = require("../../utils/utils");
const {
  handleAuthSuccess,
  handleAuthError,
  handleSuccess,
  handleError,
} = require("../../utils/responseHandler");

exports.login = async (req, res) => {
  const ipRaw =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.connection.remoteAddress ||
    req.ip;
  const ip = normalizeIP(ipRaw);
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  const referrer = req.get("Referer") || null;
  const userAgent = req.get("User-Agent");
  const { username, password } = req.body;

  try {
    const { error } = validate.loginValidate(req.body);
    if (error) {
      await logAction("login_failed_validation", {
        tag: "login",
        endpoint: fullUrl,
        ip,
        method: "POST",
        data: { error: error.details[0].message, input: req.body, referrer },
      });
      const response = await handleAuthError(
        error,
        error.details[0].message,
        400
      );
      return res.status(response.status).json(response);
    }

    const result = await loginUser(username, password, ip, userAgent);
    if (!result.success) {
      await logAction("login_failed", {
        tag: "login",
        endpoint: fullUrl,
        method: "POST",
        data: {
          error: result.message,
          input: req.body,
          referrer,
          ip,
        },
      });
      return res.status(result.status).json(result);
    }

    await logAction("login_success", {
      tag: "login",
      method: "POST",
      userId: result.user._id,
      endpoint: fullUrl,
      data: {
        user: {
          id: result.user._id,
          username: result.user.username,
        },
        referrer,
        ip,
      },
    });

    // Set token เป็น HTTP-only cookie
    res.cookie("access_token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.cookie("refresh_token", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // ลบ user และ token ออกจาก response body
    delete result.user;
    delete result.token;
    delete result.refreshToken;

    return res.status(result.status).json(result);
  } catch (error) {
    await logAction("login_error", {
      tag: "login",
      method: "POST",
      endpoint: fullUrl,
      data: { error: error.message, stack: error.stack, referrer, ip },
    });

    const response = await handleAuthError(error);
    return res.status(response.status).json(response);
  }
};

exports.refreshToken = async (req, res) => {
  const token = req.cookies?.refresh_token;
  if (!token) {
    const response = await handleAuthError(null, "กรุณาเข้าสู่ระบบ", 401);
    return res.status(response.status).json(response);
  }

  try {
    const newAccessToken = await handleRefreshToken(token);

    res.cookie("access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    const response = await handleAuthSuccess(
      null,
      null,
      null,
      "รีเฟรชโทเค็นสำเร็จ"
    );
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleAuthError(
      error,
      "โทเค็นไม่ถูกต้องหรือหมดอายุ",
      403
    );
    return res.status(response.status).json(response);
  }
};

exports.logout = async (req, res) => {
  const token = req.cookies?.refresh_token;
  if (!token) {
    const response = await handleAuthError(null, "กรุณาเข้าสู่ระบบ", 401);
    return res.status(response.status).json(response);
  }

  try {
    const result = await handleLogout(token);

    // ลบ cookies
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(result.status).json(result);
  } catch (error) {
    const response = await handleAuthError(error);
    return res.status(response.status).json(response);
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      const response = await handleError(null, "Unauthorized", 401);
      return res.status(401).json(response);
    }

    const user = await findUserById(userId);
    if (!user) {
      const response = await handleError(null, "ไม่พบผู้ใช้งาน", 401);
      return res.status(404).json(response);
    }

    const response = await handleSuccess(user, "ดึงข้อมูลผู้ใช้งานสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    const response = await handleError(
      error,
      "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์",
      500
    );
    return res.status(500).json(response);
  }
};
