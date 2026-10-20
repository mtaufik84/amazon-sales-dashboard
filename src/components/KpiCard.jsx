import { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Sparkline from './Sparkline.jsx';
import { formatINR, formatNumber, formatPercent } from '../lib/format.js';

function CountUp({ value, format }) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef();
  const startRef = useRef();

  useEffect(() => {
    const duration = 800;
    cancelAnimationFrame(frameRef.current);
    startRef.current = undefined;

    const animate = (ts) => {
      if (startRef.current === undefined) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value]);

  if (format === 'currency') return formatINR(display);
  if (format === 'percent') return formatPercent(display);
  return formatNumber(Math.round(display));
}

export default function KpiCard({ label, value, format, delta, sparkline, positive, loading }) {
  if (loading) {
    return (
      <div className="bg-surface border border-default rounded-lg p-5 space-y-3">
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-7 w-32 rounded" />
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-10 w-full rounded" />
      </div>
    );
  }

  const isPositive = delta > 0;
  const isGood = positive ? isPositive : !isPositive;
  const sparkColor = isGood ? '#10b981' : '#ef4444';

  return (
    <div className="bg-surface border border-default rounded-lg p-5 hover:border-accent-300 dark:hover:border-accent-700 transition-colors">
      <div className="text-2xs font-medium text-muted-c uppercase tracking-wider">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-primary-c tabular-nums">
        <CountUp value={value} format={format} />
      </div>
      <div className="mt-1 flex items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-0.5 text-xs font-medium tabular-nums ${
            isGood ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-3 h-3" strokeWidth={1.75} />
          ) : (
            <TrendingDown className="w-3 h-3" strokeWidth={1.75} />
          )}
          {delta > 0 ? '+' : ''}
          {delta.toFixed(1)}%
        </span>
        <span className="text-2xs text-muted-c">vs Apr 2022</span>
      </div>
      <div className="mt-3">
        <Sparkline data={sparkline} color={sparkColor} height={32} />
      </div>
    </div>
  );
}
