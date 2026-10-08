const mongoose = require("mongoose");
const PromoBanner = require("../../models/promoBanner.model");
const {
  saveImageBuffer,
  safeDelete,
  isSafeLink,
} = require("../../utils/promoBannerUpload");

class ServiceError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

const SORT = { order: 1, createdAt: 1 };

function toBool(v) {
  if (typeof v === "boolean") return v;
  if (v === "true" || v === "1" || v === 1) return true;
  if (v === "false" || v === "0" || v === 0) return false;
  return undefined;
}

exports.ServiceError = ServiceError;

exports.listPublic = () =>
  PromoBanner.find({ is_active: true })
    .sort(SORT)
    .select("_id image_url link_url order")
    .lean();

exports.listAll = () => PromoBanner.find().sort(SORT).lean();

exports.create = async ({ file, link_url, is_active }) => {
  if (!file) throw new ServiceError("กรุณาอัพโหลดรูปภาพ", 400);
  const link = typeof link_url === "string" ? link_url.trim() : "";
  if (!isSafeLink(link)) throw new ServiceError("ลิงก์ไม่ถูกต้อง", 400);

  const { fileName, imageUrl } = await saveImageBuffer(file.buffer);
  try {
    const last = await PromoBanner.findOne().sort({ order: -1 }).select("order");
    const active = toBool(is_active);
    const doc = await PromoBanner.create({
      image_url: imageUrl,
      file_name: fileName,
      link_url: link,
      is_active: active === undefined ? true : active,
      order: last ? last.order + 1 : 0,
    });
    return doc.toObject();
  } catch (err) {
    await safeDelete(fileName).catch(() => {});
    throw err;
  }
};

exports.update = async (id, { file, link_url, is_active, order }) => {
  if (!mongoose.isValidObjectId(id)) throw new ServiceError("id ไม่ถูกต้อง", 400);
  const doc = await PromoBanner.findById(id);
  if (!doc) throw new ServiceError("ไม่พบแบนเนอร์", 404);

  if (link_url !== undefined) {
    const link = typeof link_url === "string" ? link_url.trim() : "";
    if (!isSafeLink(link)) throw new ServiceError("ลิงก์ไม่ถูกต้อง", 400);
    doc.link_url = link;
  }
  if (is_active !== undefined) {
    const active = toBool(is_active);
    if (active === undefined) throw new ServiceError("is_active ไม่ถูกต้อง", 400);
    doc.is_active = active;
  }
  if (order !== undefined && order !== "") {
    const n = Number(order);
    if (!Number.isFinite(n)) throw new ServiceError("order ไม่ถูกต้อง", 400);
    doc.order = n;
  }

  let oldFile = null;
  let newFile = null;
  if (file) {
    const saved = await saveImageBuffer(file.buffer);
    newFile = saved.fileName;
    oldFile = doc.file_name;
    doc.image_url = saved.imageUrl;
    doc.file_name = saved.fileName;
  }

  try {
    await doc.save();
  } catch (err) {
    if (newFile) await safeDelete(newFile).catch(() => {});
    throw err;
  }
  if (oldFile) await safeDelete(oldFile).catch(() => {});
  return doc.toObject();
};

exports.remove = async (id) => {
  if (!mongoose.isValidObjectId(id)) throw new ServiceError("id ไม่ถูกต้อง", 400);
  const doc = await PromoBanner.findByIdAndDelete(id);
  if (!doc) throw new ServiceError("ไม่พบแบนเนอร์", 404);
  await safeDelete(doc.file_name).catch(() => {});
  return { _id: doc._id };
};

exports.reorder = async (ids) => {
  if (
    !Array.isArray(ids) ||
    ids.length === 0 ||
    !ids.every((i) => mongoose.isValidObjectId(i)) ||
    new Set(ids.map(String)).size !== ids.length
  ) {
    throw new ServiceError("ids ไม่ถูกต้อง", 400);
  }
  await PromoBanner.bulkWrite(
    ids.map((id, index) => ({
      updateOne: { filter: { _id: id }, update: { $set: { order: index } } },
    }))
  );
  return exports.listAll();
};
