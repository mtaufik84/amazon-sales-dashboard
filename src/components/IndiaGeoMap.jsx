import { useState, useMemo, useRef } from 'react';
import { formatINRCompact, formatNumber } from '../lib/format.js';

// Proyeksi GeoJSON → koordinat SVG. Rumus dipindahkan dari peta existing
// (frontend lama) agar 36 negara bagian digambar dari GeoJSON resmi,
// menggantikan dot-map referensi yang placeholder & hanya 28 titik.
function projectPt([lon, lat]) {
  const x = ((lon - 68.0) / (98.0 - 68.0)) * 700.0 + 50.0;
  const y = ((37.5 - lat) / (37.5 - 6.5)) * 750.0 + 30.0;
  return [x, y];
}

function coordsToSvgPath(coords, geomType) {
  const ringToPath = (ring) =>
    ring
      .map(([lon, lat], i) => {
        const [x, y] = projectPt([lon, lat]);
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ') + ' Z';

  if (geomType === 'Polygon') {
    return coords.map(ringToPath).join(' ');
  }
  if (geomType === 'MultiPolygon') {
    return coords.map((poly) => poly.map(ringToPath).join(' ')).join(' ');
  }
  return '';
}

export default function IndiaGeoMap({ geojsonData, geoData, clusters, onStateClick, selectedCluster, loading }) {
  const [hovered, setHovered] = useState(null);
  const [tooltip, setTooltip] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const dataByState = useMemo(() => {
    const map = {};
    geoData?.forEach((s) => { map[s.state] = s; });
    return map;
  }, [geoData]);

  const statePaths = useMemo(() => {
    const features = geojsonData?.features || [];
    return features.map((feat) => {
      const stateName = feat.properties?.st_nm || feat.properties?.name || '';
      return {
        state: stateName,
        pathD: coordsToSvgPath(feat.geometry.coordinates, feat.geometry.type),
      };
    });
  }, [geojsonData]);

  if (loading) {
    return <div className="skeleton h-[500px] w-full rounded-lg" />;
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      <svg viewBox="0 0 800 810" className="w-full h-auto" style={{ maxHeight: '560px' }}>
        {statePaths.map(({ state, pathD }) => {
          if (!pathD) return null;
          const seg = dataByState[state];
          const cluster = seg ? clusters[String(seg.cluster)] : null;
          const color = cluster?.color || '#CBD5E1';
          const isDimmed = selectedCluster !== null && seg && selectedCluster !== String(seg.cluster);
          const isHovered = hovered === state;

          return (
            <path
              key={state}
              d={pathD}
              fill={color}
              fillOpacity={isDimmed ? 0.15 : isHovered ? 0.95 : 0.75}
              stroke="var(--bg-surface)"
              strokeWidth={1}
              strokeOpacity={isDimmed ? 0.2 : 1}
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHovered(state)}
              onMouseMove={(e) => {
                const rect = containerRef.current.getBoundingClientRect();
                setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top });
              }}
              onMouseLeave={() => setHovered(null)}
              onClick={() => seg && onStateClick?.(seg)}
            />
          );
        })}
      </svg>

      {/* Tooltip */}
      {hovered && dataByState[hovered] && (
        <div
          className="absolute pointer-events-none bg-surface border border-default rounded-md shadow-lg px-3 py-2 text-xs z-20 animate-fade-in"
          style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
        >
          <div className="text-primary-c font-medium">{hovered}</div>
          <div className="text-muted-c mt-0.5">
            Pendapatan: <span className="text-primary-c tabular-nums">{formatINRCompact(dataByState[hovered].revenue)}</span>
          </div>
          <div className="text-muted-c">
            Pesanan: <span className="text-primary-c tabular-nums">{formatNumber(dataByState[hovered].orders)}</span>
          </div>
          <div className="text-muted-c">
            Cluster: <span className="text-primary-c">{clusters[String(dataByState[hovered].cluster)]?.label}</span>
          </div>
        </div>
      )}

      {/* Legend */}
      {!loading && clusters && (
        <div className="absolute bottom-4 left-4 bg-surface border border-default rounded-md px-3 py-2 space-y-1.5">
          <div className="text-2xs font-medium text-muted-c uppercase tracking-wider mb-1">Cluster</div>
          {Object.entries(clusters).map(([id, c]) => (
            <div key={id} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
              <span className="text-xs text-secondary-c">{c.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
