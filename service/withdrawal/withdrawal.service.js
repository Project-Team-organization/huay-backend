const mongoose = require("mongoose");
const moment = require("moment-timezone");
const Withdrawal = require("../../models/withdrawal.models");
const User = require("../../models/user.model");
const UserTransaction = require("../../models/user.transection.model");
const { handleSuccess, handleError } = require("../../utils/responseHandler");
const commissionService = require("../commission/commission.service");
const { deleteFile } = require("../../middleware/upload.middleware");

// สร้างคำขอถอนเงิน
exports.createWithdrawal = async function ({
  user_id,
  amount,
  bank_name,
  bank_number,
  account_name,
  description,
}) {
  try {
    // เช็คว่า user_id มีอยู่ในฐานข้อมูลหรือไม่
    const user = await User.findById(user_id);
    if (!user) {
      throw new Error("ไม่พบผู้ใช้งานในระบบ");
    }

    // เช็คว่า amount มีค่ามากกว่า 0 หรือไม่
    if (amount <= 0) {
      throw new Error("จำนวนเงินต้องมากกว่า 0");
    }

    // เช็คว่า user มีเงินเพียงพอหรือไม่
    if (user.credit < amount) {
      throw new Error("เงินในบัญชีไม่เพียงพอ");
    }

    // ไม่มีค่าธรรมเนียม
    const fee = 0;
    const netAmount = amount;

    // ไม่คำนวณค่าคอมมิชชั่นตอนสร้าง รอคำนวณตอนอนุมัติ

    // หักเงินจาก user ทันทีตอนสร้างคำขอ
    const balanceBefore = user.credit;
    user.credit -= amount;
    await user.save();

    // บันทึก transaction
    const userTransaction = new UserTransaction({
      user_id: user._id,
      type: "withdraw",
      amount: amount,
      balance_before: balanceBefore,
      balance_after: user.credit,
      ref_id: null, // จะอัพเดทหลังจากสร้าง withdrawal
      ref_model: "Withdrawal",
      description:
        description || `ถอนเงินไปยัง ${bank_name} เลขที่บัญชี ${bank_number}`,
      created_at: new Date(),
    });

    // สร้างข้อมูล withdrawal ใหม่ด้วยสถานะ pending (หักเครดิตแล้ว)
    const newWithdrawal = new Withdrawal({
      user_id: user._id,
      master_id: null, // จะอัพเดทตอนอนุมัติ
      amount,
      netAmount,
      fee,

      // ข้อมูลค่าคอมมิชชั่น - จะคำนวณตอนอนุมัติ
      commission_percentage: 0,
      commission_amount: 0,
      system_loss: 0,

      bank_name,
      bank_number,
      account_name,
      description,
      status: "pending", // หักเงินแล้ว รอ admin อนุมัติ
      created_at: new Date(),
      updated_at: new Date(),
    });

    // บันทึกข้อมูล
    await newWithdrawal.save();

    // อัพเดท ref_id ใน transaction
    userTransaction.ref_id = newWithdrawal._id;
    await userTransaction.save();

    return newWithdrawal;
  } catch (error) {
    throw error;
  }
};

