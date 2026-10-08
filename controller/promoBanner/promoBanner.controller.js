const service = require("../../service/promoBanner/promoBanner.service");
const { handleSuccess, handleError } = require("../../utils/responseHandler");

async function fail(res, error, fallbackMessage) {
  const status = error instanceof service.ServiceError ? error.status : 500;
  const message =
    error instanceof service.ServiceError ? error.message : fallbackMessage;
  const response = await handleError(error, message, status);
  return res.status(response.status).json(response);
}

async function ok(res, data, message, status = 200) {
  const response = await handleSuccess(data, message, status);
  return res.status(response.status).json(response);
}

exports.getPublic = async (req, res) => {
  try {
    return ok(res, await service.listPublic(), "ดึงแบนเนอร์โปรโมชั่นสำเร็จ");
  } catch (error) {
    return fail(res, error, "เกิดข้อผิดพลาดในการดึงแบนเนอร์โปรโมชั่น");
  }
};

exports.getAdmin = async (req, res) => {
  try {
    return ok(res, await service.listAll(), "ดึงแบนเนอร์โปรโมชั่นสำเร็จ");
  } catch (error) {
    return fail(res, error, "เกิดข้อผิดพลาดในการดึงแบนเนอร์โปรโมชั่น");
  }
};

exports.create = async (req, res) => {
  try {
    const data = await service.create({
      file: req.file,
      link_url: req.body?.link_url,
      is_active: req.body?.is_active,
    });
    return ok(res, data, "เพิ่มแบนเนอร์โปรโมชั่นสำเร็จ", 201);
  } catch (error) {
    return fail(res, error, "เกิดข้อผิดพลาดในการเพิ่มแบนเนอร์โปรโมชั่น");
  }
};

exports.reorder = async (req, res) => {
  try {
    return ok(
      res,
      await service.reorder(req.body?.ids),
      "จัดเรียงแบนเนอร์โปรโมชั่นสำเร็จ"
    );
  } catch (error) {
    return fail(res, error, "เกิดข้อผิดพลาดในการจัดเรียงแบนเนอร์โปรโมชั่น");
  }
};

exports.update = async (req, res) => {
  try {
    const data = await service.update(req.params.id, {
      file: req.file,
      link_url: req.body?.link_url,
      is_active: req.body?.is_active,
      order: req.body?.order,
    });
    return ok(res, data, "แก้ไขแบนเนอร์โปรโมชั่นสำเร็จ");
  } catch (error) {
    return fail(res, error, "เกิดข้อผิดพลาดในการแก้ไขแบนเนอร์โปรโมชั่น");
  }
};

exports.remove = async (req, res) => {
  try {
    return ok(
      res,
      await service.remove(req.params.id),
      "ลบแบนเนอร์โปรโมชั่นสำเร็จ"
    );
  } catch (error) {
    return fail(res, error, "เกิดข้อผิดพลาดในการลบแบนเนอร์โปรโมชั่น");
  }
};
