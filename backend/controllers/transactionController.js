/**
 * controllers/transactionController.js
 *
 * Handles POST /api/transaction
 * - Validates the payload (via middleware)
 * - Loads user profile from store
 * - Calls risk engine
 * - Persists result
 * - Emits Socket.IO events
 */

const { v4: uuidv4 } = require('uuid');
const calculateRisk = require('../riskEngine');
const store = require('../store');

const ALERT_THRESHOLD = 70; // risk score above which a txn is flagged

/**
 * Process a new transaction.
 * io is injected via closure from server.js through req.app.get('io')
 */
async function processTransaction(req, res) {
  try {
    const txn = {
      txn_id: uuidv4(),
      ...req.body,
      receivedAt: Date.now(),
    };

    // Get or create user profile
    const userProfile = store.getUser(txn.user_id);

    // Run risk engine
    const risk = calculateRisk(txn, userProfile);

    // Build the enriched result
    const enriched = {
      ...txn,
      risk,
      flagged: risk.score >= ALERT_THRESHOLD,
    };

    // Persist to store
    store.addTransaction(enriched);
    store.updateUser(txn.user_id, txn, risk);

    // Flag as alert if high risk
    if (enriched.flagged) {
      store.addAlert(enriched);
    }

    // Emit real-time events via Socket.IO
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
