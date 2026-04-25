
import React from 'react';

function getRiskMeta(score) {
  if (score >= 70) return {
    label: 'HIGH',
    badge: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    dot: 'bg-rose-500',
    glow: 'bg-rose-500',
  };
  if (score >= 40) return {
    label: 'MEDIUM',
    badge: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    dot: 'bg-amber-500',
    glow: 'bg-amber-500',
  };
  return {
    label: 'LOW',
    badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    dot: 'bg-emerald-500',
    glow: 'bg-emerald-500',
  };
}

function formatTime(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function TxnCard({ txn, index }) {
  const risk = txn.risk || { score: 0, level: 'LOW', reasons: [] };
  const meta = getRiskMeta(risk.score);

  return (
    <div
      className="group relative bg-slate-900/70 border border-slate-700/60 hover:border-slate-500/60
        rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl overflow-hidden txn-card"
      style={{ animationDelay: `${Math.min(index * 30, 150)}ms` }}
    >
      {}
      <div className={`absolute -top-8 -right-8 w-24 h-24 blur-3xl opacity-15 rounded-full ${meta.glow}`} />

      {}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600
            flex items-center justify-center text-xs font-bold text-slate-300">
            {(txn.user_id || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-100">{txn.user_id}</p>
            <p className="text-[10px] text-slate-500">{formatTime(txn.receivedAt || txn.timestamp)}</p>
          </div>
        </div>

        {}
        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${meta.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
          {meta.label} · {risk.score}
        </span>
      </div>

      {}
      <div className="relative z-10 mb-4">
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Amount</p>
        <p className="text-2xl font-black text-slate-100 tracking-tight">
          <span className="text-base text-slate-500 font-bold">₹</span>
          {(txn.amount || 0).toLocaleString()}
        </p>
      </div>

      {}
      {risk.reasons && risk.reasons.length > 0 && risk.reasons[0] !== 'No anomalies detected — normal transaction behavior' && (
        <div className="relative z-10 mb-3">
          <ul className="space-y-1">
            {risk.reasons.slice(0, 2).map((r, i) => (
              <li key={i} className="text-[10px] text-slate-400 flex items-start gap-1.5">
                <span className={`mt-0.5 w-1 h-1 rounded-full flex-shrink-0 ${meta.dot}`} />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {}
      <div className="relative z-10 flex flex-wrap gap-1.5 border-t border-slate-800 pt-3">
        {txn.device_id && txn.device_id.toLowerCase().includes('unknown') && (
          <Chip label="New Device" />
        )}
        {txn.location && ['Unknown', 'Dubai', 'Moscow', 'Singapore', 'Frankfurt'].includes(txn.location) && (
          <Chip label={`⚠ ${txn.location}`} />
        )}
        {txn.failedCount > 0 && (
          <Chip label={`${txn.failedCount} Failed`} />
        )}
        {txn.device_id && (txn.device_id.toLowerCase().includes('vpn') || txn.device_id.toLowerCase().includes('tor')) && (
          <Chip label="🔒 VPN/Tor" danger />
        )}
      </div>
    </div>
  );
}

function Chip({ label, danger = false }) {
  return (
    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border uppercase tracking-wide
      ${danger
        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
      {label}
    </span>
  );
}

export default function TransactionFeed({ transactions = [], onSimulate }) {
  return (
    <div className="glass rounded-2xl border border-slate-700/50 flex flex-col h-full min-h-[480px]">
      {}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <h2 className="text-sm font-bold text-slate-200">Live Transaction Feed</h2>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-500 bg-slate-800/60 border border-slate-700/50 px-2.5 py-1 rounded-full">
            {transactions.length} events
          </span>
          <button
            onClick={onSimulate}
            className="group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
              bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500
              text-white text-[11px] font-bold transition-all duration-200 active:scale-95
              shadow-lg shadow-indigo-900/30"
          >
            <svg className="w-3 h-3" style={{width:12,height:12}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Simulate
          </button>
        </div>
      </div>

      {}
      <div className="flex-1 overflow-y-auto p-4">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-slate-600 animate-pulse">
            <svg className="w-12 h-12 mb-3 opacity-30" style={{width:48,height:48}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0121 9.414V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">Waiting for transactions...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {transactions.slice(0, 20).map((txn, i) => (
              <TxnCard key={txn.txn_id || i} txn={txn} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
