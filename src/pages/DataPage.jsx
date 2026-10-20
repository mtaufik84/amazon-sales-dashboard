import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable.jsx';
import FilterBar, { ActiveFilterChips } from '../components/FilterBar.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { orders, orderFilters } from '../mocks/orders.js';

export default function DataPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: { label: 'Status', value: 'all', options: orderFilters.statuses },
    fulfilment: { label: 'Fulfillment', value: 'all', options: orderFilters.fulfilments },
    category: { label: 'Kategori', value: 'all', options: orderFilters.categories },
    size: { label: 'Ukuran', value: 'all', options: orderFilters.sizes },
  });

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

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (search) {
        const q = search.toLowerCase();
        if (!o.orderId.toLowerCase().includes(q) && !o.sku.toLowerCase().includes(q) && !o.city.toLowerCase().includes(q) && !o.state.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (filters.status.value !== 'all' && o.status !== filters.status.value) return false;
      if (filters.fulfilment.value !== 'all' && o.fulfilment !== filters.fulfilment.value) return false;
      if (filters.category.value !== 'all' && o.category !== filters.category.value) return false;
      if (filters.size.value !== 'all' && o.size !== filters.size.value) return false;
      return true;
    });
  }, [orders, search, filters]);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-primary-c">Daftar Pesanan</h1>
        <p className="text-sm text-muted-c mt-0.5">Semua pesanan Amazon India · Q2 2022</p>
      </div>

      <div>
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Cari Order ID, SKU, kota..."
        />
        <ActiveFilterChips filters={filters} onFilterChange={handleFilterChange} />
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-surface border border-default rounded-lg">
          <EmptyState
            title="Tidak ada pesanan ditemukan"
            message="Coba ubah atau reset filter pencarian Anda"
            action={
              <button
                onClick={handleReset}
                className="px-3 py-1.5 text-xs font-medium text-accent-600 dark:text-accent-400 border border-accent-200 dark:border-accent-800 rounded-md hover:bg-accent-50 dark:hover:bg-accent-950/30 transition-colors"
              >
                Reset Filter
              </button>
            }
          />
        </div>
      ) : (
        <DataTable
          data={filteredOrders}
          onRowClick={(row) => navigate(`/detail/${row.id}`)}
        />
      )}
    </div>
  );
}
