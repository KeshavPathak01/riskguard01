

const WEIGHT = 25; 
const WINDOW_MS = 60 * 1000; 

function evaluate(txn, userProfile) {
  const now = txn.timestamp || Date.now();
  const recentTs = userProfile.recentTimestamps || [];

  const txnsInWindow = recentTs.filter((ts) => now - ts <= WINDOW_MS).length;

  let score = 0;
  let reason = null;

  if (txnsInWindow >= 8) {
    score = 100;
    reason = `${txnsInWindow} transactions in the last 60s — extremely high velocity`;
  } else if (txnsInWindow >= 5) {
    score = 80;
    reason = `${txnsInWindow} transactions in the last 60s — high velocity`;
  } else if (txnsInWindow >= 3) {
    score = 50;
    reason = `${txnsInWindow} transactions in the last 60s — elevated velocity`;
  } else if (txnsInWindow >= 2) {
    score = 20;
    reason = `${txnsInWindow} transactions in the last 60s — slightly elevated`;
  }

  return { score, weight: WEIGHT, reason };
}

module.exports = { evaluate, WEIGHT };
