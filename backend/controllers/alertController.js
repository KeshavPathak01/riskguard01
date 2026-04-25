/**
 * controllers/alertController.js
 *
 * Handles:
 *  GET  /api/alerts           → paginated list of flagged transactions
 *  POST /api/alerts/:txnId/dismiss → remove an alert
 */

const store = require('../store');

async function getAlerts(req, res) {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const alerts = store.getAlerts({ limit });

    return res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (err) {
    console.error('[AlertController] Error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function dismissAlert(req, res) {
  try {
    const { txnId } = req.params;
    const removed = store.dismissAlert(txnId);

    if (!removed) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }

    return res.status(200).json({ success: true, message: `Alert ${txnId} dismissed` });
  } catch (err) {
    console.error('[AlertController] Dismiss Error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

module.exports = { getAlerts, dismissAlert };
