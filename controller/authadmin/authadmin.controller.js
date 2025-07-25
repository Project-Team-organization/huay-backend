const validate = require("../../validators/Validator");
const { logAction } = require("../../utils/logger");
const { normalizeIP } = require("../../utils/utils");
const authadminService = require("../../service/authadmin/authadmin.service");
const { handleAuthSuccess, handleAuthError } = require("../../utils/responseHandler");

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
            await logAction("login_admin_failed_validation", {
              tag: "login",
              endpoint: fullUrl,
              ip,
              method: "POST",
              data: { error: error.details[0].message, input: req.body, referrer },
            });
            const response = await handleAuthError(error, error.details[0].message, 400);
            return res.status(response.status).json(response);
        }
           
        const result = await authadminService.loginadmin(username, password, ip, userAgent);
        if (!result.success) {
            await logAction("login_admin_failed", {
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
        // ลบ user ออกจาก result
        delete result.user;
       
        return res.status(result.status).json(result);

    } catch (error) {
        await logAction("login_admin_error", {
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
    const authorizationHeader = req.headers["authorization"];
   
    if (!authorizationHeader) {
        const response = await handleAuthError(null, "กรุณาระบุ authorization header", 400);
        return res.status(response.status).json(response);
    }

    const token = authorizationHeader.split(" ")[1];
    if (!token) {
        const response = await handleAuthError(null, "กรุณาระบุ token", 400);
        return res.status(response.status).json(response);
    }

    try {
        const newToken = await authadminService.handleRefreshToken(token);
        const response = await handleAuthSuccess(newToken, null, null, "รีเฟรชโทเค็นสำเร็จ", 200);
        return res.status(response.status).json(response);
    } catch (error) {
        const response = await handleAuthError(error, "โทเค็นไม่ถูกต้องหรือหมดอายุ", 403);
        return res.status(response.status).json(response);
    }
};

exports.logout = async (req, res) => {
    const authorizationHeader = req.headers["authorization"];
    if (!authorizationHeader) {
        const response = await handleAuthError(null, "กรุณาระบุ authorization header", 400);
        return res.status(response.status).json(response);
    }

    const token = authorizationHeader.split(" ")[1];
    if (!token) {
        const response = await handleAuthError(null, "กรุณาระบุ token", 400);
        return res.status(response.status).json(response);
    }

    try {
        const result = await authadminService.logout(token);
        return res.status(result.status).json(result);
    } catch (error) {
        const response = await handleAuthError(error);
        return res.status(response.status).json(response);
    }
};

// ล็อคอิน master
exports.loginMaster = async (req, res) => {
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
        const result = await authadminService.loginMaster(username, password, ip, userAgent);
        if (!result.success) {
            await logAction("login_master_failed", {
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

        // ลบ user ออกจาก result
        delete result.user;

        return res.status(result.status).json(result);
    } catch (error) {
        await logAction("login_master_error", {
            tag: "login",
            method: "POST",
            endpoint: fullUrl,
            data: { error: error.message, stack: error.stack, referrer, ip },
        });

        const response = await handleAuthError(error);
        return res.status(response.status).json(response);
    }
};

