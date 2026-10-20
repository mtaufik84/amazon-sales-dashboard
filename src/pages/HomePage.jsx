import { useState, useMemo } from 'react';
import KpiCard from '../components/KpiCard.jsx';
import SalesAreaChart from '../components/SalesAreaChart.jsx';
import CategoryBars from '../components/CategoryBars.jsx';
import TopStatesChart from '../components/TopStatesChart.jsx';
import SizeHistogram from '../components/SizeHistogram.jsx';
import FilterBar, { ActiveFilterChips } from '../components/FilterBar.jsx';
import { kpiCards } from '../mocks/stats.js';
import { trendsWithMA } from '../mocks/trends.js';
import { categories } from '../mocks/categories.js';
import { geo } from '../mocks/geo.js';
import { sizes } from '../mocks/sizes.js';
import { orderFilters } from '../mocks/orders.js';

const monthOptions = ['April', 'Mei', 'Juni'];

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    month: { label: 'Bulan', value: 'all', options: monthOptions },
    category: { label: 'Kategori', value: 'all', options: orderFilters.categories },
    status: { label: 'Status', value: 'all', options: orderFilters.statuses },
    fulfilment: { label: 'Fulfillment', value: 'all', options: orderFilters.fulfilments },
  });
  const [loading, setLoading] = useState(false);

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

  const topStates = useMemo(() => [...geo].sort((a, b) => b.revenue - a.revenue).slice(0, 7), []);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-primary-c">Ringkasan Eksekutif</h1>
        <p className="text-sm text-muted-c mt-0.5">Performa penjualan Amazon India · Q2 2022 · Wanita Fashion</p>
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

      {/* KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <KpiCard key={kpi.id} {...kpi} loading={loading} />
        ))}
      </div>

      {/* Charts row 1: Sales area chart (full width) */}
      <div className="bg-surface border border-default rounded-lg p-5">
        <SalesAreaChart data={trendsWithMA} loading={loading} />
      </div>

      {/* Charts row 2: Category (2 cols) + Top States (2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-surface border border-default rounded-lg p-5">
          <CategoryBars data={categories} loading={loading} />
        </div>
        <div className="bg-surface border border-default rounded-lg p-5">
          <TopStatesChart data={topStates} loading={loading} />
        </div>
      </div>

      {/* Size histogram */}
      <div className="bg-surface border border-default rounded-lg p-5">
        <SizeHistogram data={sizes} loading={loading} />
      </div>
    </div>
  );
}
