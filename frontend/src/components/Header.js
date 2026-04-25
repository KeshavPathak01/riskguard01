// src/components/Header.js
import React from 'react';

/**
 * Header component — shows branding, live connection badge, and real-time clock.
 */
export default function Header({ connected, stats }) {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="glass rounded-2xl px-6 py-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Brand */}
      <div className="flex items-center gap-3">
        {/* Shield icon */}
        <div className="relative flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-900/40">
          <svg className="w-6 h-6 text-white" style={{width:24, height:24}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>

        <div>
          <h1 className="text-xl font-bold tracking-tight text-white leading-none">
            RiskGuard
            <span className="ml-2 text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full align-middle">
              FINTECH
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Real-time fraud detection engine</p>
        </div>
      </div>

      {/* Right strip */}
      <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-end">
        {/* Quick stats */}
        <div className="hidden md:flex items-center gap-5 text-center">
          <div>
            <p className="text-lg font-bold text-white">{stats.total ?? 0}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Transactions</p>
          </div>
          <div className="h-8 w-px bg-slate-700" />
          <div>
            <p className="text-lg font-bold text-rose-400">{stats.alertCount ?? 0}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Alerts</p>
          </div>
          <div className="h-8 w-px bg-slate-700" />
          <div>
            <p className="text-lg font-bold text-emerald-400">{stats.usersMonitored ?? 0}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Users</p>
          </div>
        </div>

        {/* Clock */}
        <div className="text-xs font-mono text-slate-400 hidden lg:block">
          {time.toLocaleTimeString()}
        </div>

        {/* Connection status */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border
          ${connected
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
          <span className="relative flex h-2 w-2">
            {connected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${connected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          </span>
          {connected ? 'Live' : 'Disconnected'}
        </div>
      </div>
    </header>
  );
}
