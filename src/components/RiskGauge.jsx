import { useEffect, useState } from 'react';

export default function RiskGauge({ probability, riskLevel }) {
  const [animatedProb, setAnimatedProb] = useState(0);

  useEffect(() => {
    const duration = 800;
    let start;
    let frame;
    const animate = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedProb(probability * eased);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [probability]);

  const radius = 80;
  const circumference = Math.PI * radius;
  const dashOffset = circumference - (animatedProb / 100) * circumference;

  const color = riskLevel === 'Tinggi' ? '#ef4444' : riskLevel === 'Sedang' ? '#f59e0b' : '#10b981';

  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="120" viewBox="0 0 200 120">
        {/* Background arc */}
        <path
          d={`M 20,100 A ${radius},${radius} 0 0,1 180,100`}
          fill="none"
          stroke="var(--bg-subtle)"
          strokeWidth={12}
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <path
          d={`M 20,100 A ${radius},${radius} 0 0,1 180,100`}
          fill="none"
          stroke={color}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke 0.3s ease' }}
        />
        {/* Ticks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const angle = Math.PI - (tick / 100) * Math.PI;
          const x1 = 100 + Math.cos(angle) * (radius - 2);
          const y1 = 100 - Math.sin(angle) * (radius - 2);
          const x2 = 100 + Math.cos(angle) * (radius + 8);
          const y2 = 100 - Math.sin(angle) * (radius + 8);
          return (
            <line
              key={tick}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="var(--border-default)"
              strokeWidth={1}
            />
          );
        })}
        <text
          x="100"
          y="85"
          textAnchor="middle"
          className="text-2xl font-semibold fill-current text-primary-c tabular-nums"
          style={{ fontSize: '28px', fontWeight: 600 }}
        >
          {animatedProb.toFixed(1)}%
        </text>
        <text
          x="100"
          y="105"
          textAnchor="middle"
          className="fill-current text-muted-c"
          style={{ fontSize: '10px' }}
        >
          Probabilitas Pembatalan
        </text>
      </svg>
    </div>
  );
}
