const test = require("node:test");
const assert = require("node:assert");
const {
  normalizeImagePath,
  toPublicPromotion,
} = require("../utils/promotionPublic");

test("normalizeImagePath: full URL becomes path", () => {
  assert.strictEqual(
    normalizeImagePath("http://api.example.com/uploads/x.png"),
    "/uploads/x.png"
  );
  assert.strictEqual(
    normalizeImagePath("https://api.example.com/uploads/x.png"),
    "/uploads/x.png"
  );
});

test("normalizeImagePath: path kept, invalid dropped", () => {
  assert.strictEqual(normalizeImagePath("/uploads/a.jpg"), "/uploads/a.jpg");
  assert.strictEqual(normalizeImagePath(""), null);
  assert.strictEqual(normalizeImagePath(null), null);
  assert.strictEqual(normalizeImagePath("uploads/a.jpg"), null);
  assert.strictEqual(normalizeImagePath("/other/a.jpg"), null);
  assert.strictEqual(normalizeImagePath("https://x.com/other/a.jpg"), null);
  assert.strictEqual(normalizeImagePath("/uploads/../etc/passwd"), null);
});

test("toPublicPromotion: whitelist only, no admin fields", () => {
  const out = toPublicPromotion({
    _id: { toString: () => "abc123" },
    name: "โปรสมาชิกใหม่",
    description: "รายละเอียด",
    type: "instant-bonus",
    target: "all",
    active: true,
    specificUsers: ["u1"],
    startDate: new Date("2026-01-01T00:00:00Z"),
    endDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    __v: 0,
    conditions: { depositAmount: 100, fromFriendBet: true, requireLinkSignup: true },
    rewards: { type: "fixed", amount: 50, description: "x" },
    images: [
      { _id: "i1", promotion_id: "abc123", image: "http://h/uploads/1.png", description: "d" },
      { image: "http://h/evil/2.png" },
    ],
  });
  for (const k of ["specificUsers", "target", "active", "createdAt", "updatedAt", "__v"]) {
    assert.ok(!(k in out), k);
  }
  assert.ok(!("fromFriendBet" in out.conditions));
  assert.ok(!("requireLinkSignup" in out.conditions));
  assert.strictEqual(out._id, "abc123");
  assert.strictEqual(out.startDate, "2026-01-01T00:00:00.000Z");
  assert.strictEqual(out.endDate, null);
  assert.strictEqual(out.conditions.depositAmount, 100);
  assert.strictEqual(out.conditions.turnOverTimes, null);
  assert.deepStrictEqual(out.images, [{ url: "/uploads/1.png", description: "d" }]);
  assert.ok(!("_id" in out.images[0]) && !("promotion_id" in out.images[0]));
});

test("toPublicPromotion: no images => []", () => {
  const out = toPublicPromotion({ _id: "1", name: "n", description: "d", type: "rebate" });
  assert.deepStrictEqual(out.images, []);
});
