const express = require("express");
const router = express.Router();
const ipWhitelist = require("../middleware/ipWhitelist.middleware");

router.use(ipWhitelist);

router.post("/balance", (req, res) => {
  // TODO: implement balance check
  console.log("📥 Hentory callback /balance:", req.body);
  res.json({ status: 0, balance: 0 });
});

router.post("/bet", (req, res) => {
  // TODO: implement bet deduction
  console.log("📥 Hentory callback /bet:", req.body);
  res.json({ status: 0, balance: 0 });
});

router.post("/result", (req, res) => {
  // TODO: implement result/payout
  console.log("📥 Hentory callback /result:", req.body);
  res.json({ status: 0, balance: 0 });
});

router.post("/cancel", (req, res) => {
  // TODO: implement cancel/refund
  console.log("📥 Hentory callback /cancel:", req.body);
  res.json({ status: 0, balance: 0 });
});

module.exports = router;
