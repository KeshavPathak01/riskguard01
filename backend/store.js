

const userProfiles = new Map();

const transactions = [];
const MAX_TXN_HISTORY = 500;

const alerts = [];
const MAX_ALERTS = 200;

function getUser(userId) {
  if (!userProfiles.has(userId)) {
    userProfiles.set(userId, {
      user_id: userId,
      knownDevices: [],          
      knownLocations: [],        
      recentAmounts: [],         
      recentTimestamps: [],      
      failedAttempts: 0,         
      totalTransactions: 0,
      lastRiskScore: 0,
      riskHistory: [],           
    });
  }
  return userProfiles.get(userId);
}

function updateUser(userId, txn, riskResult) {
  const profile = getUser(userId);

  if (txn.device_id && !profile.knownDevices.includes(txn.device_id)) {
    profile.knownDevices.push(txn.device_id);
  }

  if (txn.location && !profile.knownLocations.includes(txn.location)) {
    profile.knownLocations.push(txn.location);
  }

  profile.recentAmounts.push(txn.amount);
  if (profile.recentAmounts.length > 10) profile.recentAmounts.shift();

  profile.recentTimestamps.push(txn.timestamp || Date.now());
  if (profile.recentTimestamps.length > 10) profile.recentTimestamps.shift();

  if (txn.failed) {
    profile.failedAttempts += txn.failedCount || 1;
  } else {
    
    profile.failedAttempts = Math.max(0, profile.failedAttempts - 1);
  }

  profile.totalTransactions += 1;
  profile.lastRiskScore = riskResult.score;

  profile.riskHistory.push({ score: riskResult.score, ts: Date.now() });
  if (profile.riskHistory.length > 20) profile.riskHistory.shift();

  return profile;
}

function addTransaction(txn) {
  transactions.unshift(txn); 
  if (transactions.length > MAX_TXN_HISTORY) transactions.pop();
}

function getTransactions({ limit = 50, userId } = {}) {
  let result = transactions;
  if (userId) result = result.filter((t) => t.user_id === userId);
  return result.slice(0, limit);
}

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
  userProfiles, 
};
