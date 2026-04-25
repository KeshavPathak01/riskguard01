/**
 * riskEngine.js — Modular Risk Aggregator
 *
 * Loads all rule modules, evaluates each one, and computes a
 * weighted composite risk score (0-100) with explainable reasons.
 *
 * Adding a new rule:
 *  1. Create rules/myRule.js exporting { evaluate, WEIGHT }
 *  2. Add it to the RULES array below — done.
 */

const amountRule = require('./rules/amountRule');
const velocityRule = require('./rules/velocityRule');
const deviceRule = require('./rules/deviceRule');
const locationRule = require('./rules/locationRule');
const failedAttemptsRule = require('./rules/failedAttemptsRule');

// ─── Rule Registry ─────────────────────────────────────────────────────────────
// Each rule must export { evaluate(txn, userProfile), WEIGHT }
// WEIGHT = maximum points this rule can contribute to the final score.
// Total WEIGHT should sum to 100.
const RULES = [
  { name: 'Large Amount',       module: amountRule },        // weight 25
  { name: 'High Velocity',      module: velocityRule },      // weight 25
  { name: 'New/Unknown Device', module: deviceRule },        // weight 20
  { name: 'New/Risky Location', module: locationRule },      // weight 20
  { name: 'Failed Attempts',    module: failedAttemptsRule },// weight 10
];

// Verify weights sum to 100 on startup
const totalWeight = RULES.reduce((s, r) => s + r.module.WEIGHT, 0);
if (totalWeight !== 100) {
  console.warn(`[RiskEngine] Rule weights sum to ${totalWeight}, expected 100`);
}

// ─── Score Level Helper ────────────────────────────────────────────────────────
function getLevel(score) {
  if (score >= 70) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
}

// ─── Main Scoring Function ─────────────────────────────────────────────────────

/**
 * Calculate the composite risk score for a transaction.
 *
 * @param {object} txn         - The incoming transaction object
 * @param {object} userProfile - The user's profile from store.js
 * @returns {{
 *   score: number,        // 0-100 composite risk score
 *   level: string,        // 'LOW' | 'MEDIUM' | 'HIGH'
 *   reasons: string[],    // human-readable explanations
 *   breakdown: object[]   // per-rule contribution details
 * }}
 */
function calculateRisk(txn, userProfile) {
  let compositeScore = 0;
  const reasons = [];
  const breakdown = [];

  for (const rule of RULES) {
    const result = rule.module.evaluate(txn, userProfile);

    // Normalize: rule score (0-100) × weight / 100 = weighted contribution
    const contribution = Math.round((result.score / 100) * rule.module.WEIGHT);
    compositeScore += contribution;

    breakdown.push({
      rule: rule.name,
      rawScore: result.score,
      weight: rule.module.WEIGHT,
      contribution,
    });

    if (result.reason) {
      reasons.push(result.reason);
    }
  }

  // Cap at 100
  compositeScore = Math.min(100, Math.round(compositeScore));

  const level = getLevel(compositeScore);

  // Provide a default reason if nothing fired
  if (reasons.length === 0) {
    reasons.push('No anomalies detected — normal transaction behavior');
  }

  return {
    score: compositeScore,
    level,
    reasons,
    breakdown,
  };
}

module.exports = calculateRisk;
