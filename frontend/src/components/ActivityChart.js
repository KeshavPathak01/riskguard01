
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p className="font-semibold text-slate-200 mb-1">{label}</p>
      <p>Avg Risk: <span className="font-bold text-blue-400">{payload[0].value}</span></p>
    </div>
  );
}

function bucketTransactions(transactions, numBuckets = 12) {
  if (!transactions.length) {
    return Array.from({ length: numBuckets }, (_, i) => ({
      label: `T-${numBuckets - i}`,
      avg: 0,
      count: 0,
    }));
  }

  const now = Date.now();
  const windowMs = 60 * 1000; 
  const bucketMs = windowMs / numBuckets;

  const buckets = Array.from({ length: numBuckets }, (_, i) => ({
    label: `-${Math.round((numBuckets - i) * (bucketMs / 1000))}s`,
    scores: [],
  }));

  for (const txn of transactions) {
    const ts = txn.timestamp || txn.receivedAt || now;
    const age = now - ts;
    if (age > windowMs) continue;

    const bucketIdx = Math.min(numBuckets - 1, Math.floor(age / bucketMs));
    const idx = numBuckets - 1 - bucketIdx; 
    buckets[idx].scores.push(txn.risk?.score ?? 0);
  }

  return buckets.map((b) => ({
    label: b.label,
    avg: b.scores.length
      ? Math.round(b.scores.reduce((s, v) => s + v, 0) / b.scores.length)
      : 0,
    count: b.scores.length,
  }));
}

function getBarColor(avg) {
  if (avg >= 70) return '#f87171';
  if (avg >= 40) return '#fbbf24';
  return '#34d399';
}

export default function ActivityChart({ transactions = [] }) {
  const data = React.useMemo(() => bucketTransactions(transactions), [transactions]);

  return (
    <div className="glass rounded-2xl p-5 border border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-200 tracking-wide">Risk Activity (60s window)</h2>
        <span className="text-xs text-slate-500 bg-slate-800/60 px-2 py-1 rounded-lg border border-slate-700/50">
          Avg score / bucket
        </span>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#475569', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#475569', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="avg" radius={[4, 4, 0, 0]} maxBarSize={28}>
            {data.map((entry, i) => (
              <Cell key={i} fill={getBarColor(entry.avg)} fillOpacity={entry.count ? 0.85 : 0.15} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
