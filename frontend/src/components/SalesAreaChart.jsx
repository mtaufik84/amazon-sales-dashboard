import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { formatDateShort, formatINRCompact } from '../lib/format.js';
import { SalesChartSkeleton } from './Skeletons.jsx';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload.length) return null;
  return (
    <div className="bg-surface border border-default rounded-md shadow-lg px-3 py-2 text-xs animate-fade-in">
      <div className="text-muted-c mb-1.5">{label}</div>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color || entry.stroke }}
          />
          <span className="text-secondary-c">
            {entry.dataKey === 'ma7' ? 'MA 7-hari' : 'Pendapatan'}
          </span>
          <span className="text-primary-c font-medium tabular-nums ml-auto">
            {formatINRCompact(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function SalesAreaChart({ data, loading }) {
  const [showMA, setShowMA] = useState(false);

  if (loading) {
    return <SalesChartSkeleton />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-primary-c">Pendapatan Harian</h3>
          <p className="text-2xs text-muted-c mt-0.5">April – Juni 2022</p>
        </div>
        <button
          onClick={() => setShowMA((v) => !v)}
          className={`flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors focus-ring ${
            showMA
              ? 'bg-accent-50 border-accent-200 text-accent-700 dark:bg-accent-950/40 dark:border-accent-800 dark:text-accent-300'
              : 'bg-surface border-default text-secondary-c hover:text-primary-c'
          }`}
        >
          <span className={`w-3 h-3 rounded-full border-2 transition-colors ${showMA ? 'border-accent-500 bg-accent-500' : 'border-muted-c'}`} />
          Rata-rata 7 hari
        </button>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2457FF" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#2457FF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => formatDateShort(d)}
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--border-subtle)' }}
            interval={14}
          />
          <YAxis
            tickFormatter={(v) => formatINRCompact(v)}
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            tickLine={false}
            axisLine={false}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#2457FF"
            strokeWidth={2}
            fill="url(#revenueGradient)"
            animationDuration={800}
          />
          {showMA && (
            <Area
              type="monotone"
              dataKey="ma7"
              stroke="#0D9488"
              strokeWidth={1.5}
              fill="none"
              strokeDasharray="4 4"
              animationDuration={800}
              dot={false}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
