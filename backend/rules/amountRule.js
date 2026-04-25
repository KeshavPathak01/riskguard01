

const WEIGHT = 25; 

function evaluate(txn, userProfile) {
  const amount = txn.amount || 0;
  let score = 0;
  let reason = null;

  const history = userProfile.recentAmounts || [];

  if (history.length >= 3) {
    
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
