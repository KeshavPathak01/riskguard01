/**
 * rules/failedAttemptsRule.js
 *
 * Detects excessive failed transaction or login attempts.
 *
 * Logic:
 *  - Uses txn.failedCount (provided per transaction) + userProfile.failedAttempts (cumulative)
 *  - High failed attempt counts strongly indicate brute-force or account takeover
 */

const WEIGHT = 10; // max contribution to total risk score

/**
 * @param {object} txn         - Incoming transaction
 * @param {object} userProfile - User's stored profile from store.js
 * @returns {{ score: number, weight: number, reason: string|null }}
 */
function evaluate(txn, userProfile) {
  // Combine per-transaction failed count with running user total
  const txnFailed = txn.failedCount || 0;
  const profileFailed = userProfile.failedAttempts || 0;
  const totalFailed = txnFailed + profileFailed;

  let score = 0;
  let reason = null;

  if (totalFailed >= 10) {
    score = 100;
    reason = `${totalFailed} total failed attempts — account compromise likely`;
  } else if (totalFailed >= 5) {
    score = 80;
    reason = `${totalFailed} failed attempts detected`;
  } else if (totalFailed >= 3) {
    score = 50;
    reason = `${totalFailed} failed attempts — elevated suspicion`;
  } else if (totalFailed >= 1) {
    score = 20;
    reason = `${totalFailed} failed attempt(s) on this transaction`;
  }

  return { score, weight: WEIGHT, reason };
}

module.exports = { evaluate, WEIGHT };
