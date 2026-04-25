/**
 * rules/amountRule.js
 *
 * Detects suspiciously large or sudden transaction amounts.
 *
 * Logic:
 *  - Compare txn.amount against user's rolling average of last 10 transactions
 *  - If no history, use global thresholds
 *  - Sudden spike (> 5x avg) = high risk
 */

const WEIGHT = 25; // max contribution to total risk score

/**
 * @param {object} txn         - Incoming transaction
 * @param {object} userProfile - User's stored profile from store.js
 * @returns {{ score: number, weight: number, reason: string|null }}
 */
function evaluate(txn, userProfile) {
  const amount = txn.amount || 0;
  let score = 0;
  let reason = null;

  const history = userProfile.recentAmounts || [];

  if (history.length >= 3) {
    // Calculate rolling average from recent transactions
    const avg = history.reduce((s, a) => s + a, 0) / history.length;
    const ratio = amount / avg;

    if (ratio >= 10) {
      score = 100;
      reason = `Amount ₹${amount.toLocaleString()} is ${ratio.toFixed(1)}x above your average (₹${Math.round(avg).toLocaleString()})`;
    } else if (ratio >= 5) {
      score = 80;
      reason = `Amount ₹${amount.toLocaleString()} is ${ratio.toFixed(1)}x above your average (₹${Math.round(avg).toLocaleString()})`;
    } else if (ratio >= 3) {
      score = 50;
      reason = `Amount ₹${amount.toLocaleString()} is ${ratio.toFixed(1)}x above your average (₹${Math.round(avg).toLocaleString()})`;
    } else if (amount > 10000) {
      score = 30;
      reason = `Large transaction: ₹${amount.toLocaleString()}`;
    }
  } else {
    // No history — use absolute thresholds
    if (amount >= 50000) {
      score = 90;
      reason = `Very large transaction: ₹${amount.toLocaleString()} (no prior history)`;
    } else if (amount >= 20000) {
      score = 70;
      reason = `Large transaction: ₹${amount.toLocaleString()} (no prior history)`;
    } else if (amount >= 10000) {
      score = 40;
      reason = `Elevated transaction: ₹${amount.toLocaleString()} (no prior history)`;
    }
  }

  return { score, weight: WEIGHT, reason };
}

module.exports = { evaluate, WEIGHT };
