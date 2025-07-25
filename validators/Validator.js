const Joi = require("joi");

exports.RegisterValidate = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(5).allow("", null).optional(),
    password: Joi.string().min(6).allow("", null).optional(),
    phone: Joi.string().min(10).max(15).required(),
    master_id: Joi.string().allow("", null).optional(),
    bank_name: Joi.string().allow("", null).optional(),
    bank_number: Joi.string().allow("", null).optional(),
    full_name: Joi.string().allow("", null).optional(),
    referral_link: Joi.string().allow("", null).optional(),
    user_id: Joi.string().allow("", null).optional(),
  });

  return schema.validate(data, { abortEarly: false });
};

exports.loginValidate = (data) => {
  const schema = Joi.object({
    username: Joi.string().required().messages({
      "string.empty": "Username is required",
    }),
    password: Joi.string().min(6).required().messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 6 characters",
    }),
  });

  return schema.validate(data, { abortEarly: false });
};

// vaild superadmin
exports.superadminValidate = (data) => {
  const schema = Joi.object({
    id: Joi.string().allow(null).optional().optional(),
    username: Joi.string().min(5).required(),
    password: Joi.string().allow(null).optional(),
    phone: Joi.string().min(10).max(15).required(),
  });

  return schema.validate(data, { abortEarly: false });
};

// vaild admin
exports.adminValidate = (data) => {
  const schema = Joi.object({
    id: Joi.string().allow(null).optional().optional(),
    username: Joi.string().min(5).required(),
    password: Joi.string().allow(null).optional(),
    phone: Joi.string().min(10).max(15).required(),
    role: Joi.array()
      .required()
      .min(1)
      .messages({
        "array.base": "Role must be an array",
        "array.min": "Role must contain at least 1 item",
        "array.empty": "Role cannot be empty",
      })
      .optional(),
  });

  return schema.validate(data, { abortEarly: false });
};

// vaild master
exports.masterValidate = (data) => {
  const schema = Joi.object({
    id: Joi.string().allow(null).optional().optional(),
    username: Joi.string().min(5).required(),
    password: Joi.string().allow(null).optional(),
    phone: Joi.string().min(10).max(15).required(),
    commission_percentage: Joi.number().min(0).max(100).required(),
  });

  return schema.validate(data, { abortEarly: false });
};

exports.createBettingTypeSchema = (data) => {
  const bettingTypeSchema = Joi.object({
    code: Joi.string().required().label("Code").messages({
      "any.required": `"Code" is required.`,
      "string.empty": `"Code" cannot be empty.`,
    }),
    name: Joi.string().required().label("Name").messages({
      "any.required": `"Name" is required.`,
      "string.empty": `"Name" cannot be empty.`,
    }),
    digit: Joi.number().required().label("Digit").messages({
      "any.required": `"Digit" is required.`,
      "number.base": `"Digit" must be a number.`,
    }),
    payout_rate: Joi.number()
      .optional()
      .allow(null)
      .label("Payout Rate")
      .messages({
        "number.base": `"Payout Rate" must be a number.`,
      }),
    min_bet: Joi.number().optional().allow(null).label("Min Bet").messages({
      "number.base": `"Min Bet" must be a number.`,
    }),
    max_bet: Joi.number().optional().allow(null).label("Max Bet").messages({
      "number.base": `"Max Bet" must be a number.`,
    }),
  }).unknown(false); // ไม่อนุญาตฟิลด์อื่นใน betting_types

  const schema = Joi.object({
    lottery_type: Joi.string().required().label("Lottery Type").messages({
      "any.required": `"Lottery Type" is required.`,
      "string.empty": `"Lottery Type" cannot be empty.`,
    }),
    betting_types: Joi.array()
      .items(bettingTypeSchema)
      .min(1)
      .required()
      .label("Betting Types")
      .messages({
        "array.min": `"Betting Types" must contain at least one item.`,
        "any.required": `"Betting Types" is required.`,
      }),
  }).unknown(false); // ไม่อนุญาตฟิลด์อื่น ๆ นอกเหนือจาก lottery_type และ betting_types

  return schema.validate(data, { abortEarly: false });
};

exports.updateBettingTypeSchema = (data) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().allow("", null).optional(),
    code: Joi.string().allow("", null).optional(),
  });

  return schema.validate(data, { abortEarly: false });
};

