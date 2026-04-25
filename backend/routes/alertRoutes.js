/**
 * routes/alertRoutes.js
 */

const express = require('express');
const router = express.Router();
const { getAlerts, dismissAlert } = require('../controllers/alertController');

// GET  /api/alerts           — list all active alerts
// POST /api/alerts/:txnId/dismiss — dismiss a specific alert
router.get('/', getAlerts);
router.post('/:txnId/dismiss', dismissAlert);

module.exports = router;
