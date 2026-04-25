

const express = require('express');
const router = express.Router();
const { getAlerts, dismissAlert } = require('../controllers/alertController');

router.get('/', getAlerts);
router.post('/:txnId/dismiss', dismissAlert);

module.exports = router;
