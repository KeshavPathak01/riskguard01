// backend/server.js
// ─────────────────────────────────────────────────────────
// Real-Time Risk Detection Server
// Express + Socket.IO + MVC Routes + Auto-Simulator
// ─────────────────────────────────────────────────────────

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// ── App Setup ─────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// ── HTTP + Socket.IO Server ───────────────────────────────
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Make io accessible inside controllers via req.app.get('io')
app.set('io', io);

// ── Routes ────────────────────────────────────────────────
const transactionRoutes = require('./routes/transactionRoutes');
const riskRoutes = require('./routes/riskRoutes');
const alertRoutes = require('./routes/alertRoutes');
const store = require('./store');
const calculateRisk = require('./riskEngine');

app.use('/api/transaction', transactionRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/alerts', alertRoutes);

// ── Health Check ──────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), ts: Date.now() });
});

// ── Socket.IO — Real-Time Transaction Channel ─────────────
// Clients can also emit transactions directly over WebSocket
// (in addition to the REST API)
io.on('connection', (socket) => {
  console.log(`[WS] Client connected: ${socket.id}`);

  // Send current stats immediately on connect
  socket.emit('stats_update', store.getStats());

  // Allow clients to push raw transactions over WebSocket
  socket.on('new_txn', (txn) => {
    if (!txn || !txn.user_id || txn.amount === undefined) {
      socket.emit('error', { message: 'Invalid transaction payload' });
      return;
    }

    const userProfile = store.getUser(txn.user_id);
    const risk = calculateRisk(txn, userProfile);
    const enriched = {
      txn_id: `ws-${Date.now()}`,
      ...txn,
      timestamp: txn.timestamp || Date.now(),
      receivedAt: Date.now(),
      risk,
      flagged: risk.score >= 70,
    };

    store.addTransaction(enriched);
    store.updateUser(txn.user_id, txn, risk);

    if (enriched.flagged) {
      store.addAlert(enriched);
      io.emit('new_alert', enriched);
    }

    // Broadcast to all connected dashboard clients
    io.emit('risk_update', enriched);
    io.emit('stats_update', store.getStats());
  });

  socket.on('disconnect', () => {
    console.log(`[WS] Client disconnected: ${socket.id}`);
  });
});

// ── Broadcast stats every 5s ──────────────────────────────
setInterval(() => {
  io.emit('stats_update', store.getStats());
}, 5000);

// ── Start server then simulator ───────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Risk Detection Server running on port ${PORT}`);
  console.log(`   REST:      http://localhost:${PORT}/api`);
  console.log(`   WebSocket: ws://localhost:${PORT}`);
  console.log(`   Health:    http://localhost:${PORT}/health\n`);

  // Start the auto-simulator after 1 second (server is guaranteed up by then)
  setTimeout(() => {
    const { startSimulator } = require('./simulator');
    startSimulator();
  }, 1000);
});