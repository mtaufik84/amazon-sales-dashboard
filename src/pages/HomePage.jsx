import { useState, useEffect, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import KpiCard from '../components/KpiCard.jsx';
import SalesAreaChart from '../components/SalesAreaChart.jsx';
import CategoryBars from '../components/CategoryBars.jsx';
import TopStatesChart from '../components/TopStatesChart.jsx';
import SizeHistogram from '../components/SizeHistogram.jsx';
import FilterBar, { ActiveFilterChips } from '../components/FilterBar.jsx';
import {
  getSalesStats,
  getSalesTrends,
  getSalesCategories,
  getSalesGeo,
  getSalesBreakdown,
  getFilterOptions,
} from '../services/api.js';

// Opsi status & fulfilment mengikuti app lama (FilterPanel existing).
const STATUS_OPTIONS = ['Shipped', 'Cancelled', 'Delivered'];
const FULFILMENT_OPTIONS = ['Amazon', 'Merchant'];

function avgOf(arr) {
  return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
}

// Rangkum deret harian jadi ~16 titik (rata-rata per bucket) untuk sparkline KPI.
function bucketSparkline(series, n = 16) {
  if (!series?.length) return [];
  const bucketSize = Math.max(1, Math.ceil(series.length / n));
  const out = [];
  for (let i = 0; i < series.length; i += bucketSize) {
    out.push(Math.round(avgOf(series.slice(i, i + bucketSize))));
  }
  return out;
}

// Perubahan %: rata-rata 7 hari terakhir vs 7 hari sebelumnya — dibaca dari
// deret harian nyata, bukan angka fiktif.
function windowDelta(series, windowSize = 7) {
  if (!series || series.length < windowSize * 2) return 0;
  const recent = avgOf(series.slice(-windowSize));
  const prev = avgOf(series.slice(-windowSize * 2, -windowSize));
  if (prev <= 0) return 0;
  return ((recent - prev) / prev) * 100;
}

function apiParams(filters, search) {
  const params = {};
  if (filters.month.value !== 'all') params.month = filters.month.value;
  if (filters.category.value !== 'all') params.category = filters.category.value;
  if (filters.status.value !== 'all') params.status = filters.status.value;
  if (filters.fulfilment.value !== 'all') params.fulfilment = filters.fulfilment.value;
  if (search) params.search = search;
  return params;
}

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState({
    month: { label: 'Bulan', value: 'all', options: [] },
    category: { label: 'Kategori', value: 'all', options: [] },
    status: { label: 'Status', value: 'all', options: STATUS_OPTIONS },
    fulfilment: { label: 'Fulfillment', value: 'all', options: FULFILMENT_OPTIONS },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [salesData, setSalesData] = useState({
    stats: null,
    trends: [],
    categories: [],
    geo: [],
    sizes: [],
  });

  // Pertahankan perilaku lama: debounce search 300 ms sebelum fetch.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Opsi filter dinamis dari API (bulan & kategori), sekali di awal.
  useEffect(() => {
    getFilterOptions()
      .then((opts) => {
        setFilters((prev) => ({
          ...prev,
          month: { ...prev.month, options: opts.months || [] },
          category: { ...prev.category, options: opts.categories || [] },
        }));
      })
      .catch((err) => console.error('Gagal memuat opsi filter:', err));
  }, []);

  // Fetch 5 endpoint paralel dengan filter aktif — perilaku Dashboard lama.
  useEffect(() => {
    const controller = new AbortController();
    const params = apiParams(filters, debouncedSearch);
    setLoading(true);
    setError(null);
    Promise.all([
      getSalesStats(params),
      getSalesTrends(params),
      getSalesCategories(params),
      getSalesGeo(params),
      getSalesBreakdown(params),
    ])
      .then(([stats, trends, categories, geo, breakdown]) => {
        setSalesData({
          stats,
          trends: trends || [],
          categories: categories || [],
          geo: geo || [],
          sizes: breakdown?.sizes || [],
        });
      })
      .catch((err) => {
        if (err?.code === 'ERR_CANCELED') return;
        console.error('Gagal memuat dashboard:', err);
        setError('Data dashboard tidak dapat dimuat. Pastikan backend berjalan.');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [filters.month.value, filters.category.value, filters.status.value,
      filters.fulfilment.value, debouncedSearch, refreshKey]);

  const handleFilterChange = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: { ...prev[key], value: val } }));
  };

  const handleReset = () => {
    setFilters((prev) => {
      const reset = {};
      Object.keys(prev).forEach((k) => { reset[k] = { ...prev[k], value: 'all' }; });
      return reset;
    });
    setSearch('');
  };

  const trendsWithMA = useMemo(() => {
    const t = salesData.trends;
    return t.map((row, i) => ({
      ...row,
      ma7: i >= 6 ? Math.round(avgOf(t.slice(i - 6, i + 1).map((r) => r.revenue))) : undefined,
    }));
  }, [salesData.trends]);

  // KPI dari stats nyata; delta & sparkline dihitung dari deret harian trends.
  const kpiCards = useMemo(() => {
    const s = salesData.stats;
    if (!s) return [];
    const trends = salesData.trends;
    const revSeries = trends.map((t) => t.revenue);
    const ordSeries = trends.map((t) => t.orders);
    const qtySeries = trends.map((t) => t.qty);
    const aovSeries = trends.map((t) => (t.orders > 0 ? t.revenue / t.orders : 0));
    return [
      { id: 'revenue', label: 'Pendapatan Kotor', value: s.totalRevenue, format: 'currency',
        delta: windowDelta(revSeries), sparkline: bucketSparkline(revSeries), positive: true },
      { id: 'orders', label: 'Total Pesanan', value: s.totalOrders, format: 'number',
        delta: windowDelta(ordSeries), sparkline: bucketSparkline(ordSeries), positive: true },
      { id: 'units', label: 'Unit Dikirim', value: s.totalQty, format: 'number',
        delta: windowDelta(qtySeries), sparkline: bucketSparkline(qtySeries), positive: true },
      { id: 'aov', label: 'Rata-rata Nilai Order', value: s.avgOrderValue, format: 'currency',
        delta: windowDelta(aovSeries.map(Math.round)), sparkline: bucketSparkline(aovSeries.map(Math.round)), positive: true },
    ];
  }, [salesData]);

  const topStates = useMemo(
    () => [...salesData.geo].sort((a, b) => b.revenue - a.revenue).slice(0, 7),
    [salesData.geo]
  );

  // share & percentage dihitung dari total nyata (mock API tidak punya field ini).
  const categoriesWithShare = useMemo(() => {
    const total = salesData.stats?.totalRevenue || 0;
    return salesData.categories.map((c) => ({
      ...c,
      share: total > 0 ? (c.revenue / total) * 100 : 0,
    }));
  }, [salesData.categories, salesData.stats]);

  const sizesWithPercentage = useMemo(() => {
    const totalQty = salesData.sizes.reduce((s, r) => s + r.qty, 0);
    return salesData.sizes.map((r) => ({
      ...r,
      percentage: totalQty > 0 ? (r.qty / totalQty) * 100 : 0,
    }));
  }, [salesData.sizes]);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-primary-c">Ringkasan Eksekutif</h1>
          <p className="text-sm text-muted-c mt-0.5">Performa penjualan Amazon India · Q2 2022 · Wanita Fashion</p>
        </div>
        {/* Tombol refresh — perilaku "Perbarui Data" versi lama dipertahankan */}
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border bg-surface border-default text-secondary-c hover:text-primary-c hover:bg-subtle transition-colors focus-ring"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.75} />
          Perbarui Data
        </button>
      </div>

      {/* Filter bar */}
      <div>
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
          searchValue={search}
          onSearchChange={setSearch}
        />
        <ActiveFilterChips filters={filters} onFilterChange={handleFilterChange} />
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-surface border border-danger-200 dark:border-danger-800 rounded-lg p-8 text-center">
          <p className="text-sm text-secondary-c">{error}</p>
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="mt-3 px-4 py-2 rounded-md text-xs font-medium bg-accent-500 text-white hover:bg-accent-600 transition-colors focus-ring"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {!error && (
        <>
          {/* KPI strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiCards.map((kpi) => (
              <KpiCard key={kpi.id} {...kpi} loading={loading} />
            ))}
            {loading && kpiCards.length === 0 && (
              <>
                <KpiCard loading />
                <KpiCard loading />
                <KpiCard loading />
                <KpiCard loading />
              </>
            )}
          </div>

          {/* Charts row 1: Sales area chart (full width) */}
          <div className="bg-surface border border-default rounded-lg p-5">
            <SalesAreaChart data={trendsWithMA} loading={loading} />
          </div>

          {/* Charts row 2: Category (2 cols) + Top States (2 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-surface border border-default rounded-lg p-5">
              <CategoryBars data={categoriesWithShare} loading={loading} />
            </div>
            <div className="bg-surface border border-default rounded-lg p-5">
              <TopStatesChart data={topStates} loading={loading} />
            </div>
          </div>

          {/* Size histogram */}
          <div className="bg-surface border border-default rounded-lg p-5">
            <SizeHistogram data={sizesWithPercentage} loading={loading} />
          </div>
        </>
      )}
    </div>
  );
}
