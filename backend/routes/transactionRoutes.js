

const express = require('express');
const router = express.Router();
const validateTransaction = require('../middleware/validateTransaction');
const { processTransaction } = require('../controllers/transactionController');

router.post('/', validateTransaction, processTransaction);

module.exports = router;
