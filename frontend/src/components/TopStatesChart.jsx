import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { formatINRCompact } from '../lib/format.js';
import { TopStatesSkeleton } from './Skeletons.jsx';

function CustomTooltip({ active, payload }) {
  if (!active || !payload.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-surface border border-default rounded-md shadow-lg px-3 py-2 text-xs animate-fade-in">
      <div className="text-primary-c font-medium">{data.state}</div>
      <div className="text-muted-c mt-0.5">Pendapatan: <span className="text-primary-c tabular-nums">{formatINRCompact(data.revenue)}</span></div>
      <div className="text-muted-c">Pesanan: <span className="text-primary-c tabular-nums">{data.orders.toLocaleString('en-IN')}</span></div>
    </div>
  );
}

export default function TopStatesChart({ data, loading }) {
  if (loading) {
    return <TopStatesSkeleton />;
  }

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-sm font-medium text-primary-c">7 Negara Bagian Teratas</h3>
        <p className="text-2xs text-muted-c mt-0.5">Berdasarkan pendapatan</p>
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
            dataKey="state"
            tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
            tickLine={false}
            axisLine={false}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-subtle)' }} />
          <Bar dataKey="revenue" radius={[0, 3, 3, 0]} barSize={20} animationDuration={600}>
            {data.map((_, i) => (
              <Cell key={i} fill={i === 0 ? '#2457FF' : i < 3 ? '#5a7fff' : '#b4c7ff'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
