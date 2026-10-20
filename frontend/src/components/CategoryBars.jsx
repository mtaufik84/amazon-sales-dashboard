import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { formatINRCompact, formatPercent } from '../lib/format.js';

function CustomTooltip({ active, payload }) {
  if (!active || !payload.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-surface border border-default rounded-md shadow-lg px-3 py-2 text-xs animate-fade-in">
      <div className="text-primary-c font-medium">{data.category}</div>
      <div className="text-muted-c mt-0.5">Pendapatan: <span className="text-primary-c tabular-nums">{formatINRCompact(data.revenue)}</span></div>
      <div className="text-muted-c">Pangsa: <span className="text-primary-c tabular-nums">{formatPercent(data.share)}</span></div>
    </div>
  );
}

export default function CategoryBars({ data, loading }) {
  if (loading) {
    return <div className="skeleton h-[280px] w-full rounded-lg" />;
  }

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-sm font-medium text-primary-c">Kontribusi Kategori</h3>
        <p className="text-2xs text-muted-c mt-0.5">Pangsa pendapatan per kategori</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
          <XAxis
            type="number"
            tickFormatter={(v) => formatINRCompact(v)}
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="category"
            tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
            tickLine={false}
            axisLine={false}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-subtle)' }} />
          <Bar dataKey="revenue" radius={[0, 3, 3, 0]} barSize={18} animationDuration={600}>
            {data.map((_, i) => (
              <Cell key={i} fill={i === 0 ? '#2457FF' : '#8aa6ff'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