// อนุมัติการถอนเงิน (อัพสลิปโอนเงิน)
exports.approveWithdrawal = async function ({
  id,
  approvedBy,
  transfer_slip_image,
  transfer_slip_image_original_name,
}) {
  try {
    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) {
      throw new Error("ไม่พบข้อมูลการถอนเงิน");
    }

    if (withdrawal.status !== "pending") {
      // ถ้า error ให้ลบไฟล์ที่ upload ไว้
      if (transfer_slip_image) {
        deleteFile(transfer_slip_image);
      }
      throw new Error("ไม่สามารถอนุมัติได้ เนื่องจากสถานะไม่ใช่ pending");
    }

    // คำนวณค่าคอมมิชชั่นตอนอนุมัติ
    const commissionData = await commissionService.calculateCommission(
      withdrawal.user_id,
      withdrawal.netAmount,
      "withdrawal",
    );

    // อัพเดทข้อมูลค่าคอมมิชชั่นใน withdrawal
    withdrawal.master_id = commissionData.master_id;
    withdrawal.commission_percentage = commissionData.commission_percentage;
    withdrawal.commission_amount = commissionData.commission_amount;
    withdrawal.system_loss = commissionData.system_loss;

    // อัพเดทสถานะเป็น approved และบันทึกรูปสลิปโอนเงิน
    withdrawal.status = "completed";
    withdrawal.approvedBy = approvedBy;
    withdrawal.approvedAt = new Date();
    withdrawal.transfer_slip_image = transfer_slip_image;
    withdrawal.transfer_slip_image_original_name =
      transfer_slip_image_original_name;
    withdrawal.updated_at = new Date();
    await withdrawal.save();

    // อัพเดท MasterCommission (ถ้ามี master และมีค่าคอมฯ)
    if (commissionData.master_id && commissionData.commission_amount !== 0) {
      await commissionService.updateCommissionOnWithdrawal({
        user_id: withdrawal.user_id,
        master_id: commissionData.master_id,
        netAmount: withdrawal.netAmount,
        commission_amount: commissionData.commission_amount,
        system_loss: commissionData.system_loss,
      });
    }

    return withdrawal;
  } catch (error) {
    throw error;
  }
};

// ปฏิเสธการถอนเงิน (คืนเงินให้ user)
exports.rejectWithdrawal = async function ({ id, rejectedReason, approvedBy }) {
  try {
    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) {
      throw new Error("ไม่พบข้อมูลการถอนเงิน");
    }

    if (withdrawal.status !== "pending") {
      throw new Error("ไม่สามารถปฏิเสธได้ เนื่องจากสถานะไม่ใช่ pending");
    }

    // คืนเงินให้ user (เพราะหักไปแล้วตอนสร้างคำขอ)
    const user = await User.findById(withdrawal.user_id);
    if (!user) {
      throw new Error("ไม่พบข้อมูลผู้ใช้");
    }

    user.credit += withdrawal.amount;
    await user.save();

    // ลบ transaction ที่เกี่ยวข้อง
    await UserTransaction.deleteOne({
      ref_id: withdrawal._id,
      type: "withdraw",
    });

    // อัพเดทสถานะเป็น rejected
    withdrawal.status = "rejected";
    withdrawal.rejectedReason = rejectedReason;
    withdrawal.approvedBy = approvedBy;
    withdrawal.updated_at = new Date();
    await withdrawal.save();

    return withdrawal;
  } catch (error) {
    throw error;
  }
};

// ยกเลิกการถอนเงิน
exports.getWithdrawalById = async id => {
  try {
    if (!id) {
      return handleError(null, "กรุณาระบุ ID ของรายการถอนเงิน", 400);
    }

    return await Withdrawal.findById(id).populate("user_id", "username");
  } catch (error) {
    return handleError(error);
  }
};

