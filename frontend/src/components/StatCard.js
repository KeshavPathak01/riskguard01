// src/components/StatCard.js
import React from 'react';

/**
 * Reusable stat tile for the dashboard overview row.
 *
 * Props:
 *   label    string  — metric label
 *   value    string|number
 *   sub      string  — optional sub-label
 *   icon     ReactNode
 *   color    string  — 'blue' | 'rose' | 'amber' | 'emerald' | 'indigo'
 *   glow     bool    — enable subtle glow shadow
 */

const COLOR_MAP = {
  blue:    { text: 'text-blue-400',    bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   glow: 'shadow-blue-900/30' },
  rose:    { text: 'text-rose-400',    bg: 'bg-rose-500/10',   border: 'border-rose-500/20',   glow: 'shadow-rose-900/30' },
  amber:   { text: 'text-amber-400',   bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  glow: 'shadow-amber-900/30' },
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10',border: 'border-emerald-500/20',glow: 'shadow-emerald-900/30' },
  indigo:  { text: 'text-indigo-400',  bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', glow: 'shadow-indigo-900/30' },
};

export default function StatCard({ label, value, sub, icon, color = 'blue', glow = false }) {
  const c = COLOR_MAP[color] || COLOR_MAP.blue;

  return (
    <div className={`glass rounded-2xl p-5 border ${c.border} flex flex-col gap-3 transition-all duration-300
      hover:-translate-y-1 ${glow ? `hover:shadow-lg ${c.glow}` : ''}`}>

      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</p>
        <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center ${c.text}`}>
          {icon}
        </div>
      </div>

      <div>
        <p className={`text-3xl font-black tracking-tight ${c.text}`}>{value ?? '—'}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}
