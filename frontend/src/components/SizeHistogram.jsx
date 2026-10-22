import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { formatNumber, formatPercent } from '../lib/format.js';
import { SizeHistogramSkeleton } from './Skeletons.jsx';

function CustomTooltip({ active, payload }) {
  if (!active || !payload.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-surface border border-default rounded-md shadow-lg px-3 py-2 text-xs animate-fade-in">
      <div className="text-primary-c font-medium">Ukuran {data.size}</div>
      <div className="text-muted-c mt-0.5">Unit: <span className="text-primary-c tabular-nums">{formatNumber(data.qty)}</span></div>
      <div className="text-muted-c">Pangsa: <span className="text-primary-c tabular-nums">{formatPercent(data.percentage)}</span></div>
    </div>
  );
}

export default function SizeHistogram({ data, loading }) {
  if (loading) {
    return <SizeHistogramSkeleton />;
  }

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-sm font-medium text-primary-c">Distribusi Ukuran</h3>
        <p className="text-2xs text-muted-c mt-0.5">Unit terjual per ukuran</p>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 0, right: 5, bottom: 5, left: 0 }}>
          <XAxis
            dataKey="size"
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--border-subtle)' }}
          />
          <YAxis
            tickFormatter={(v) => formatNumber(v)}
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-subtle)' }} />
          <Bar dataKey="qty" radius={[3, 3, 0, 0]} barSize={32} animationDuration={600}>
            {data.map((_, i) => (
              <Cell key={i} fill={i === Math.floor(data.length / 2) ? '#2457FF' : '#b4c7ff'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
