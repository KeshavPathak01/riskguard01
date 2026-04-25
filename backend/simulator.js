/**
 * simulator.js — Realistic Transaction Simulator
 *
 * Fires synthetic transactions via the REST API every 2 seconds.
 * Covers all risk scenarios: normal, high-velocity, large-amount,
 * new-device, geo-jump, failed attempts, and critical combos.
 *
 * To scale: replace the HTTP self-call with a Kafka producer.
 * Topic: "transactions.raw" → consumers call processTransaction()
 */

const http = require('http');

// ─── User Pool ─────────────────────────────────────────────────────────────────
const USERS = ['U1', 'U2', 'U3', 'U4', 'U5'];

const DEVICES = {
  U1: ['D-iPhone-14', 'D-MacBook-Safari'],
  U2: ['D-Pixel-7', 'D-Chrome-Win'],
  U3: ['D-Samsung-S23'],
  U4: ['D-Firefox-Mac'],
  U5: ['D-iPad-Pro'],
};

const LOCATIONS = {
  U1: ['New York', 'Boston'],
  U2: ['Chicago', 'Detroit'],
  U3: ['Los Angeles'],
  U4: ['San Francisco', 'Oakland'],
  U5: ['Seattle'],
};

// ─── Scenario Templates ────────────────────────────────────────────────────────
const SCENARIOS = [
  // Normal — low risk
  () => {
    const uid = USERS[Math.floor(Math.random() * USERS.length)];
    return {
      user_id: uid,
      amount: Math.floor(Math.random() * 500) + 20,       // $20-$520
      device_id: DEVICES[uid][0],
      location: LOCATIONS[uid][0],
      failedCount: 0,
    };
  },
  // Normal — low risk (repeat user)
  () => {
    const uid = USERS[Math.floor(Math.random() * USERS.length)];
    return {
      user_id: uid,
      amount: Math.floor(Math.random() * 800) + 100,
      device_id: DEVICES[uid][0],
      location: LOCATIONS[uid][0],
      failedCount: 0,
    };
  },
  // Large sudden amount — medium/high risk
  () => ({
    user_id: USERS[Math.floor(Math.random() * USERS.length)],
    amount: Math.floor(Math.random() * 40000) + 15000,    // $15k-$55k
    device_id: 'D-Pixel-7',
    location: 'Chicago',
    failedCount: 0,
  }),
  // New unknown device — medium risk
  () => {
    const uid = USERS[Math.floor(Math.random() * USERS.length)];
    return {
      user_id: uid,
      amount: Math.floor(Math.random() * 1000) + 200,
      device_id: 'D-Unknown-' + Math.floor(Math.random() * 99),
      location: LOCATIONS[uid][0],
      failedCount: 0,
    };
  },
  // Geo jump — high risk
  () => {
    const uid = USERS[Math.floor(Math.random() * USERS.length)];
    return {
      user_id: uid,
      amount: Math.floor(Math.random() * 2000) + 500,
      device_id: DEVICES[uid][0],
      location: ['Dubai', 'Moscow', 'Singapore', 'Frankfurt'][Math.floor(Math.random() * 4)],
      failedCount: 0,
    };
  },
  // Failed attempts — medium risk
  () => {
    const uid = USERS[Math.floor(Math.random() * USERS.length)];
    return {
      user_id: uid,
      amount: Math.floor(Math.random() * 500) + 50,
      device_id: DEVICES[uid][0],
      location: LOCATIONS[uid][0],
      failedCount: Math.floor(Math.random() * 5) + 2,    // 2-6 failures
    };
  },
  // Critical combo — very high risk
  () => ({
    user_id: USERS[Math.floor(Math.random() * USERS.length)],
    amount: Math.floor(Math.random() * 30000) + 20000,   // $20k-$50k
    device_id: 'D-VPN-Masked',
    location: 'Unknown',
    failedCount: Math.floor(Math.random() * 8) + 5,      // 5-12 failures
  }),
  // VPN / Tor — critical risk
  () => ({
    user_id: USERS[Math.floor(Math.random() * USERS.length)],
    amount: Math.floor(Math.random() * 5000) + 500,
    device_id: 'D-Tor-Browser',
    location: 'Unknown',
    failedCount: 0,
  }),
];

// Weighted pool — normal transactions appear more frequently
const SCENARIO_POOL = [
  0, 0, 0, 0,   // 4x weight: normal
  1, 1, 1,      // 3x weight: normal-repeat
  2, 2,         // 2x weight: large amount
  3,            // 1x weight: new device
  4,            // 1x weight: geo jump
  5,            // 1x weight: failed attempts
  6,            // 1x weight: critical combo
  7,            // 1x weight: VPN
];

// ─── HTTP Poster ───────────────────────────────────────────────────────────────
function postTransaction(payload) {
  const body = JSON.stringify(payload);

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/transaction',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => (data += chunk));
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        const { txn_id, user_id, risk } = parsed.data || {};
        if (txn_id) {
          const flag = risk.score >= 70 ? ' 🚨 FLAGGED' : '';
          console.log(
            `[SIM] ${user_id} | $${payload.amount} | Risk: ${risk.score} (${risk.level})${flag}`
          );
        }
      } catch (_) {}
    });
  });

  req.on('error', (err) => {
    // Silently retry — server may still be starting
    if (err.code !== 'ECONNREFUSED') {
      console.error('[SIM] Error:', err.message);
    }
  });

  req.write(body);
  req.end();
}

// ─── Burst Mode ────────────────────────────────────────────────────────────────
// Occasionally fire 4 rapid transactions for the same user to trigger velocity rule
function fireBurst() {
  const uid = USERS[Math.floor(Math.random() * USERS.length)];
  for (let i = 0; i < 4; i++) {
    setTimeout(() => {
      postTransaction({
        user_id: uid,
        amount: Math.floor(Math.random() * 300) + 100,
        device_id: DEVICES[uid][0],
        location: LOCATIONS[uid][0],
        failedCount: 0,
        timestamp: Date.now(),
      });
    }, i * 300); // 300ms apart — within the 60s velocity window
  }
}

// ─── Main Interval ─────────────────────────────────────────────────────────────
function startSimulator() {
  console.log('[SIM] Transaction simulator started — firing every 2s');

  let tick = 0;

  setInterval(() => {
    tick++;

    // Every 15th tick (~30s): fire a burst
    if (tick % 15 === 0) {
      console.log('[SIM] 🔥 Firing velocity burst...');
      fireBurst();
      return;
    }

    // Pick a random scenario from the weighted pool
    const idx = SCENARIO_POOL[Math.floor(Math.random() * SCENARIO_POOL.length)];
    const payload = SCENARIOS[idx]();
    payload.timestamp = Date.now();

    postTransaction(payload);
  }, 2000);
}

module.exports = { startSimulator };
