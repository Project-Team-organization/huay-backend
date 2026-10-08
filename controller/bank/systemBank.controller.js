const SystemBank = require("../../models/systemBank.model");
const SystemBankLog = require("../../models/systemBankLog.model");
const { handleSuccess, handleError } = require("../../utils/responseHandler");

exports.getSystemBank = async (req, res) => {
  try {
    let bank = await SystemBank.findOne();
    if (!bank) {
      bank = {
        bank_name: "",
        bank_code: "",
        account_name: "",
        account_number: "",
        is_active: true,
      };
    }
    const response = await handleSuccess(bank, "ดึงข้อมูลบัญชีธนาคารระบบสำเร็จ");
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, "เกิดข้อผิดพลาดในการดึงข้อมูลบัญชีธนาคารระบบ");
    return res.status(response.status).json(response);
  }
};

// Public: ดึงข้อมูลบัญชีธนาคารสำหรับหน้าบ้าน (เฉพาะที่เปิดใช้งาน)
exports.getPublicSystemBank = async (req, res) => {
  try {
    const bank = await SystemBank.findOne({ is_active: true });
    if (!bank) {
      const response = await handleSuccess(null, "ไม่พบบัญชีธนาคารระบบที่เปิดใช้งาน");
      return res.status(response.status).json(response);
    }
    const response = await handleSuccess(
      {
        bank_name: bank.bank_name,
        bank_code: bank.bank_code,
        account_name: bank.account_name,
        account_number: bank.account_number,
      },
      "ดึงข้อมูลบัญชีธนาคารระบบสำเร็จ"
    );
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, "เกิดข้อผิดพลาดในการดึงข้อมูลบัญชีธนาคารระบบ");
    return res.status(response.status).json(response);
  }
};

exports.updateSystemBank = async (req, res) => {
  try {
    const { bank_name, bank_code, account_name, account_number, is_active } = req.body;

    if (!bank_name || !bank_code || !account_name || !account_number) {
      const response = await handleError(null, "กรุณากรอกข้อมูลบัญชีธนาคารให้ครบถ้วน", 400);
      return res.status(response.status).json(response);
    }

    const adminInfo = {
      admin_id: req.user?._id || req.user?.id || null,
      username: req.user?.username || (req.user?.role ? req.user.role : "Admin"),
      role: req.user?.role || "admin",
    };

    let bank = await SystemBank.findOne();
    const prevData = bank
      ? {
          bank_name: bank.bank_name || "",
          bank_code: bank.bank_code || "",
          account_name: bank.account_name || "",
          account_number: bank.account_number || "",
          is_active: bank.is_active !== undefined ? bank.is_active : true,
        }
      : null;

    const changes = {};
    if (prevData) {
      if (prevData.bank_name !== bank_name) {
        changes.bank_name = { from: prevData.bank_name, to: bank_name };
      }
      if (prevData.bank_code !== bank_code) {
        changes.bank_code = { from: prevData.bank_code, to: bank_code };
      }
      if (prevData.account_name !== account_name) {
        changes.account_name = { from: prevData.account_name, to: account_name };
      }
      if (prevData.account_number !== account_number) {
        changes.account_number = { from: prevData.account_number, to: account_number };
      }
      if (typeof is_active === "boolean" && prevData.is_active !== is_active) {
        changes.is_active = { from: prevData.is_active, to: is_active };
      }
    }

    if (bank) {
      bank.bank_name = bank_name;
      bank.bank_code = bank_code;
      bank.account_name = account_name;
      bank.account_number = account_number;
      if (typeof is_active === "boolean") {
        bank.is_active = is_active;
      }
      bank.last_updated_by = adminInfo;
      await bank.save();
    } else {
      bank = await SystemBank.create({
        bank_name,
        bank_code,
        account_name,
        account_number,
        is_active: typeof is_active === "boolean" ? is_active : true,
        last_updated_by: adminInfo,
      });
    }

    // บันทึก Audit Log ลงใน SystemBankLog
    try {
      const ip =
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.socket?.remoteAddress ||
        req.ip ||
        "";
      const userAgent = req.headers["user-agent"] || "";

      await SystemBankLog.create({
        system_bank_id: bank._id,
        admin_id: adminInfo.admin_id,
        admin_username: adminInfo.username,
        admin_role: adminInfo.role,
        action: prevData ? "update" : "create",
        previous_data: prevData || {},
        new_data: {
          bank_name: bank.bank_name,
          bank_code: bank.bank_code,
          account_name: bank.account_name,
          account_number: bank.account_number,
          is_active: bank.is_active,
        },
        changes,
        ip_address: ip,
        user_agent: userAgent,
      });
    } catch (logErr) {
      console.error("Failed to create SystemBankLog:", logErr);
    }

    const response = await handleSuccess(bank, "อัปเดตข้อมูลบัญชีธนาคารระบบสำเร็จ");
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, "เกิดข้อผิดพลาดในการอัปเดตข้อมูลบัญชีธนาคารระบบ");
    return res.status(response.status).json(response);
  }
};

// ดึงประวัติการแก้ไขบัญชีธนาคารระบบพร้อม Pagination
exports.getSystemBankLogs = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      SystemBankLog.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      SystemBankLog.countDocuments(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    const response = await handleSuccess(
      logs,
      "ดึงข้อมูลประวัติการแก้ไขบัญชีธนาคารระบบสำเร็จ",
      200,
      {
        total,
        page,
        limit,
        totalPages,
      }
    );
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(
      error,
      "เกิดข้อผิดพลาดในการดึงข้อมูลประวัติการแก้ไขบัญชีธนาคารระบบ"
    );
    return res.status(response.status).json(response);
  }
};

