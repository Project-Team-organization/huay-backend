const admin = require("../../models/admin.model");
const UserBet = require("../../models/userBetSchema.models");
const superadmin = require("../../models/superadmin.model");
const { handleSuccess, handleError } = require("../../utils/responseHandler");
const PasswordHistory = require("../../models/history.chang.password.model");
const UserTransaction = require("../../models/user.transection.model");
const bcrypt = require("bcrypt");

// create admin
exports.createAdmin = async (username, password, phone, role) => {
  try {
    const existingAdmin = await admin.findOne({
      username,
    });

    const existingSuperadmin = await superadmin.findOne({
      username,
    });

    if (existingAdmin || existingSuperadmin) {
      return handleError(null, "Username นี้มีอยู่ในระบบแล้ว", 400);
    }

    const newAdmin = new admin({
      username,
      password,
      phone,
      role,
    });
    const savedAdmin = await newAdmin.save();
    return handleSuccess(savedAdmin, "สร้าง Admin สำเร็จ", 201);
  } catch (error) {
    return handleError(error);
  }
};

// get admin
exports.getadmin = async ({ page = 1, perpage = 10, search }) => {
  try {
    const query = {};
    if (search) {
      query.$or = [{ username: { $regex: search, $options: "i" } }];
    }

    const [admins, total] = await Promise.all([
      admin
        .find(query)
        .select("-password")
        .skip((page - 1) * perpage)
        .limit(perpage)
        .sort({ createdAt: -1 }),
      admin.countDocuments(query),
    ]);

    const pagination = {
      currentPage: page,
      perPage: perpage,
      totalItems: total,
      totalPages: Math.ceil(total / perpage),
    };

    return handleSuccess(admins, "ดึงข้อมูล Admin สำเร็จ", 200, pagination);
  } catch (error) {
    return handleError(error);
  }
};

// get admin by id
exports.getadminById = async (id) => {
  try {
    if (!id) {
      return handleError(null, "กรุณาระบุ ID ของ admin", 400);
    }
    const result = await admin.findById(id).select("-password");
    if (!result) {
      return handleError(null, "ไม่พบ Admin", 404);
    }
    return handleSuccess(result, "ดึงข้อมูล Admin สำเร็จ");
  } catch (error) {
    return handleError(error);
  }
};

// update admin
exports.updateadmin = async (id, updateData, currentUser) => {
  try {
    if (!id) {
      return handleError(null, "กรุณาระบุ ID ของ admin", 400);
    }

    if (updateData.username) {
      const existingAdmin = await admin.findOne({
        username: updateData.username,
        _id: { $ne: id },
      });

      const existingSuperadmin = await superadmin.findOne({
        username: updateData.username,
      });

      if (existingAdmin || existingSuperadmin) {
        return handleError(null, "Username นี้มีอยู่ในระบบแล้ว", 400);
      }
    }

    const now = new Date();

    if (updateData.password) {
      const adminData = await admin.findById(id);
      if (!adminData) {
        return handleError(null, "ไม่พบ Admin ที่ต้องการแก้ไข", 404);
      }

      const oldPassword = adminData.password; // ดึงรหัสผ่านเก่า
      const hashedPassword = await bcrypt.hash(updateData.password, 10);

      // อัปเดต password และ history
      await admin.findByIdAndUpdate(id, {
        $set: {
          ...updateData,
          password: hashedPassword,
        },
        $push: {
          last_password_change: {
            date: now,
            password: oldPassword,
            changed_by: {
              user_id: currentUser.user_id,
              role: currentUser.role,
              full_name: currentUser.full_name,
            },
          },
        },
      });

      // อัปเดต PasswordHistory
      const passwordHistoryLatest = await PasswordHistory.findOne({
        user_id: id,
      }).sort({ changed_at: -1 });

      if (
        passwordHistoryLatest &&
        passwordHistoryLatest.user_id.toString() === id.toString()
      ) {
        await PasswordHistory.updateOne(
          { _id: passwordHistoryLatest._id },
          {
            $push: {
              changed_by: {
                user_id: currentUser.user_id,
                role: currentUser.role,
                full_name: currentUser.full_name,
                changed_at: now,
              },
              last_password_change: {
                date: now,
                password: oldPassword,
                changed_by: {
                  user_id: currentUser.user_id,
                  role: currentUser.role,
                  full_name: currentUser.full_name,
                },
              },
            },
            $set: { changed_at: now },
          }
        );
      } else {
        await PasswordHistory.create({
          user_id: id,
          password: hashedPassword,
          changed_by: [
            {
              user_id: currentUser.user_id,
              role: currentUser.role,
              full_name: currentUser.full_name,
              changed_at: now,
            },
          ],
          last_password_change: [
            {
              date: now,
              password: oldPassword,
              changed_by: {
                user_id: currentUser.user_id,
                role: currentUser.role,
                full_name: currentUser.full_name,
              },
            },
          ],
          changed_at: now,
        });
      }

      const updatedAdmin = await admin
        .findById(id)
        .select("-password -password_history.password");

      return handleSuccess(updatedAdmin, "อัพเดท Admin และรหัสผ่านสำเร็จ");
    }

    updateData.updatedAt = now;
    const updatedAdmin = await admin
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .select("-password");

    if (!updatedAdmin) {
      return handleError(null, "ไม่พบ Admin ที่ต้องการแก้ไข", 404);
    }

    return handleSuccess(updatedAdmin, "อัพเดท Admin สำเร็จ");
  } catch (error) {
    return handleError(error);
  }
};

