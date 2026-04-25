

const amountRule = require('./rules/amountRule');
const velocityRule = require('./rules/velocityRule');
const deviceRule = require('./rules/deviceRule');
const locationRule = require('./rules/locationRule');
const failedAttemptsRule = require('./rules/failedAttemptsRule');

const RULES = [
  { name: 'Large Amount',       module: amountRule },        
  { name: 'High Velocity',      module: velocityRule },      
  { name: 'New/Unknown Device', module: deviceRule },        
  { name: 'New/Risky Location', module: locationRule },      
  { name: 'Failed Attempts',    module: failedAttemptsRule },
];

const totalWeight = RULES.reduce((s, r) => s + r.module.WEIGHT, 0);
if (totalWeight !== 100) {
  console.warn(`[RiskEngine] Rule weights sum to ${totalWeight}, expected 100`);
}

function getLevel(score) {
  if (score >= 70) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
}

function calculateRisk(txn, userProfile) {
  let compositeScore = 0;
  const reasons = [];
  const breakdown = [];

  for (const rule of RULES) {
    const result = rule.module.evaluate(txn, userProfile);

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

  compositeScore = Math.min(100, Math.round(compositeScore));

  const level = getLevel(compositeScore);

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
