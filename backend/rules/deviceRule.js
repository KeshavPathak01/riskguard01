/**
 * rules/deviceRule.js
 *
 * Detects transactions from new or unrecognized devices.
 *
 * Logic:
 *  - Check if txn.device_id appears in user's knownDevices list
 *  - Suspended devices or unknown device strings also score high
 */

const WEIGHT = 20; // max contribution to total risk score

const SUSPICIOUS_KEYWORDS = ['unknown', 'vpn', 'tor', 'bot', 'headless', 'phantom'];

/**
 * @param {object} txn         - Incoming transaction
 * @param {object} userProfile - User's stored profile from store.js
 * @returns {{ score: number, weight: number, reason: string|null }}
 */
function evaluate(txn, userProfile) {
  const deviceId = (txn.device_id || '').toLowerCase();
  const knownDevices = userProfile.knownDevices || [];

  let score = 0;
  let reason = null;

  const isSuspicious = SUSPICIOUS_KEYWORDS.some((kw) => deviceId.includes(kw));

  if (isSuspicious) {
    score = 100;
    reason = `Transaction from suspicious device identifier: "${txn.device_id}"`;
  } else if (!deviceId) {
    score = 80;
    reason = 'No device identifier provided';
  } else if (!knownDevices.includes(txn.device_id)) {
    score = 70;
    reason = `New unrecognized device: "${txn.device_id}"`;
  }

  return { score, weight: WEIGHT, reason };
}

module.exports = { evaluate, WEIGHT };
