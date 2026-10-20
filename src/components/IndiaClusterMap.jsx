import { useState } from 'react';
import { formatINRCompact, formatNumber, formatPercent } from '../lib/format.js';

const statePositions = {
  'Jammu & Kashmir': { x: 28, y: 8 },
  'Himachal Pradesh': { x: 34, y: 16 },
  'Punjab': { x: 30, y: 20 },
  'Haryana': { x: 36, y: 22 },
  'Delhi': { x: 38, y: 24 },
  'Uttarakhand': { x: 40, y: 18 },
  'Rajasthan': { x: 28, y: 30 },
  'Uttar Pradesh': { x: 44, y: 26 },
  'Gujarat': { x: 18, y: 34 },
  'Madhya Pradesh': { x: 36, y: 36 },
  'Bihar': { x: 56, y: 28 },
  'Sikkim': { x: 62, y: 30 },
  'Assam': { x: 68, y: 28 },
  'Nagaland': { x: 74, y: 28 },
  'Manipur': { x: 74, y: 32 },
  'Meghalaya': { x: 70, y: 32 },
  'Tripura': { x: 72, y: 36 },
  'Mizoram': { x: 74, y: 36 },
  'Jharkhand': { x: 54, y: 36 },
  'West Bengal': { x: 60, y: 34 },
  'Chhattisgarh': { x: 44, y: 44 },
  'Odisha': { x: 54, y: 44 },
  'Maharashtra': { x: 28, y: 46 },
  'Goa': { x: 22, y: 50 },
  'Telangana': { x: 38, y: 50 },
  'Andhra Pradesh': { x: 42, y: 56 },
  'Karnataka': { x: 28, y: 56 },
  'Kerala': { x: 30, y: 66 },
  'Tamil Nadu': { x: 36, y: 62 },
};

export default function IndiaClusterMap({ geoData, clusters, onStateClick, selectedCluster, loading }) {
  const [hovered, setHovered] = useState(null);
  const [tooltip, setTooltip] = useState({ x: 0, y: 0 });

  if (loading) {
    return <div className="skeleton h-[500px] w-full rounded-lg" />;
  }

  const maxRevenue = Math.max(...geoData.map((s) => s.revenue));

  return (
    <div className="relative w-full">
      <svg viewBox="0 0 100 80" className="w-full h-auto" style={{ maxHeight: '560px' }}>
        {/* India outline (simplified) */}
        <path
          d="M 25,8 Q 35,5 45,12 L 55,10 Q 65,15 72,12 L 76,18 Q 78,25 74,28 L 76,32 Q 74,38 70,36 L 72,42 Q 68,46 62,44 L 65,50 Q 60,56 52,54 L 48,60 Q 42,66 36,64 L 34,70 Q 28,68 30,62 L 26,58 Q 22,52 20,48 L 15,42 Q 12,36 16,32 L 14,26 Q 18,22 22,24 L 20,18 Q 22,12 25,8 Z"
          fill="var(--bg-subtle)"
          stroke="var(--border-default)"
          strokeWidth={0.3}
        />

        {/* State dots */}
        {geoData.map((state) => {
          const pos = statePositions[state.state];
          if (!pos) return null;
          const cluster = clusters[state.cluster];
          const color = cluster?.color || '#94a3b8';
          const radius = 1.2 + (state.revenue / maxRevenue) * 4;
          const isDimmed = selectedCluster !== null && selectedCluster !== state.cluster;

          return (
            <g key={state.state}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={radius}
                fill={color}
                fillOpacity={isDimmed ? 0.15 : hovered === state.state ? 0.9 : 0.65}
                stroke={color}
                strokeWidth={hovered === state.state ? 0.8 : 0.3}
                strokeOpacity={isDimmed ? 0.2 : 1}
                className="cursor-pointer transition-all"
                onMouseEnter={(e) => {
                  setHovered(state.state);
                  const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect();
                  setTooltip({
                    x: (pos.x / 100) * rect.width,
                    y: (pos.y / 80) * rect.height,
                  });
                }}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onStateClick?.(state)}
              />
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hovered && (
        <div
          className="absolute pointer-events-none bg-surface border border-default rounded-md shadow-lg px-3 py-2 text-xs z-20 animate-fade-in"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 10,
          }}
        >
          <div className="text-primary-c font-medium">
            {hovered}
          </div>
          {(() => {
            const s = geoData.find((g) => g.state === hovered);
            return s ? (
              <>
                <div className="text-muted-c mt-0.5">Pendapatan: <span className="text-primary-c tabular-nums">{formatINRCompact(s.revenue)}</span></div>
                <div className="text-muted-c">Pesanan: <span className="text-primary-c tabular-nums">{formatNumber(s.orders)}</span></div>
                <div className="text-muted-c">Cluster: <span className="text-primary-c">{clusters[s.cluster]?.label}</span></div>
              </>
            ) : null;
          })()}
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-surface border border-default rounded-md px-3 py-2 space-y-1.5">
        <div className="text-2xs font-medium text-muted-c uppercase tracking-wider mb-1">Cluster</div>
        {Object.entries(clusters).map(([id, c]) => (
          <div key={id} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
            <span className="text-xs text-secondary-c">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
