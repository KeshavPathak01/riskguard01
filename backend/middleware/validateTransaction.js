/**
 * middleware/validateTransaction.js
 *
 * Express middleware that validates incoming transaction payloads
 * before they reach the controller.
 *
 * Required fields: user_id, amount
 * Optional but validated if present: device_id, location, failedCount, timestamp
 */

function validateTransaction(req, res, next) {
  const { user_id, amount } = req.body;
  const errors = [];

  // ─── Required Fields ─────────────────────────────────────────────────────────
  if (!user_id || typeof user_id !== 'string' || user_id.trim() === '') {
    errors.push('user_id is required and must be a non-empty string');
  }

  if (amount === undefined || amount === null) {
    errors.push('amount is required');
  } else if (typeof amount !== 'number' || isNaN(amount)) {
    errors.push('amount must be a valid number');
  } else if (amount < 0) {
    errors.push('amount must be non-negative');
  }

  // ─── Optional Field Validation ───────────────────────────────────────────────
  if (req.body.failedCount !== undefined) {
    if (typeof req.body.failedCount !== 'number' || req.body.failedCount < 0) {
      errors.push('failedCount must be a non-negative number');
    }
  }

  if (req.body.timestamp !== undefined) {
    if (typeof req.body.timestamp !== 'number') {
      errors.push('timestamp must be a Unix timestamp in milliseconds');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors,
    });
  }

  // Normalise: attach defaults for optional fields
  req.body.timestamp = req.body.timestamp || Date.now();
  req.body.failedCount = req.body.failedCount || 0;
  req.body.device_id = req.body.device_id || null;
  req.body.location = req.body.location || null;

  next();
}

module.exports = validateTransaction;
