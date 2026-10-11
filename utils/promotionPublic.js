// Pure helpers that shape a promotion for the public (player) endpoint.
// Uses a whitelist so admin-only fields can never leak.

const UPLOADS_PREFIX = "/uploads/";

// Returns a "/uploads/..." path, or null when the value is unusable.
function normalizeImagePath(raw) {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value) return null;

  let pathname = null;
  if (/^https?:\/\//i.test(value)) {
    try {
      pathname = new URL(value).pathname;
    } catch (e) {
      return null;
    }
  } else if (value.startsWith("/")) {
    pathname = value;
  } else {
    return null;
  }

  // Reject path traversal and anything outside the uploads folder
  if (!pathname.startsWith(UPLOADS_PREFIX) || pathname.includes("..")) {
    return null;
  }
  return pathname;
}

const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const str = (v) => (typeof v === "string" ? v : null);
const toIso = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

function toPublicPromotion(doc) {
  const c = (doc && doc.conditions) || {};
  const r = (doc && doc.rewards) || {};

  const images = (Array.isArray(doc && doc.images) ? doc.images : [])
    .map((img) => ({
      url: normalizeImagePath(img && img.image),
      description: str(img && img.description),
    }))
    .filter((img) => img.url !== null);

  return {
    _id: String(doc._id),
    name: doc.name,
    description: doc.description,
    type: doc.type,
    startDate: toIso(doc.startDate),
    endDate: toIso(doc.endDate),
    conditions: {
      depositAmount: num(c.depositAmount),
      depositDays: num(c.depositDays),
      turnOverTimes: num(c.turnOverTimes),
      maxBonusAmount: num(c.maxBonusAmount),
      maxBonus: num(c.maxBonus),
      percentage: num(c.percentage),
      every: str(c.every),
      dayOfWeek: num(c.dayOfWeek),
      maxDepositCountPerDay: num(c.maxDepositCountPerDay),
    },
    rewards: {
      type: str(r.type),
      amount: num(r.amount),
      basedOn: str(r.basedOn),
      withdrawable: typeof r.withdrawable === "boolean" ? r.withdrawable : null,
      description: str(r.description),
    },
    images,
  };
}

module.exports = { normalizeImagePath, toPublicPromotion };
