export function KpiCardSkeleton() {
  const sparklineHeights = ['40%', '65%', '45%', '80%', '60%', '90%', '70%', '85%', '50%', '95%', '75%', '60%'];

  return (
    <div className="bg-surface border border-default rounded-lg p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="skeleton h-3.5 w-24 rounded" />
        <div className="skeleton h-4 w-4 rounded-full" />
      </div>
      <div className="skeleton h-8 w-36 rounded-md" />
      <div className="flex items-center gap-2">
        <div className="skeleton h-4 w-16 rounded-full" />
        <div className="skeleton h-3 w-20 rounded" />
      </div>
      {/* Dynamic sparkline bars skeleton */}
      <div className="pt-2 flex items-end gap-1.5 h-10 w-full">
        {sparklineHeights.map((h, i) => (
          <div
            key={i}
            className="skeleton rounded-t flex-1"
            style={{ height: h, opacity: 0.7 + (i % 3) * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

export function SalesChartSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="skeleton h-4 w-36 rounded" />
          <div className="skeleton h-3 w-28 rounded" />
        </div>
        <div className="skeleton h-7 w-24 rounded-md" />
      </div>

      <div className="h-[280px] w-full border-t border-b border-default/40 flex flex-col justify-between py-4">
        {/* Horizontal grid guide lines */}
        {[100, 75, 50, 25, 0].map((level, i) => (
          <div key={i} className="flex items-center gap-3 w-full">
            <div className="skeleton h-2.5 w-10 rounded shrink-0" />
            <div className="w-full border-b border-dashed border-default/60" />
          </div>
        ))}
      </div>

      <div className="flex justify-between px-12">
        {['Apr', 'Mei', 'Jun'].map((m, i) => (
          <div key={i} className="skeleton h-3 w-8 rounded" />
        ))}
      </div>
    </div>
  );
}

export function CategoryBarsSkeleton() {
  const widths = ['88%', '74%', '58%', '42%', '28%'];

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="skeleton h-4 w-40 rounded" />
        <div className="skeleton h-3 w-32 rounded" />
      </div>

      <div className="space-y-3.5 pt-2">
        {widths.map((w, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <div className="skeleton h-3 w-20 rounded" />
              <div className="skeleton h-3 w-16 rounded" />
            </div>
            <div className="h-6 w-full bg-subtle rounded overflow-hidden">
              <div className="skeleton h-full rounded" style={{ width: w }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TopStatesSkeleton() {
  const widths = ['92%', '80%', '68%', '54%', '44%', '32%'];

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="skeleton h-4 w-44 rounded" />
        <div className="skeleton h-3 w-36 rounded" />
      </div>

      <div className="space-y-3.5 pt-2">
        {widths.map((w, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <div className="skeleton h-3 w-24 rounded" />
              <div className="skeleton h-3 w-14 rounded" />
            </div>
            <div className="h-6 w-full bg-subtle rounded overflow-hidden">
              <div className="skeleton h-full rounded" style={{ width: w }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SizeHistogramSkeleton() {
  const heights = ['55%', '80%', '100%', '85%', '60%', '40%', '25%'];
  const labels = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="skeleton h-4 w-36 rounded" />
        <div className="skeleton h-3 w-32 rounded" />
      </div>

      <div className="h-[200px] w-full flex items-end justify-around gap-3 pt-4 border-b border-default/50 pb-2">
        {heights.map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
            <div className="skeleton w-full max-w-[48px] rounded-t" style={{ height: h }} />
          </div>
        ))}
      </div>

      <div className="flex justify-around text-xs">
        {labels.map((l, i) => (
          <div key={i} className="skeleton h-3 w-6 rounded" />
        ))}
      </div>
    </div>
  );
}
