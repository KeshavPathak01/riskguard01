/**
 * store.js — In-Memory Data Store
 *
 * Simulates a MongoDB-like interface with Maps.
 * To migrate to real MongoDB, replace each method
 * with the equivalent Mongoose call.
 */

// ─── Core Collections ─────────────────────────────────────────────────────────

/** @type {Map<string, object>}  keyed by user_id */
const userProfiles = new Map();

/** @type {Array<object>} all processed transactions (capped at 500) */
const transactions = [];
const MAX_TXN_HISTORY = 500;

/** @type {Array<object>} high-risk flagged transactions */
const alerts = [];
const MAX_ALERTS = 200;

// ─── User Profile Helpers ──────────────────────────────────────────────────────

/**
 * Get or create a user profile.
 * Tracks rolling window stats needed by the risk rules.
 */
function getUser(userId) {
  if (!userProfiles.has(userId)) {
    userProfiles.set(userId, {
      user_id: userId,
      knownDevices: [],          // list of previously seen device_ids
      knownLocations: [],        // list of previously seen locations
      recentAmounts: [],         // last 10 transaction amounts
      recentTimestamps: [],      // last 10 transaction timestamps (ms)
      failedAttempts: 0,         // rolling failed-login/txn counter
      totalTransactions: 0,
      lastRiskScore: 0,
      riskHistory: [],           // last 20 risk scores with timestamps
    });
  }
  return userProfiles.get(userId);
}

/**
 * Persist a processed transaction result back to the user profile.
 */
function updateUser(userId, txn, riskResult) {
  const profile = getUser(userId);

  // Update known devices
  if (txn.device_id && !profile.knownDevices.includes(txn.device_id)) {
    profile.knownDevices.push(txn.device_id);
  }

  // Update known locations
  if (txn.location && !profile.knownLocations.includes(txn.location)) {
    profile.knownLocations.push(txn.location);
  }

  // Rolling amount window (last 10)
  profile.recentAmounts.push(txn.amount);
  if (profile.recentAmounts.length > 10) profile.recentAmounts.shift();

  // Rolling timestamp window (last 10)
  profile.recentTimestamps.push(txn.timestamp || Date.now());
  if (profile.recentTimestamps.length > 10) profile.recentTimestamps.shift();

  // Failed attempts
  if (txn.failed) {
    profile.failedAttempts += txn.failedCount || 1;
  } else {
    // Reset on successful transaction
    profile.failedAttempts = Math.max(0, profile.failedAttempts - 1);
  }

  profile.totalTransactions += 1;
  profile.lastRiskScore = riskResult.score;

  // Risk history (last 20 entries)
  profile.riskHistory.push({ score: riskResult.score, ts: Date.now() });
  if (profile.riskHistory.length > 20) profile.riskHistory.shift();

  return profile;
}

// ─── Transaction Helpers ───────────────────────────────────────────────────────

function addTransaction(txn) {
  transactions.unshift(txn); // newest first
  if (transactions.length > MAX_TXN_HISTORY) transactions.pop();
}

function getTransactions({ limit = 50, userId } = {}) {
  let result = transactions;
  if (userId) result = result.filter((t) => t.user_id === userId);
  return result.slice(0, limit);
}

// ─── Alert Helpers ─────────────────────────────────────────────────────────────

function addAlert(txn) {
  alerts.unshift(txn);
  if (alerts.length > MAX_ALERTS) alerts.pop();
}

function getAlerts({ limit = 50 } = {}) {
  return alerts.slice(0, limit);
}

function dismissAlert(txnId) {
  const idx = alerts.findIndex((a) => a.txn_id === txnId);
  if (idx !== -1) alerts.splice(idx, 1);
  return idx !== -1;
}

// ─── Stats Helper ──────────────────────────────────────────────────────────────

function getStats() {
  const total = transactions.length;
  const highRisk = transactions.filter((t) => t.risk && t.risk.score >= 70).length;
  const medRisk = transactions.filter(
    (t) => t.risk && t.risk.score >= 40 && t.risk.score < 70
  ).length;
  const lowRisk = total - highRisk - medRisk;
  const avgScore =
    total > 0
      ? Math.round(
          transactions.reduce((s, t) => s + (t.risk ? t.risk.score : 0), 0) / total
        )
      : 0;

  return {
    total,
    highRisk,
    medRisk,
    lowRisk,
    avgScore,
    alertCount: alerts.length,
    usersMonitored: userProfiles.size,
  };
}

module.exports = {
  getUser,
  updateUser,
  addTransaction,
  getTransactions,
  addAlert,
  getAlerts,
  dismissAlert,
  getStats,
  userProfiles, // expose for direct access if needed
};
