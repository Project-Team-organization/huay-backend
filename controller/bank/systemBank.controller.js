const SystemBank = require("../../models/systemBank.model");
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

exports.updateSystemBank = async (req, res) => {
  try {
    const { bank_name, bank_code, account_name, account_number, is_active } = req.body;

    if (!bank_name || !bank_code || !account_name || !account_number) {
      const response = await handleError(null, "กรุณากรอกข้อมูลบัญชีธนาคารให้ครบถ้วน", 400);
      return res.status(response.status).json(response);
    }

    let bank = await SystemBank.findOne();
    if (bank) {
      bank.bank_name = bank_name;
      bank.bank_code = bank_code;
      bank.account_name = account_name;
      bank.account_number = account_number;
      if (typeof is_active === "boolean") {
        bank.is_active = is_active;
      }
      await bank.save();
    } else {
      bank = await SystemBank.create({
        bank_name,
        bank_code,
        account_name,
        account_number,
        is_active: typeof is_active === "boolean" ? is_active : true,
      });
    }

    const response = await handleSuccess(bank, "อัปเดตข้อมูลบัญชีธนาคารระบบสำเร็จ");
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, "เกิดข้อผิดพลาดในการอัปเดตข้อมูลบัญชีธนาคารระบบ");
    return res.status(response.status).json(response);
  }
};
