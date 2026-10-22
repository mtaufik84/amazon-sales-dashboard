import { useState, useEffect, useMemo } from 'react';
import RecommendationCard from '../components/RecommendationCard.jsx';
import StockPlanTable from '../components/StockPlanTable.jsx';
import CancelRiskPanel from '../components/CancelRiskPanel.jsx';
import { getMLRecommendations, getMLStockPlan } from '../services/api.js';
import { formatNumber } from '../lib/format.js';

const TABS = [
  { id: 'main', label: 'Rekomendasi Utama' },
  { id: 'stock', label: 'Rencana Stok & ROP' },
  { id: 'risk', label: 'Risiko Pembatalan' },
];

const PRIORITY_ORDER = { Tinggi: 0, Sedang: 1, Rendah: 2 };

// Mapping field API (snake_case) → baris referensi (camelCase):
// current_stock_est→currentStock, reorder_point→reorderPoint,
// suggested_reorder_qty→reorderQty, estimated_cost→estimatedReorderCost,
// urgency→status. Ramalan 14 hari per SKU dihitung = ADS × 14 (proyeksi
// demand dari laju harian yang tersedia di API).
function mapStockRow(row, i) {
  return {
    id: i,
    sku: row.sku,
    category: row.category,
    size: row.size,
    style: row.style,
    ads: row.ads,
    forecast14d: Math.round((row.ads || 0) * 14),
    safetyStock: row.safety_stock,
    reorderPoint: row.reorder_point,
    currentStock: row.current_stock_est,
    reorderQty: row.suggested_reorder_qty,
    status: row.urgency,
    estimatedReorderCost: row.estimated_cost,
  };
}

