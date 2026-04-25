

const WEIGHT = 20; 

const SUSPICIOUS_KEYWORDS = ['unknown', 'vpn', 'tor', 'bot', 'headless', 'phantom'];

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
