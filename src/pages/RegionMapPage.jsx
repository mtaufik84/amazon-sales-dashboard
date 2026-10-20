import { useState } from 'react';
import { X } from 'lucide-react';
import IndiaClusterMap from '../components/IndiaClusterMap.jsx';
import ClusterTable from '../components/ClusterTable.jsx';
import { geo, clusters } from '../mocks/geo.js';
import { formatINR, formatINRCompact, formatNumber, formatPercent } from '../lib/format.js';

export default function RegionMapPage() {
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [drawerState, setDrawerState] = useState(null);

  const handleStateClick = (state) => {
    setDrawerState(state);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-primary-c">Peta Segmentasi Wilayah</h1>
        <p className="text-sm text-muted-c mt-0.5">Analisis cluster geografis berdasarkan performa penjualan</p>
      </div>

      {/* Map + Cluster legend */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-surface border border-default rounded-lg p-5">
          <IndiaClusterMap
            geoData={geo}
            clusters={clusters}
            onStateClick={handleStateClick}
            selectedCluster={selectedCluster}
          />
        </div>

        {/* Cluster cards */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-medium text-primary-c">Ringkasan Cluster</h3>
          {Object.entries(clusters).map(([id, c]) => {
            const isDimmed = selectedCluster !== null && selectedCluster !== id;
            return (
              <button
                key={id}
                onClick={() => setSelectedCluster(selectedCluster === id ? null : id)}
                className={`w-full text-left bg-surface border rounded-lg p-4 transition-all hover:border-accent-300 dark:hover:border-accent-700 ${
                  selectedCluster === id ? 'border-accent-300 dark:border-accent-700 ring-1 ring-accent-200 dark:ring-accent-800' : 'border-default'
                } ${isDimmed ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-sm font-medium text-primary-c">{c.label}</span>
                  <span className="text-2xs text-muted-c ml-auto">{c.state_count} negara</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-2xs text-muted-c">Avg Pendapatan</div>
                    <div className="text-primary-c tabular-nums font-medium">{formatINRCompact(c.avg_metrics.avg_revenue)}</div>
                  </div>
                  <div>
                    <div className="text-2xs text-muted-c">Pembatalan</div>
                    <div className={`tabular-nums font-medium ${c.avg_metrics.cancellation_rate > 15 ? 'text-danger-600 dark:text-danger-400' : 'text-primary-c'}`}>
                      {formatPercent(c.avg_metrics.cancellation_rate)}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xs text-muted-c">FBA Share</div>
                    <div className="text-primary-c tabular-nums font-medium">{formatPercent(c.avg_metrics.fba_share)}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cluster comparison table */}
      <ClusterTable
        clusters={clusters}
        geoData={geo}
        selectedCluster={selectedCluster}
        onClusterToggle={setSelectedCluster}
      />

      {/* State detail drawer */}
      {drawerState && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40 animate-fade-in" onClick={() => setDrawerState(null)} />
          <div className="fixed right-0 top-0 bottom-0 w-[380px] bg-surface border-l border-default z-50 animate-slide-in-right overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between px-5 py-4 border-b border-subtle">
              <div>
                <h3 className="text-sm font-semibold text-primary-c">{drawerState.state}</h3>
                <p className="text-2xs text-muted-c">Cluster: {clusters[drawerState.cluster]?.label}</p>
              </div>
              <button
                onClick={() => setDrawerState(null)}
                className="p-1.5 rounded-md text-muted-c hover:text-primary-c hover:bg-subtle transition-colors focus-ring"
              >
                <X className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-subtle rounded-md p-3">
                  <div className="text-2xs text-muted-c uppercase tracking-wider">Pendapatan</div>
                  <div className="text-sm font-semibold text-primary-c tabular-nums mt-1">{formatINR(drawerState.revenue)}</div>
                </div>
                <div className="bg-subtle rounded-md p-3">
                  <div className="text-2xs text-muted-c uppercase tracking-wider">Pesanan</div>
                  <div className="text-sm font-semibold text-primary-c tabular-nums mt-1">{formatNumber(drawerState.orders)}</div>
                </div>
                <div className="bg-subtle rounded-md p-3">
                  <div className="text-2xs text-muted-c uppercase tracking-wider">Avg Nilai Pesanan</div>
                  <div className="text-sm font-semibold text-primary-c tabular-nums mt-1">₹{formatNumber(Math.round(drawerState.revenue / drawerState.orders))}</div>
                </div>
                <div className="bg-subtle rounded-md p-3">
                  <div className="text-2xs text-muted-c uppercase tracking-wider">Cluster</div>
                  <div className="text-sm font-semibold mt-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: clusters[drawerState.cluster]?.color }} />
                    <span className="text-primary-c">{clusters[drawerState.cluster]?.label}</span>
                  </div>
                </div>
              </div>

              {/* Cluster comparison */}
              <div>
                <div className="text-2xs font-medium text-muted-c uppercase tracking-wider mb-2">vs Cluster Avg</div>
                <div className="space-y-2">
                  {(() => {
                    const c = clusters[drawerState.cluster];
                    const revenueDiff = ((drawerState.revenue - c.avg_metrics.avg_revenue) / c.avg_metrics.avg_revenue) * 100;
                    const ordersDiff = ((drawerState.orders - c.avg_metrics.avg_orders) / c.avg_metrics.avg_orders) * 100;
                    return [
                      { label: 'Pendapatan', diff: revenueDiff },
                      { label: 'Pesanan', diff: ordersDiff },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between text-xs">
                        <span className="text-secondary-c">{item.label}</span>
                        <span className={`tabular-nums font-medium ${item.diff > 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>
                          {item.diff > 0 ? '+' : ''}{item.diff.toFixed(1)}%
                        </span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
