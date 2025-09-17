const mongoose = require("mongoose");

const huaySchema = new mongoose.Schema(
  {
    lottery_set_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LotterySets",
      required: true,
    },
    huay_name: { type: String, default: "" },
    code: { type: String, default: "" },
    name: { type: String, default: "thai-lottery" },
    lottery_name: { type: String,default:null },
    huay_number: { type: Array, default: [] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Huay", huaySchema);
