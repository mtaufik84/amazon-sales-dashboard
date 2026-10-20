import { CheckCircle2, Circle, TrendingUp } from 'lucide-react';
import { PriorityBadge } from './StatusBadge.jsx';
import { formatINRCompact } from '../lib/format.js';

const pillarColors = {
  Stok: 'bg-success-50 text-success-700 dark:bg-success-950/30 dark:text-success-400',
  Pembatalan: 'bg-danger-50 text-danger-700 dark:bg-danger-950/30 dark:text-danger-400',
  Produk: 'bg-accent-50 text-accent-700 dark:bg-accent-950/40 dark:text-accent-300',
  Pemasaran: 'bg-warning-50 text-warning-700 dark:bg-warning-950/30 dark:text-warning-400',
};

export default function RecommendationCard({ recommendation, featured = false }) {
  const { title, pillar, priority, impact, description, checklist } = recommendation;
  const completed = checklist.filter((c) => c.done).length;

  return (
    <div
      className={`bg-surface border rounded-lg p-5 hover:border-accent-300 dark:hover:border-accent-700 transition-colors animate-slide-up ${
        featured ? 'border-accent-200 dark:border-accent-800 shadow-sm' : 'border-default'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <PriorityBadge priority={priority} />
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-2xs font-medium ${pillarColors[pillar] || 'bg-gray-100 text-gray-600'}`}>
            {pillar}
          </span>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xs text-muted-c uppercase tracking-wider">Dampak</div>
          <div className="text-sm font-semibold text-success-600 dark:text-success-400 tabular-nums flex items-center gap-1">
            <TrendingUp className="w-3 h-3" strokeWidth={1.75} />
            {formatINRCompact(impact)}
          </div>
        </div>
      </div>

      {/* Title & description */}
      <h3 className={`text-primary-c font-medium ${featured ? 'text-base' : 'text-sm'} mb-1.5`}>
        {title}
      </h3>
      <p className="text-xs text-secondary-c leading-relaxed mb-4">{description}</p>

      {/* Checklist */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-2xs font-medium text-muted-c uppercase tracking-wider">Rencana Aksi</span>
          <span className="text-2xs text-muted-c tabular-nums">{completed}/{checklist.length} selesai</span>
        </div>
        {checklist.map((item, i) => (
          <div key={i} className="flex items-start gap-2 group">
            {item.done ? (
              <CheckCircle2 className="w-4 h-4 text-success-500 shrink-0 mt-0.5" strokeWidth={1.75} />
            ) : (
              <Circle className="w-4 h-4 text-muted-c shrink-0 mt-0.5 group-hover:text-accent-500 transition-colors" strokeWidth={1.75} />
            )}
            <span className={`text-xs ${item.done ? 'text-muted-c line-through' : 'text-secondary-c'}`}>
              {item.text}
            </span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-1 bg-subtle rounded-full overflow-hidden">
        <div
          className="h-full bg-success-500 transition-all duration-500"
          style={{ width: `${(completed / checklist.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