export default function RecommendationPage() {
  const [activeTab, setActiveTab] = useState('main');
  const [pillarFilter, setPillarFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [pillars, setPillars] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [stockPlan, setStockPlan] = useState(null);
  const [loadingStock, setLoadingStock] = useState(false);
  const [stockError, setStockError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getMLRecommendations()
      .then((res) => {
        const recs = res.recommendations || [];
        setRecommendations(recs);
        setPillars([...new Set(recs.map((r) => r.category))]);
        setPriorities(['Tinggi', 'Sedang', 'Rendah']);
      })
      .catch((err) => {
        console.error('Gagal memuat rekomendasi:', err);
        setError('Sistem rekomendasi tidak dapat memuat data. Pastikan backend berjalan.');
      })
      .finally(() => setLoading(false));
  }, [refreshKey]);

  // Stok & ROP dimuat saat tab stok dibuka pertama kali.
  useEffect(() => {
    if (activeTab !== 'stock' || stockPlan) return;
    setLoadingStock(true);
    setStockError(null);
    getMLStockPlan()
      .then((res) => setStockPlan(res))
      .catch((err) => {
        console.error('Gagal memuat rencana stok:', err);
        setStockError('Rencana stok tidak dapat dimuat. Pastikan backend berjalan.');
      })
      .finally(() => setLoadingStock(false));
  }, [activeTab, refreshKey, stockPlan]);

  const filteredRecs = useMemo(() => {
    return recommendations.filter((r) => {
      if (pillarFilter !== 'all' && r.category !== pillarFilter) return false;
      if (priorityFilter !== 'all' && r.priority !== priorityFilter) return false;
      return true;
    });
  }, [recommendations, pillarFilter, priorityFilter]);

  const sortedRecs = useMemo(
    () => [...filteredRecs].sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9)),
    [filteredRecs]
  );
  const featured = sortedRecs[0];
  const rest = sortedRecs.slice(1);

  const stockRows = useMemo(
    () => (stockPlan?.top_sku_recommendations || []).map(mapStockRow),
    [stockPlan]
  );

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-primary-c">Sistem Rekomendasi</h1>
        <p className="text-sm text-muted-c mt-0.5">Rekomendasi data-driven untuk optimasi penjualan</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-default">
        <div className="flex gap-1 relative">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-accent-600 dark:text-accent-400'
                  : 'text-secondary-c hover:text-primary-c'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-500 transition-all duration-300" />
              )}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-surface border border-danger-200 dark:border-danger-800 rounded-lg p-8 text-center">
          <p className="text-sm text-secondary-c">{error}</p>
          <button
            onClick={() => {
              setStockPlan(null);
              setRefreshKey((k) => k + 1);
            }}
            className="mt-3 px-4 py-2 rounded-md text-xs font-medium bg-accent-500 text-white hover:bg-accent-600 transition-colors focus-ring"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {!error && activeTab === 'main' && (
        <div className="space-y-4 animate-fade-in">
          {loading ? (
            <div className="space-y-4">
              <div className="skeleton h-8 w-80 rounded-md" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-surface border border-default rounded-lg p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="skeleton h-4 w-40 rounded" />
                    <div className="skeleton h-5 w-20 rounded-full" />
                  </div>
                  <div className="skeleton h-3 w-full rounded" />
                  <div className="skeleton h-3 w-4/5 rounded" />
                  <div className="flex gap-4 pt-2">
                    <div className="skeleton h-3 w-28 rounded" />
                    <div className="skeleton h-3 w-32 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Filters — pilar = kategori API, prioritas asli */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-2xs text-muted-c uppercase tracking-wider mr-1">Pilar:</span>
                  <button
                    onClick={() => setPillarFilter('all')}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                      pillarFilter === 'all' ? 'bg-accent-50 border-accent-200 text-accent-700 dark:bg-accent-950/40 dark:border-accent-800 dark:text-accent-300' : 'bg-surface border-default text-secondary-c hover:text-primary-c'
                    }`}
                  >
                    Semua
                  </button>
                  {pillars.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPillarFilter(p)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                        pillarFilter === p ? 'bg-accent-50 border-accent-200 text-accent-700 dark:bg-accent-950/40 dark:border-accent-800 dark:text-accent-300' : 'bg-surface border-default text-secondary-c hover:text-primary-c'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <div className="w-px h-5 bg-default mx-1" />
                <div className="flex items-center gap-1.5">
                  <span className="text-2xs text-muted-c uppercase tracking-wider mr-1">Prioritas:</span>
                  <button
                    onClick={() => setPriorityFilter('all')}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                      priorityFilter === 'all' ? 'bg-accent-50 border-accent-200 text-accent-700 dark:bg-accent-950/40 dark:border-accent-800 dark:text-accent-300' : 'bg-surface border-default text-secondary-c hover:text-primary-c'
                    }`}
                  >
                    Semua
                  </button>
                  {priorities.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriorityFilter(p)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                        priorityFilter === p ? 'bg-accent-50 border-accent-200 text-accent-700 dark:bg-accent-950/40 dark:border-accent-800 dark:text-accent-300' : 'bg-surface border-default text-secondary-c hover:text-primary-c'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Featured card */}
              {featured && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <RecommendationCard recommendation={featured} featured />
                  </div>
                  <div className="space-y-4">
                    {rest.slice(0, 2).map((r) => (
                      <RecommendationCard key={r.id} recommendation={r} />
                    ))}
                  </div>
                </div>
              )}

              {/* Rest of cards */}
              {rest.length > 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rest.slice(2).map((r) => (
                    <RecommendationCard key={r.id} recommendation={r} />
                  ))}
                </div>
              )}

              {sortedRecs.length === 0 && (
                <div className="text-center py-16 text-sm text-muted-c">Tidak ada rekomendasi untuk filter ini</div>
              )}
            </>
          )}
        </div>
      )}

      {!error && activeTab === 'stock' && (
        <div className="animate-fade-in space-y-4">
          {stockError && (
            <div className="bg-surface border border-danger-200 dark:border-danger-800 rounded-lg p-6 text-center">
              <p className="text-sm text-secondary-c">{stockError}</p>
              <button
                onClick={() => {
                  setStockPlan(null);
                  setRefreshKey((k) => k + 1);
                }}
                className="mt-3 px-4 py-2 rounded-md text-xs font-medium bg-accent-500 text-white hover:bg-accent-600 transition-colors focus-ring"
              >
                Coba Lagi
              </button>
            </div>
          )}
          {!stockError && stockPlan && (
            <>
              {/* Proyeksi permintaan 14 hari per kategori — dari versi lama */}
              <div className="bg-surface border border-default rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-subtle">
                  <h3 className="text-sm font-medium text-primary-c">Proyeksi Permintaan 14 Hari per Kategori</h3>
                  <p className="text-2xs text-muted-c mt-0.5">
                    Lead time {stockPlan.metadata?.lead_time_days ?? '-'} hari · safety stock {stockPlan.metadata?.safety_stock_days ?? '-'} hari
                  </p>
                </div>
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-subtle text-muted-c">
                        <th className="text-left font-medium px-4 py-2.5">Kategori</th>
                        <th className="text-right font-medium px-3 py-2.5">ADS</th>
                        <th className="text-right font-medium px-3 py-2.5">Proyeksi 14d</th>
                        <th className="text-right font-medium px-3 py-2.5">Safety Stock</th>
                        <th className="text-right font-medium px-3 py-2.5">ROP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(stockPlan.category_summary || []).map((c) => (
                        <tr key={c.category} className="border-b border-subtle hover:bg-subtle transition-colors">
                          <td className="px-4 py-2 text-secondary-c font-medium">{c.category}</td>
                          <td className="px-3 py-2 text-right text-primary-c tabular-nums">{c.ads?.toFixed(1)}</td>
                          <td className="px-3 py-2 text-right text-primary-c tabular-nums">{formatNumber(c.forecast_14d)}</td>
                          <td className="px-3 py-2 text-right text-secondary-c tabular-nums">{formatNumber(c.safety_stock_3d)}</td>
                          <td className="px-3 py-2 text-right text-secondary-c tabular-nums">{formatNumber(c.reorder_point)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <StockPlanTable data={stockRows} loading={loadingStock} />
            </>
          )}
        </div>
      )}

      {!error && activeTab === 'risk' && (
        <div className="animate-fade-in">
          <CancelRiskPanel />
        </div>
      )}
    </div>
  );
}