// delete admin
exports.deleteadmin = async (id) => {
  try {
    if (!id) {
      return handleError(null, "กรุณาระบุ ID ของ admin", 400);
    }

    const result = await admin.findByIdAndDelete(id);

    if (!result) {
      return handleError(null, "ไม่พบ Admin ที่ต้องการลบ", 404);
    }

    return handleSuccess(null, "ลบ Admin สำเร็จ");
  } catch (error) {
    return handleError(error);
  }
};

// active admin
exports.activeadmin = async (id) => {
  try {
    if (!id) {
      return handleError(null, "กรุณาระบุ ID ของ admin", 400);
    }

    const result = await admin
      .findByIdAndUpdate(
        id,
        { $set: { active: true, updatedAt: new Date() } },
        { new: true }
      )
      .select("-password");

    if (!result) {
      return handleError(null, "ไม่พบ Admin ที่ต้องการอัพเดท", 404);
    }

    return handleSuccess(result, "อัพเดทสถานะ Admin เป็น active สำเร็จ");
  } catch (error) {
    return handleError(error);
  }
};

// disactive admin
exports.disactiveadmin = async (id) => {
  try {
    if (!id) {
      return handleError(null, "กรุณาระบุ ID ของ admin", 400);
    }

    const result = await admin
      .findByIdAndUpdate(
        id,
        { $set: { active: false, updatedAt: new Date() } },
        { new: true }
      )
      .select("-password");

    if (!result) {
      return handleError(null, "ไม่พบ Admin ที่ต้องการอัพเดท", 404);
    }

    return handleSuccess(result, "อัพเดทสถานะ Admin เป็น inactive สำเร็จ");
  } catch (error) {
    return handleError(error);
  }
};

exports.getAllUserBets = async function (page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const total = await UserBet.countDocuments();
    const bets = await UserBet.find()
      .populate("lottery_set_id")
      .populate("user_id","full_name")
      .sort({ bet_date: -1 })
      .skip(skip)
      .limit(limit);

    return {
      bets,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("❌ getAllUserBets error:", error.message);
    throw error;
  }
};

exports.getUserBetByIdUser = async function (user_id, lottery_set_id, status) {
  try {
    if (!user_id) throw new Error("user_id ต้องไม่ว่าง");

    const filter = { user_id };

    if (lottery_set_id) {
      filter.lottery_set_id = lottery_set_id;
    }
    if (status) {
      filter.status = status;
    }
    const bets = await UserBet.find(filter)
      .select("-bets -created_at -updated_at -user_id")
      .populate({
        path: "lottery_set_id",
      })
      .sort({ bet_date: -1 });
    return bets;
  } catch (error) {
    console.error("❌ getUserBetsById error:", error.message);
    throw error;
  }
};