exports.validateCreateLotteryType = (data) => {
  const bettingTypeSchema = Joi.object({
    code: Joi.string().required().label("Code").messages({
      "any.required": `"Code" is required.`,
      "string.empty": `"Code" cannot be empty.`,
    }),
    name: Joi.string().required().label("Name").messages({
      "any.required": `"Name" is required.`,
      "string.empty": `"Name" cannot be empty.`,
    }),
    digit: Joi.number().required().label("Digit").messages({
      "any.required": `"Digit" is required.`,
      "number.base": `"Digit" must be a number.`,
    }),
    payout_rate: Joi.number()
      .optional()
      .allow(null)
      .label("Payout Rate")
      .messages({
        "number.base": `"Payout Rate" must be a number.`,
      }),
    min_bet: Joi.number().optional().allow(null).label("Min Bet").messages({
      "number.base": `"Min Bet" must be a number.`,
    }),
    max_bet: Joi.number().optional().allow(null).label("Max Bet").messages({
      "number.base": `"Max Bet" must be a number.`,
    }),
  }).unknown(false); // ไม่อนุญาตฟิลด์อื่นใน betting_types

  const schema = Joi.object({
    lottery_type: Joi.string().required().label("Lottery Type").messages({
      "any.required": `"Lottery Type" is required.`,
      "string.empty": `"Lottery Type" cannot be empty.`,
    }),
    betting_types: Joi.array()
      .items(bettingTypeSchema)
      .min(1)
      .required()
      .label("Betting Types")
      .messages({
        "array.min": `"Betting Types" must contain at least one item.`,
        "any.required": `"Betting Types" is required.`,
      }),
  }).unknown(false);
  return schema.validate(data, { abortEarly: false });
};

// Validator สำหรับการถอนเงิน (ยังไม่ได้ใช้)
// exports.validateCreateWithdrawal = (data) => {
//   const schema = Joi.object({
//     user_id: Joi.string().required().messages({
//       "any.required": `"user_id" is required`,
//       "string.empty": `"user_id" cannot be empty`,
//     }),
//     amount: Joi.number().positive().required().messages({
//       "any.required": `"amount" is required`,
//       "number.base": `"amount" must be a number`,
//       "number.positive": `"amount" must be positive`,
//     }),
//     bankName: Joi.string().required().messages({
//       "any.required": `"bankName" is required`,
//       "string.empty": `"bankName" cannot be empty`,
//     }),
//     accountNumber: Joi.string().required().messages({
//       "any.required": `"accountNumber" is required`,
//       "string.empty": `"accountNumber" cannot be empty`,
//     }),
//     accountName: Joi.string().required().messages({
//       "any.required": `"accountName" is required`,
//       "string.empty": `"accountName" cannot be empty`,
//     }),
//     description: Joi.string().optional().allow("").messages({
//       "string.base": `"description" must be a string`,
//     }),
//   });

//   return schema.validate(data, { abortEarly: false });
// };

// exports.validateUpdateWithdrawal = (data) => {
//   const schema = Joi.object({
//     bankName: Joi.string().optional().messages({
//       "string.base": `"bankName" must be a string`,
//     }),
//     accountNumber: Joi.string().optional().messages({
//       "string.base": `"accountNumber" must be a string`,
//     }),
//     accountName: Joi.string().optional().messages({
//       "string.base": `"accountName" must be a string`,
//     }),
//     description: Joi.string().optional().allow("").messages({
//       "string.base": `"description" must be a string`,
//     }),
//   });

//   return schema.validate(data, { abortEarly: false });
// };

// exports.validateApproveWithdrawal = (data) => {
//   const schema = Joi.object({
//     approvedBy: Joi.string().required().messages({
//       "any.required": `"approvedBy" is required`,
//       "string.empty": `"approvedBy" cannot be empty`,
//     }),
//   });

//   return schema.validate(data, { abortEarly: false });
// };

// exports.validateRejectWithdrawal = (data) => {
//   const schema = Joi.object({
//     rejectedReason: Joi.string().required().messages({
//       "any.required": `"rejectedReason" is required`,
//       "string.empty": `"rejectedReason" cannot be empty`,
//     }),
//     approvedBy: Joi.string().required().messages({
//       "any.required": `"approvedBy" is required`,
//       "string.empty": `"approvedBy" cannot be empty`,
//     }),
//   });

//   return schema.validate(data, { abortEarly: false });
// };

// exports.validateCompleteWithdrawal = (data) => {
//   const schema = Joi.object({
//     approvedBy: Joi.string().required().messages({
//       "any.required": `"approvedBy" is required`,
//       "string.empty": `"approvedBy" cannot be empty`,
//     }),
//   });

//   return schema.validate(data, { abortEarly: false });
// };
