const express = require('express');
const { checkHealth, getPlatformStats } = require('../controllers/health.controller');

const router = express.Router();

router.route('/').get(checkHealth);
router.route('/stats').get(getPlatformStats);

module.exports = router;