exports.getUserBetById = async function (id) {
  try {
    if (!id) throw new Error("bet_iidd ต้องไม่ว่าง");

    const bet = await UserBet.findById(id)
      .select("-bets -created_at -updated_at -user_id")
      .populate("user_id","full_name")
      .populate({
        path: "lottery_set_id",
      });
      

    if (!bet) {
      throw new Error("ไม่พบข้อมูลการแทงหวยตาม id ที่ระบุ");
    }

    return bet;
  } catch (error) {
    console.error("❌ getUserBetById error:", error.message);
    throw error;
  }
};


exports.getUserTransactions = async function ( { page = 1, limit = 10, type, startDate, endDate } = {}) {
  try {
    const skip = (page - 1) * limit;
    
    // สร้าง query object
    let query = {};

    // เพิ่มเงื่อนไขการค้นหาตาม type ถ้ามีการระบุ
    if (type) {
      query.type = type;
    }

    // เพิ่มเงื่อนไขการค้นหาตามช่วงวันที่
    if (startDate || endDate) {
      query.created_at = {};
      
      if (startDate) {
        query.created_at.$gte = new Date(startDate + "T00:00:00.000Z");
      }
      
      if (endDate) {
        query.created_at.$lte = new Date(endDate + "T23:59:59.999Z");
      }
    }

    // ดึงข้อมูล transaction
    const transactions = await UserTransaction.find(query)
      .sort({ created_at: -1 }) // เรียงจากใหม่ไปเก่า
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'ref_id',
        refPath: 'ref_model'
      })
      .populate('user_id', 'username phone'); // เพิ่มข้อมูล user

    // นับจำนวนทั้งหมด
    const total = await UserTransaction.countDocuments(query);

    // คำนวณยอดรวมของแต่ละประเภท transaction
    const summary = await UserTransaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);

    // แยกสรุปตาม ref_model
    const modelSummary = await UserTransaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$ref_model",
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      data: transactions,
      summary,
      modelSummary,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error in getUserTransactions:", error.message);
    throw new Error("ไม่สามารถดึงข้อมูล transaction ได้");
  }
};

exports.getUserTransactionById = async function (transactionId) {
  try {
    const transaction = await UserTransaction.findById(transactionId)
      .populate({
        path: 'ref_id',
        refPath: 'ref_model'
      })
      .populate('user_id', 'username phone');

    if (!transaction) {
      throw new Error("ไม่พบข้อมูลธุรกรรม");
    }

    return transaction;
  } catch (error) {
    console.error("Error in getUserTransactionById:", error.message);
    throw new Error("ไม่สามารถดึงข้อมูลธุรกรรมได้");
  }
};

exports.getUserTransactionsByUserId = async function (userId, { page = 1, limit = 10, type, startDate, endDate } = {}) {
  try {
    const skip = (page - 1) * limit;
    
    // สร้าง query object
    let query = { user_id: userId };

    // เพิ่มเงื่อนไขการค้นหาตาม type ถ้ามีการระบุ
    if (type) {
      query.type = type;
    }

    // เพิ่มเงื่อนไขการค้นหาตามช่วงวันที่
    if (startDate || endDate) {
      query.created_at = {};
      
      if (startDate) {
        query.created_at.$gte = new Date(startDate + "T00:00:00.000Z");
      }
      
      if (endDate) {
        query.created_at.$lte = new Date(endDate + "T23:59:59.999Z");
      }
    }

    // ดึงข้อมูล transaction
    const transactions = await UserTransaction.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'ref_id',
        refPath: 'ref_model'
      })
      .populate('user_id', 'username phone');

    // นับจำนวนทั้งหมด
    const total = await UserTransaction.countDocuments(query);

    // คำนวณยอดรวมของแต่ละประเภท transaction
    const summary = await UserTransaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      data: transactions,
      summary,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error in getUserTransactionsByUserId:", error.message);
    throw new Error("ไม่สามารถดึงข้อมูล transaction ได้");
  }
};
