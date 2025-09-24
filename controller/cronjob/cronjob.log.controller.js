const CronjobLog = require('../../models/cronjob.log.model');
const { responseHandler } = require('../../utils/responseHandler');

// ดู log ทั้งหมด
exports.getAllLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, status, job_name, lottery_name } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (job_name) filter.job_name = new RegExp(job_name, 'i');
    if (lottery_name) filter.lottery_name = new RegExp(lottery_name, 'i');
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { execution_time: -1 },
      populate: { path: 'lottery_set_id', select: 'name result_time status' }
    };
    
    const logs = await CronjobLog.paginate(filter, options);
    
    responseHandler(res, 200, 'ดึงข้อมูล cronjob logs สำเร็จ', logs);
  } catch (error) {
    responseHandler(res, 500, 'เกิดข้อผิดพลาดในการดึงข้อมูล cronjob logs', null, error.message);
  }
};

// ดู log ตาม job name
exports.getLogsByJobName = async (req, res) => {
  try {
    const { jobName } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const filter = { job_name: jobName };
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { execution_time: -1 },
      populate: { path: 'lottery_set_id', select: 'name result_time status' }
    };
    
    const logs = await CronjobLog.paginate(filter, options);
    
    responseHandler(res, 200, `ดึงข้อมูล logs ของ ${jobName} สำเร็จ`, logs);
  } catch (error) {
    responseHandler(res, 500, 'เกิดข้อผิดพลาดในการดึงข้อมูล logs', null, error.message);
  }
};

// ดู log ที่ error
exports.getErrorLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const filter = { status: 'error' };
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { execution_time: -1 }
    };
    
    const logs = await CronjobLog.paginate(filter, options);
    
    responseHandler(res, 200, 'ดึงข้อมูล error logs สำเร็จ', logs);
  } catch (error) {
    responseHandler(res, 500, 'เกิดข้อผิดพลาดในการดึงข้อมูล error logs', null, error.message);
  }
};

// สรุปสถิติ cronjob
exports.getCronjobStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchStage = {};
    if (startDate || endDate) {
      matchStage.execution_time = {};
      if (startDate) matchStage.execution_time.$gte = new Date(startDate);
      if (endDate) matchStage.execution_time.$lte = new Date(endDate);
    }
    
    const stats = await CronjobLog.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalJobs: { $sum: 1 },
          successJobs: { $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] } },
          errorJobs: { $sum: { $cond: [{ $eq: ["$status", "error"] }, 1, 0] } },
          avgDuration: { $avg: "$duration_ms" },
          maxDuration: { $max: "$duration_ms" },
          minDuration: { $min: "$duration_ms" }
        }
      }
    ]);
    
    const jobStats = await CronjobLog.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$job_name",
          totalRuns: { $sum: 1 },
          successRuns: { $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] } },
          errorRuns: { $sum: { $cond: [{ $eq: ["$status", "error"] }, 1, 0] } },
          avgDuration: { $avg: "$duration_ms" },
          lastRun: { $max: "$execution_time" }
        }
      },
      { $sort: { totalRuns: -1 } }
    ]);
    
    const result = {
      overall: stats[0] || {
        totalJobs: 0,
        successJobs: 0,
        errorJobs: 0,
        avgDuration: 0,
        maxDuration: 0,
        minDuration: 0
      },
      byJob: jobStats
    };
    
    responseHandler(res, 200, 'ดึงข้อมูลสถิติ cronjob สำเร็จ', result);
  } catch (error) {
    responseHandler(res, 500, 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ', null, error.message);
  }
};

// ลบ logs เก่า
exports.cleanOldLogs = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    
    const result = await CronjobLog.deleteMany({
      execution_time: { $lt: cutoffDate }
    });
    
    responseHandler(res, 200, `ลบ logs เก่าสำเร็จ (${result.deletedCount} รายการ)`, {
      deletedCount: result.deletedCount,
      cutoffDate: cutoffDate
    });
  } catch (error) {
    responseHandler(res, 500, 'เกิดข้อผิดพลาดในการลบ logs เก่า', null, error.message);
  }
};
