

const http = require('http');

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

const SCENARIOS = [
  
  () => {
    const uid = USERS[Math.floor(Math.random() * USERS.length)];
    return {
      user_id: uid,
      amount: Math.floor(Math.random() * 500) + 20,       
      device_id: DEVICES[uid][0],
      location: LOCATIONS[uid][0],
      failedCount: 0,
    };
  },
  
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
  
  () => ({
    user_id: USERS[Math.floor(Math.random() * USERS.length)],
    amount: Math.floor(Math.random() * 40000) + 15000,    
    device_id: 'D-Pixel-7',
    location: 'Chicago',
    failedCount: 0,
  }),
  
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
  
  () => {
    const uid = USERS[Math.floor(Math.random() * USERS.length)];
    return {
      user_id: uid,
      amount: Math.floor(Math.random() * 500) + 50,
      device_id: DEVICES[uid][0],
      location: LOCATIONS[uid][0],
      failedCount: Math.floor(Math.random() * 5) + 2,    
    };
  },
  
  () => ({
    user_id: USERS[Math.floor(Math.random() * USERS.length)],
    amount: Math.floor(Math.random() * 30000) + 20000,   
    device_id: 'D-VPN-Masked',
    location: 'Unknown',
    failedCount: Math.floor(Math.random() * 8) + 5,      
  }),
  
  () => ({
    user_id: USERS[Math.floor(Math.random() * USERS.length)],
    amount: Math.floor(Math.random() * 5000) + 500,
    device_id: 'D-Tor-Browser',
    location: 'Unknown',
    failedCount: 0,
  }),
];

const SCENARIO_POOL = [
  0, 0, 0, 0,   
  1, 1, 1,      
  2, 2,         
  3,            
  4,            
  5,            
  6,            
  7,            
];

function postTransaction(payload) {
  const body = JSON.stringify(payload);

  const options = {
    hostname: 'localhost',
    port: process.env.PORT || 5000,
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
    
    if (err.code !== 'ECONNREFUSED') {
      console.error('[SIM] Error:', err.message);
    }
  });

  req.write(body);
  req.end();
}

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
    }, i * 300); 
  }
}

function startSimulator() {
  console.log('[SIM] Transaction simulator started — firing every 2s');

  let tick = 0;

  setInterval(() => {
    tick++;

    if (tick % 15 === 0) {
      console.log('[SIM] 🔥 Firing velocity burst...');
      fireBurst();
      return;
    }

    const idx = SCENARIO_POOL[Math.floor(Math.random() * SCENARIO_POOL.length)];
    const payload = SCENARIOS[idx]();
    payload.timestamp = Date.now();

    postTransaction(payload);
  }, 2000);
}

module.exports = { startSimulator };