// ดึงข้อมูลทั้งหมด
exports.getAllWithdrawals = async function ({
  page = 1,
  limit = 10,
  status,
  startDate,
  endDate,
} = {}) {
  try {
    // สร้างเงื่อนไขการค้นหา
    let query = {};

    // เพิ่มเงื่อนไขการค้นหาตามสถานะ
    if (status) {
      query.status = status;
    }

    // เพิ่มเงื่อนไขการค้นหาตามวันที่
    if (startDate && endDate) {
      // ค้นหาระหว่างวันที่
      const start = new Date(startDate + "T00:00:00.000Z");
      const end = new Date(endDate + "T23:59:59.999Z");
      query.created_at = {
        $gte: start,
        $lte: end,
      };
    } else if (startDate) {
      // ค้นหาวันเดียว
      const start = new Date(startDate + "T00:00:00.000Z");
      const end = new Date(startDate + "T23:59:59.999Z");
      query.created_at = {
        $gte: start,
        $lte: end,
      };
    }

    const withdrawals = await Withdrawal.find(query)
      .populate("user_id")
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Withdrawal.countDocuments(query);

    return {
      data: withdrawals,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw error;
  }
};

// ดึงข้อมูลการถอนเงินของ user
exports.getWithdrawalsByUserId = async function (
  user_id,
  { page = 1, limit = 10 } = {},
) {
  const skip = (page - 1) * limit;

  const withdrawals = await Withdrawal.find({ user_id })
    .populate("approvedBy", "username")
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Withdrawal.countDocuments({ user_id });

  return {
    data: withdrawals,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ถอนเงินจาก admin   ถ้าหักจาก admin  ถือว่า success  ไปเลย
exports.deductFromAdmin = async function ({
  user_id,
  amount,
  bank_name,
  bank_number,
  account_name,
  description,
  addcredit_admin_id,
  addcredit_admin_name,
  addcredit_admin_role,
}) {
  try {
    // เช็คว่า user_id มีอยู่ในฐานข้อมูลหรือไม่
    const user = await User.findById(user_id);
    if (!user) {
      throw new Error("ไม่พบผู้ใช้งานในระบบ");
    }

    // เช็คว่า amount มีค่ามากกว่า 0 หรือไม่
    if (amount <= 0) {
      throw new Error("จำนวนเงินต้องมากกว่า 0");
    }

    // ไม่มีค่าธรรมเนียม
    const fee = 0;
    const netAmount = amount;

    // คำนวณค่าคอมมิชชั่น
    const commissionData = await commissionService.calculateCommission(
      user._id,
      netAmount,
      "withdrawal",
    );

    // สร้างข้อมูล withdrawal ใหม่
    const newWithdrawal = new Withdrawal({
      user_id: user._id,
      master_id: commissionData.master_id,
      amount,
      netAmount,
      fee,

      // ข้อมูลค่าคอมมิชชั่น
      commission_percentage: commissionData.commission_percentage,
      commission_amount: commissionData.commission_amount,
      system_loss: commissionData.system_loss,

      bank_name,
      bank_number,
      account_name,
      description,
      status: "approved", // admin หัก = อนุมัติทันที
      approvedBy: addcredit_admin_id,
      approvedAt: new Date(),
      addcredit_admin_id: addcredit_admin_id,
      addcredit_admin_name: addcredit_admin_name,
      addcredit_admin_role: addcredit_admin_role,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // บันทึกข้อมูล withdrawal
    await newWithdrawal.save();

    // หักเงินจาก user ทันที
    user.credit -= amount;
    await user.save();

    // บันทึก transaction
    const userTransaction = new UserTransaction({
      user_id: user._id,
      type: "withdraw",
      amount: amount,
      balance_before: user.credit,
      balance_after: user.credit - amount,
      ref_id: newWithdrawal._id,
      ref_model: "Withdrawal",
      description:
        description ||
        `ถอนเงินโดย Admin ${addcredit_admin_name} ไปยัง ${bank_name} เลขที่บัญชี ${bank_number}`,
      created_at: new Date(),
    });
    await userTransaction.save();

    // อัพเดท MasterCommission (ถ้ามี master)
    if (commissionData.master_id) {
      await commissionService.updateCommissionOnWithdrawal({
        user_id: user._id,
        master_id: commissionData.master_id,
        netAmount: netAmount,
        commission_amount: commissionData.commission_amount,
        system_loss: commissionData.system_loss,
      });
    }

    return newWithdrawal;
  } catch (error) {
    throw error;
  }
};

// อัพเดทข้อมูลการถอนเงิน
exports.updateWithdrawal = async function ({
  id,
  bank_name,
  bank_number,
  account_name,
  description,
}) {
  try {
    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) {
      throw new Error("ไม่พบข้อมูลการถอนเงิน");
    }

    if (withdrawal.status !== "pending") {
      throw new Error("ไม่สามารถแก้ไขได้ เนื่องจากสถานะไม่ใช่ pending");
    }

    // อัพเดทข้อมูล
    withdrawal.bank_name = bank_name || withdrawal.bank_name;
    withdrawal.bank_number = bank_number || withdrawal.bank_number;
    withdrawal.account_name = account_name || withdrawal.account_name;
    withdrawal.description = description || withdrawal.description;
    withdrawal.updated_at = new Date();

    await withdrawal.save();

    return withdrawal;
  } catch (error) {
    throw error;
  }
};

// ยกเลิกการถอนเงิน (เฉพาะสถานะ pending เท่านั้น)
exports.cancelWithdrawal = async function ({ id }) {
  try {
    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) {
      throw new Error("ไม่พบข้อมูลการถอนเงิน");
    }

    if (withdrawal.status === "approved") {
      throw new Error(
        "ไม่สามารถยกเลิกได้ เนื่องจากการถอนเงินได้รับการอนุมัติแล้ว",
      );
    }

    if (withdrawal.status !== "pending") {
      throw new Error("ไม่สามารถยกเลิกได้ เนื่องจากสถานะไม่ใช่ pending");
    }

    // คืนเงินให้ user (เพราะหักไปแล้วตอนสร้างคำขอ)
    const user = await User.findById(withdrawal.user_id);
    if (!user) {
      throw new Error("ไม่พบข้อมูลผู้ใช้");
    }

    user.credit += withdrawal.amount;
    await user.save();

    // ลบ transaction ที่เกี่ยวข้อง
    await UserTransaction.deleteOne({
      ref_id: withdrawal._id,
      type: "withdraw",
    });

    // อัพเดทสถานะเป็น cancelled
    withdrawal.status = "cancelled";
    withdrawal.updated_at = new Date();
    await withdrawal.save();

    return withdrawal;
  } catch (error) {
    throw error;
  }
};

// ลบการถอนเงิน
exports.deleteWithdrawal = async function ({ id }) {
  try {
    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) {
      throw new Error("ไม่พบข้อมูลการถอนเงิน");
    }

    // ลบไฟล์รูปสลิป (ถ้ามี)
    if (withdrawal.transfer_slip_image) {
      deleteFile(withdrawal.transfer_slip_image);
    }

    // ถ้าสถานะเป็น pending หรือ approved (หักเงินไปแล้ว) ให้คืนเงิน
    if (withdrawal.status === "pending" || withdrawal.status === "approved") {
      const user = await User.findById(withdrawal.user_id);
      if (!user) {
        throw new Error("ไม่พบข้อมูลผู้ใช้");
      }
      user.credit += withdrawal.amount;
      await user.save();
    }

    // ลบ transaction ที่เกี่ยวข้อง
    await UserTransaction.deleteOne({
      ref_id: withdrawal._id,
      type: "withdraw",
    });

    // ลบข้อมูล withdrawal
    await Withdrawal.findByIdAndDelete(id);

    return { message: "ลบข้อมูลการถอนเงินสำเร็จ" };
  } catch (error) {
    throw error;
  }
};

exports.getWithdrawals = async ({ page = 1, perPage = 10, search }) => {
  try {
    const query = {};
    if (search) {
      query.$or = [{ "user_id.username": { $regex: search, $options: "i" } }];
    }

    const withdrawals = await Withdrawal.find(query)
      .populate("user_id", "username")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    const total = await Withdrawal.countDocuments(query);

    const pagination = {
      currentPage: page,
      perPage,
      totalItems: total,
      totalPages: Math.ceil(total / perPage),
    };

    return handleSuccess(
      withdrawals,
      "ดึงข้อมูลรายการถอนเงินสำเร็จ",
      200,
      pagination,
    );
  } catch (error) {
    return handleError(error);
  }
};
