

const express = require('express');
const router = express.Router();
const { getUserRisk, getStats } = require('../controllers/riskController');

router.get('/stats', getStats);

router.get('/:userId', getUserRisk);

module.exports = router;
