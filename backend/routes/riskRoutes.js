/**
 * routes/riskRoutes.js
 */

const express = require('express');
const router = express.Router();
const { getUserRisk, getStats } = require('../controllers/riskController');

// GET /api/risk/stats  — must come before /:userId to avoid param capture
router.get('/stats', getStats);

// GET /api/risk/:userId
router.get('/:userId', getUserRisk);

module.exports = router;
