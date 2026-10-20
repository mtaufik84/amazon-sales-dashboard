import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable.jsx';
import FilterBar, { ActiveFilterChips } from '../components/FilterBar.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { getFilterOptions, getAllSales } from '../services/api.js';

// Paginasi server-side mengikuti versi lama: 100 baris per request ke /table,
// user-halaman dipaginasi di dalamnya. Ukuran filter bulan dari app lama
// dipertahankan; drat filter "Ukuran" referensi dihilangkan karena endpoint
// /table tidak mendukung filter size.
const PAGE_SIZE = 100;
const STATUS_OPTIONS = ['Shipped', 'Cancelled', 'Delivered'];
const FULFILMENT_OPTIONS = ['Amazon', 'Merchant'];

function apiParams(filters, search) {
  const params = {};
  if (filters.month.value !== 'all') params.month = filters.month.value;
  if (filters.status.value !== 'all') params.status = filters.status.value;
  if (filters.fulfilment.value !== 'all') params.fulfilment = filters.fulfilment.value;
  if (filters.category.value !== 'all') params.category = filters.category.value;
  if (search) params.search = search;
  return params;
}

export default function DataPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    month: { label: 'Bulan', value: 'all', options: [] },
    status: { label: 'Status', value: 'all', options: STATUS_OPTIONS },
    fulfilment: { label: 'Fulfillment', value: 'all', options: FULFILMENT_OPTIONS },
    category: { label: 'Kategori', value: 'all', options: [] },
  });
  const [result, setResult] = useState({ data: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Perilaku lama: debounce search 300 ms.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

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

  // Fetch server-side: page/limit + filter (kontrak /table versi lama).
  useEffect(() => {
    const params = apiParams(filters, debouncedSearch);
    setLoading(true);
    setError(null);
    getAllSales({ ...params, page, limit: PAGE_SIZE })
      .then((res) => {
        setResult({
          data: res.data || [],
          total: res.total || 0,
          totalPages: res.totalPages || 1,
        });
      })
      .catch((err) => {
        console.error('Gagal memuat tabel:', err);
        setError('Data tabel tidak dapat dimuat. Pastikan backend berjalan.');
      })
      .finally(() => setLoading(false));
  }, [page, filters.month.value, filters.status.value, filters.fulfilment.value,
      filters.category.value, debouncedSearch, refreshKey]);

  const handleFilterChange = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: { ...prev[key], value: val } }));
    setPage(1); // perilaku lama: kembali ke halaman 1 saat filter berubah
  };

  const handleReset = () => {
    setFilters((prev) => {
      const reset = {};
      Object.keys(prev).forEach((k) => { reset[k] = { ...prev[k], value: 'all' }; });
      return reset;
    });
    setSearch('');
    setPage(1);
    window.scrollTo({ top: 0 });
  };

  const handlePageChange = (p) => {
    setPage(p);
    window.scrollTo({ top: 0 });
  };

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

      {!error && result.data.length === 0 && !loading ? (
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
      ) : !error && (
        <DataTable
          data={result.data}
          loading={loading}
          onRowClick={(row) => navigate(`/detail/${row.id}`)}
          // Mode server: paginasi menutup seluruh hasil, sortir tetap dalam halaman.
          page={page}
          totalPages={result.totalPages}
          total={result.total}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
