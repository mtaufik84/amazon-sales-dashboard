export function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded ${className}`} />;
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-surface border border-default rounded-lg p-5 space-y-3">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export function SkeletonTable({ rows = 8, cols = 6 }) {
  return (
    <div className="bg-surface border border-default rounded-lg overflow-hidden">
      <div className="border-b border-subtle px-4 py-3 space-y-2">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3" style={{ width: `${60 + (i * 10) % 40}%` }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="border-b border-subtle px-4 py-3 flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-3 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
