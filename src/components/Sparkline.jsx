import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function Sparkline({ data, color = '#2457FF', height = 36 }) {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={true}
          animationDuration={600}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
