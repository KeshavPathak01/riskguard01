

const { v4: uuidv4 } = require('uuid');
const calculateRisk = require('../riskEngine');
const store = require('../store');

const ALERT_THRESHOLD = 70; 

async function processTransaction(req, res) {
  try {
    const txn = {
      txn_id: uuidv4(),
      ...req.body,
      receivedAt: Date.now(),
    };

    const userProfile = store.getUser(txn.user_id);

    const risk = calculateRisk(txn, userProfile);

    const enriched = {
      ...txn,
      risk,
      flagged: risk.score >= ALERT_THRESHOLD,
    };

    store.addTransaction(enriched);
    store.updateUser(txn.user_id, txn, risk);

    if (enriched.flagged) {
      store.addAlert(enriched);
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('risk_update', enriched);
      if (enriched.flagged) {
        io.emit('new_alert', enriched);
      }
    }

    return res.status(201).json({ success: true, data: enriched });
  } catch (err) {
    console.error('[TransactionController] Error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

module.exports = { processTransaction };
