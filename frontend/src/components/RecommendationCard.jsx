import { useState } from 'react';
import { CheckCircle2, Circle, TrendingUp } from 'lucide-react';
import { PriorityBadge } from './StatusBadge.jsx';

// Kategori & dampak berasal dari API asli: impact berupa teks (bukan angka
// formatINR), checklist action_items; toggle selesai disimpan di klien
// (perilaku lama: "Tandai Dilakukan").
const categoryColors = {
  'Inventaris & Stok': 'bg-success-50 text-success-700 dark:bg-success-950/30 dark:text-success-400',
  'Mitigasi Pembatalan': 'bg-danger-50 text-danger-700 dark:bg-danger-950/30 dark:text-danger-400',
  'Optimalisasi Fulfilment': 'bg-accent-50 text-accent-700 dark:bg-accent-950/40 dark:text-accent-300',
  'Promosi & Bundling': 'bg-warning-50 text-warning-700 dark:bg-warning-950/30 dark:text-warning-400',
  'Wilayah & Ekspansi': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export default function RecommendationCard({ recommendation, featured = false }) {
  const { title, category, priority, metric_highlight, description, action_items } = recommendation;
  const [done, setDone] = useState(() => (action_items || []).map(() => false));
  const completed = done.filter(Boolean).length;
  const items = action_items || [];

  const toggle = (i) => setDone((prev) => prev.map((d, j) => (j === i ? !d : d)));

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
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-2xs font-medium ${categoryColors[category] || 'bg-gray-100 text-gray-600'}`}>
            {category}
          </span>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xs text-muted-c uppercase tracking-wider">Fokus Metrik</div>
          <div className="text-sm font-semibold text-success-600 dark:text-success-400 flex items-center justify-end gap-1">
            <TrendingUp className="w-3 h-3 shrink-0" strokeWidth={1.75} />
            {metric_highlight || ''}
          </div>
        </div>
      </div>

      {/* Title & description */}
      <h3 className={`text-primary-c font-medium ${featured ? 'text-base' : 'text-sm'} mb-1.5`}>
        {title}
      </h3>
      <p className="text-xs text-secondary-c leading-relaxed mb-3">{description}</p>
      {recommendation.impact && (
        <p className="text-2xs text-muted-c mb-3">{recommendation.impact}</p>
      )}

      {/* Checklist */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-2xs font-medium text-muted-c uppercase tracking-wider">Rencana Aksi</span>
          <span className="text-2xs text-muted-c tabular-nums">{completed}/{items.length} selesai</span>
        </div>
        {items.map((text, i) => (
          <button key={i} onClick={() => toggle(i)} className="flex items-start gap-2 group text-left w-full">
            {done[i] ? (
              <CheckCircle2 className="w-4 h-4 text-success-500 shrink-0 mt-0.5" strokeWidth={1.75} />
            ) : (
              <Circle className="w-4 h-4 text-muted-c shrink-0 mt-0.5 group-hover:text-accent-500 transition-colors" strokeWidth={1.75} />
            )}
            <span className={`text-xs ${done[i] ? 'text-muted-c line-through' : 'text-secondary-c'}`}>
              {text}
            </span>
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-1 bg-subtle rounded-full overflow-hidden">
        <div
          className="h-full bg-success-500 transition-all duration-500"
          style={{ width: `${items.length ? (completed / items.length) * 100 : 0}%` }}
        />
      </div>
    </div>
  );
}
