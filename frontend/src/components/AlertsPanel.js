
import React from 'react';

function formatTime(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function AlertRow({ alert, onDismiss }) {
  const risk = alert.risk || { score: 0, reasons: [] };

  return (
    <div className="group flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-rose-500/10
      hover:border-rose-500/25 transition-all duration-200 animate-fade-slide">

      {}
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20
        flex items-center justify-center">
        <svg className="w-4 h-4 text-rose-400" style={{width:16,height:16}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      {}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold text-slate-200">
            {alert.user_id}
            <span className="ml-2 text-rose-400 font-black">Score: {risk.score}</span>
          </p>
          <p className="text-[10px] text-slate-500 flex-shrink-0">{formatTime(alert.receivedAt)}</p>
        </div>

        <p className="text-[11px] text-slate-400 mt-0.5">
          ₹{(alert.amount || 0).toLocaleString()}
          {alert.device_id && <> · {alert.device_id}</>}
          {alert.location && <> · {alert.location}</>}
        </p>

        {risk.reasons && risk.reasons[0] && (
          <p className="text-[10px] text-rose-300/70 mt-1 truncate">{risk.reasons[0]}</p>
        )}
      </div>

      {}
      <button
        onClick={() => onDismiss(alert.txn_id)}
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200
          w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center"
        title="Dismiss alert"
      >
        <svg className="w-3 h-3 text-slate-400" style={{width:12,height:12}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function AlertsPanel({ alerts = [], onDismiss }) {
  return (
    <div className="glass rounded-2xl border border-rose-500/10 flex flex-col">
      {}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-500 shadow-lg shadow-rose-500/50" style={{ boxShadow: '0 0 8px #f87171' }} />
          <h2 className="text-sm font-bold text-slate-200">Active Alerts</h2>
        </div>
        {alerts.length > 0 && (
          <span className="text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
            {alerts.length} flagged
          </span>
        )}
      </div>

      {}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[380px]">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-600">
            <svg className="w-8 h-8 mb-2 opacity-30" style={{width:32,height:32}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs">No active alerts — system clear</p>
          </div>
        ) : (
          alerts.slice(0, 20).map((alert) => (
            <AlertRow key={alert.txn_id} alert={alert} onDismiss={onDismiss} />
          ))
        )}
      </div>
    </div>
  );
}
