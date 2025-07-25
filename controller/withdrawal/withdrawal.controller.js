const withdrawalService = require("../../service/withdrawal/withdrawal.service");
const { handleSuccess, handleError } = require("../../utils/responseHandler");

// สร้างคำขอถอนเงิน
exports.createWithdrawal = async function (req, res) {
  try {
    const { amount, bank_name, bank_number, account_name, description } = req.body;
    const user_id = req.user._id;
    const withdrawal = await withdrawalService.createWithdrawal({
      user_id,
      amount,
      bank_name,
      bank_number,
      account_name,
      description,
    });
    
    if (!withdrawal) {
      const response = await handleError(null, "Failed to create withdrawal", 400);
      return res.status(response.status).json(response);
    }
    
    const response = await handleSuccess(withdrawal, "สร้างคำขอถอนเงินสำเร็จ");
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, error.message || 'Failed to create withdrawal', 500);
    return res.status(response.status).json(response); 
  }
};

// ดึงข้อมูลการถอนเงินตาม ID
exports.getWithdrawalById = async function (req, res) {
  try {
    const { id } = req.params;
    const withdrawal = await withdrawalService.getWithdrawalById(id);
    
    if (!withdrawal) {
      const response = await handleError(null, "ไม่พบข้อมูลการถอนเงิน", 404);
      return res.status(response.status).json(response);
    }
    
    const response = await handleSuccess(withdrawal, "ดึงข้อมูลการถอนเงินสำเร็จ");
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, error.message || 'Failed to get withdrawal', 500);
    return res.status(response.status).json(response);
  }
};

// ดึงข้อมูลการถอนเงินทั้งหมด
exports.getAllWithdrawals = async function (req, res) {
  try {
    const { page = 1, limit = 10, status, startDate, endDate } = req.query || {};

    const result = await withdrawalService.getAllWithdrawals({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      status,
      startDate,
      endDate,
    });

    const response = await handleSuccess(
      result.data,
      "ดึงข้อมูลการถอนเงินทั้งหมดสำเร็จ",
      200,
      result.pagination
    );
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, error.message || 'Failed to get all withdrawals', 500);
    return res.status(response.status).json(response);
  }
};

// ดึงข้อมูลการถอนเงินของ user
exports.getWithdrawalsByUserId = async function (req, res) {
  try {
    const { user_id } = req.params;
    const { page = 1, limit = 10 } = req.query || {};

    const result = await withdrawalService.getWithdrawalsByUserId(user_id, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });

    const response = await handleSuccess(
      result.data,
      "ดึงข้อมูลการถอนเงินของ user สำเร็จ",
      200,
      result.pagination
    );
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, error.message || 'Failed to get user withdrawals', 500);
    return res.status(response.status).json(response);
  }
};

exports.getWithdrawalsBytoken = async function (req, res) {
  try {
    const user_id = req.user._id;
    const { page = 1, limit = 10, status } = req.query || {};
     const result = await withdrawalService.getWithdrawalsByUserId(user_id, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });

    const response = await handleSuccess(
      result.data,
      "ดึงข้อมูลการถอนเงินของ user สำเร็จ",
      200,
      result.pagination
    );
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, error.message || 'Failed to get user withdrawals', 500);
    return res.status(response.status).json(response);
  }
}

// อนุมัติการถอนเงิน
exports.approveWithdrawal = async function (req, res) {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;
    
    const withdrawal = await withdrawalService.approveWithdrawal({ 
      id, 
      approvedBy 
    });
    
    const response = await handleSuccess(withdrawal, "อนุมัติการถอนเงินสำเร็จ");
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, error.message || 'Failed to approve withdrawal', 500);
    return res.status(response.status).json(response);
  }
};

// ปฏิเสธการถอนเงิน
exports.rejectWithdrawal = async function (req, res) {
  try {
    const { id } = req.params;
    const { rejectedReason, approvedBy } = req.body;
    
    const withdrawal = await withdrawalService.rejectWithdrawal({ 
      id, 
      rejectedReason, 
      approvedBy 
    });
    
    const response = await handleSuccess(withdrawal, "ปฏิเสธการถอนเงินสำเร็จ");
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, error.message || 'Failed to reject withdrawal', 500);
    return res.status(response.status).json(response);
  }
};

// ยืนยันการโอนเงินสำเร็จ
exports.completeWithdrawal = async function (req, res) {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;
    
    const withdrawal = await withdrawalService.completeWithdrawal({ 
      id, 
      approvedBy 
    });
    
    const response = await handleSuccess(withdrawal, "ยืนยันการโอนเงินสำเร็จ");
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, error.message || 'Failed to complete withdrawal', 500);
    return res.status(response.status).json(response);
  }
};

// อัพเดทข้อมูลการถอนเงิน
exports.updateWithdrawal = async function (req, res) {
  try {
    const { id } = req.params;
    const { bank_name, bank_number, account_name, description } = req.body;
    
    const withdrawal = await withdrawalService.updateWithdrawal({
      id,
      bank_name,
      bank_number,
      account_name,
      description,
    });
    
    const response = await handleSuccess(withdrawal, "อัพเดทข้อมูลการถอนเงินสำเร็จ");
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, error.message || 'Failed to update withdrawal', 500);
    return res.status(response.status).json(response);
  }
};

// ยกเลิกการถอนเงิน
exports.cancelWithdrawal = async function (req, res) {
  try {
    const { id } = req.params;
    
    const withdrawal = await withdrawalService.cancelWithdrawal({ id });
    
    const response = await handleSuccess(withdrawal, "ยกเลิกการถอนเงินสำเร็จ");
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, error.message || 'Failed to cancel withdrawal', 500);
    return res.status(response.status).json(response);
  }
};

// ลบการถอนเงิน
exports.deleteWithdrawal = async function (req, res) {
  try {
    const { id } = req.params;
    
    const result = await withdrawalService.deleteWithdrawal({ id });
    
    const response = await handleSuccess(result, "ลบข้อมูลการถอนเงินสำเร็จ");
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, error.message || 'Failed to delete withdrawal', 500);
    return res.status(response.status).json(response);
  }
};

// หักเงินจาก admin 
exports.deductFromAdmin = async function (req, res) {
  try {
    const { user_id, amount, bank_name, bank_number, account_name, description, addcredit_admin_id, addcredit_admin_name, addcredit_admin_role } = req.body;
    
    if (!addcredit_admin_id || !addcredit_admin_name || !addcredit_admin_role) {
      const response = await handleError(null, "กรุณาระบุข้อมูล admin ให้ครบถ้วน", 400);
      return res.status(response.status).json(response);
    }
    
    const withdrawal = await withdrawalService.deductFromAdmin({
      user_id,
      amount,
      bank_name,
      bank_number,
      account_name,
      description,
      addcredit_admin_id,
      addcredit_admin_name,
      addcredit_admin_role,
    });
    
    const response = await handleSuccess(withdrawal, "หักเงินจาก admin สำเร็จ");
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, error.message || 'Failed to deduct from admin', 500);
    return res.status(response.status).json(response);
  }
}; 