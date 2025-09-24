const mongoose = require('mongoose');

const cronjobLogSchema = new mongoose.Schema({
  job_name: {
    type: String,
    required: true,
    comment: "ชื่อ cronjob"
  },
  lottery_name: {
    type: String,
    required: true,
    comment: "ชื่อหวยที่สร้าง"
  },
  status: {
    type: String,
    enum: ['success', 'error'],
    required: true,
    comment: "สถานะการทำงาน"
  },
  lottery_set_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LotterySets',
    default: null,
    comment: "ID ของหวยที่สร้างสำเร็จ"
  },
  error_message: {
    type: String,
    default: null,
    comment: "ข้อความ error หากมี"
  },
  execution_time: {
    type: Date,
    default: Date.now,
    comment: "เวลาที่ทำงาน"
  },
  duration_ms: {
    type: Number,
    default: 0,
    comment: "ระยะเวลาการทำงาน (มิลลิวินาที)"
  },
  additional_info: {
    type: Object,
    default: {},
    comment: "ข้อมูลเพิ่มเติม"
  }
}, {
  timestamps: true,
  versionKey: false
});

// Index สำหรับการค้นหา
cronjobLogSchema.index({ job_name: 1, execution_time: -1 });
cronjobLogSchema.index({ lottery_name: 1, execution_time: -1 });
cronjobLogSchema.index({ status: 1, execution_time: -1 });
cronjobLogSchema.index({ execution_time: -1 });

module.exports = mongoose.model('CronjobLog', cronjobLogSchema);
