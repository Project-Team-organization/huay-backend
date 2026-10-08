const mongoose = require("mongoose");

const hentoryLogSchema = new mongoose.Schema({
  endpoint: { type: String, required: true },
  headers: { type: Object, default: {} },
  body: { type: Object, default: {} },
  rawBody: { type: String, default: "" },
  response: { type: Object, default: {} },
  error: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("HentoryLog", hentoryLogSchema);
