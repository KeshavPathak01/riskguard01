/**
 * routes/transactionRoutes.js
 */

const express = require('express');
const router = express.Router();
const validateTransaction = require('../middleware/validateTransaction');
const { processTransaction } = require('../controllers/transactionController');

// POST /api/transaction
// Body: { user_id, amount, device_id?, location?, failedCount?, timestamp? }
router.post('/', validateTransaction, processTransaction);

module.exports = router;
