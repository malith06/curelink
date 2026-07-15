const express = require('express');
const { checkHealth } = require('../controllers/health.controller');

const router = express.Router();

router.route('/').get(checkHealth);

module.exports = router;
