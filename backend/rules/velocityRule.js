/**
 * rules/velocityRule.js
 *
 * Detects high transaction frequency (velocity) within a time window.
 *
 * Logic:
 *  - Count how many transactions occurred in the last 60 seconds
 *  - Compare against thresholds
 */

const WEIGHT = 25; // max contribution to total risk score
const WINDOW_MS = 60 * 1000; // 60-second sliding window

/**
 * @param {object} txn         - Incoming transaction
 * @param {object} userProfile - User's stored profile from store.js
 * @returns {{ score: number, weight: number, reason: string|null }}
 */
function evaluate(txn, userProfile) {
  const now = txn.timestamp || Date.now();
  const recentTs = userProfile.recentTimestamps || [];

  // Count transactions within the last WINDOW_MS
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
