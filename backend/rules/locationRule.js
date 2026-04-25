/**
 * rules/locationRule.js
 *
 * Detects unusual or new geographical locations.
 *
 * Logic:
 *  - Check if location is in user's known locations
 *  - Check for high-risk location keywords
 *  - Detect impossible travel (if last txn was recent but location changed)
 */

const WEIGHT = 20; // max contribution to total risk score

const HIGH_RISK_LOCATIONS = ['unknown', 'vpn', 'tor'];

/**
 * @param {object} txn         - Incoming transaction
 * @param {object} userProfile - User's stored profile from store.js
 * @returns {{ score: number, weight: number, reason: string|null }}
 */
function evaluate(txn, userProfile) {
  const location = (txn.location || '').trim();
  const locationLower = location.toLowerCase();
  const knownLocations = userProfile.knownLocations || [];
  const recentTs = userProfile.recentTimestamps || [];

  let score = 0;
  let reason = null;

  // High-risk / anonymous locations
  if (!location) {
    score = 80;
    reason = 'Transaction location is missing';
    return { score, weight: WEIGHT, reason };
  }

  if (HIGH_RISK_LOCATIONS.some((h) => locationLower.includes(h))) {
    score = 100;
    reason = `Transaction from high-risk location: "${location}"`;
    return { score, weight: WEIGHT, reason };
  }

  const isNewLocation = !knownLocations.includes(location);

  if (isNewLocation) {
    // Check for possible impossible travel:
    // If user transacted somewhere recently (< 30 min) from a different location
    const lastTs = recentTs.length > 0 ? recentTs[recentTs.length - 1] : null;
    const now = txn.timestamp || Date.now();
    const timeDiffMin = lastTs ? (now - lastTs) / 60000 : Infinity;

    if (knownLocations.length > 0 && timeDiffMin < 30) {
      score = 100;
      reason = `Impossible travel detected: new location "${location}" within ${Math.round(timeDiffMin)} min of previous transaction`;
    } else {
      score = 60;
      reason = `Transaction from new location: "${location}"`;
    }
  }

  return { score, weight: WEIGHT, reason };
}

module.exports = { evaluate, WEIGHT };
