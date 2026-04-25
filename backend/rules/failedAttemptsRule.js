

const WEIGHT = 10; 

function evaluate(txn, userProfile) {
  
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
