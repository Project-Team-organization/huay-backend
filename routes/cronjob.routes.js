const express = require('express');
const router = express.Router();
const cronjobLogController = require('../controller/cronjob/cronjob.log.controller');

// Routes สำหรับ cronjob logs
router.get('/logs', cronjobLogController.getAllLogs);
router.get('/logs/job/:jobName', cronjobLogController.getLogsByJobName);
router.get('/logs/errors', cronjobLogController.getErrorLogs);
router.get('/stats', cronjobLogController.getCronjobStats);
router.delete('/logs/clean', cronjobLogController.cleanOldLogs);

module.exports = router;
