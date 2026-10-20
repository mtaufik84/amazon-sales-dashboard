import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Download, Columns3, ChevronDown, ArrowUpDown } from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';
import { formatDate, formatINR, formatNumber } from '../lib/format.js';
import { useToast } from './Toast.jsx';

const ALL_COLUMNS = [
  { key: 'orderId', label: 'Order ID', width: 'w-[140px]', align: 'left', sortable: true },
  { key: 'date', label: 'Tanggal', width: 'w-[100px]', align: 'left', sortable: true, format: (v) => formatDate(v) },
  { key: 'category', label: 'Kategori', width: 'w-[90px]', align: 'left', sortable: true },
  { key: 'sku', label: 'SKU', width: 'w-[130px]', align: 'left', sortable: true, mono: true },
  { key: 'size', label: 'Ukuran', width: 'w-[60px]', align: 'center', sortable: true },
  { key: 'fulfilment', label: 'Fulfilment', width: 'w-[90px]', align: 'left', sortable: true },
  { key: 'status', label: 'Status', width: 'w-[90px]', align: 'center', sortable: true, render: (v) => <StatusBadge status={v} /> },
  { key: 'city', label: 'Kota', width: 'w-[110px]', align: 'left', sortable: true },
  { key: 'state', label: 'Negara Bagian', width: 'w-[130px]', align: 'left', sortable: true },
  { key: 'qty', label: 'Qty', width: 'w-[50px]', align: 'right', sortable: true, format: (v) => formatNumber(v) },
  { key: 'amount', label: 'Jumlah', width: 'w-[100px]', align: 'right', sortable: true, format: (v) => formatINR(v) },
];

export default function DataTable({ data, loading, onRowClick, pageSize = 15, page: serverPage, totalPages: serverTotalPages, total: serverTotal, onPageChange }) {
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [visibleCols, setVisibleCols] = useState(ALL_COLUMNS.map((c) => c.key));
  const [showColMenu, setShowColMenu] = useState(false);
  const { showToast } = useToast();

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      const cmp = typeof aVal === 'number' ? aVal - bVal : String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  // Mode server: paginasi & hitung total dari /table (perilaku DataPage lama);
  // sortir tetap dalam halaman hasil yang diterima dari API.
  const isServer = typeof onPageChange === 'function';
  const totalPages = isServer ? (serverTotalPages || 1) : Math.ceil(sorted.length / pageSize);
  const pageData = isServer ? sorted : sorted.slice((page - 1) * pageSize, page * pageSize);
  const totalCount = isServer ? (serverTotal || 0) : sorted.length;
  const currentPage = isServer ? (serverPage || 1) : page;

  const gotoPage = (p) => (isServer ? onPageChange(p) : setPage(p));
  const columns = ALL_COLUMNS.filter((c) => visibleCols.includes(c.key));

  const handleSort = (key) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  const handleExport = () => {
    const headers = columns.map((c) => c.label);
    const rows = sorted.map((r) => columns.map((c) => r[c.key]));
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pesanan.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('File CSV diunduh');
  };

  if (loading) {
    return <div className="skeleton h-[500px] w-full rounded-lg" />;
  }

  return (
    <div className="bg-surface border border-default rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-subtle">
        <div className="text-xs text-muted-c">
          Menampilkan <span className="text-primary-c font-medium tabular-nums">{(currentPage - 1) * pageSize + 1}</span>–
          <span className="text-primary-c font-medium tabular-nums">{Math.min(currentPage * pageSize, totalCount)}</span> dari{' '}
          <span className="text-primary-c font-medium tabular-nums">{formatNumber(totalCount)}</span> pesanan
        </div>
        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => setShowColMenu((v) => !v)}
            className="flex items-center gap-1.5 px-2 py-1 text-xs text-secondary-c border border-default rounded-md hover:text-primary-c hover:bg-subtle transition-colors focus-ring"
          >
            <Columns3 className="w-3 h-3" strokeWidth={1.75} /> Kolom
            <ChevronDown className="w-3 h-3" strokeWidth={1.75} />
          </button>
          {showColMenu && (
            <div className="absolute top-full right-0 mt-1 w-48 bg-surface border border-default rounded-md shadow-lg py-1 z-20 animate-fade-in">
              {ALL_COLUMNS.map((col) => (
                <label key={col.key} className="flex items-center gap-2 px-3 py-1.5 hover:bg-subtle cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleCols.includes(col.key)}
                    onChange={(e) => {
                      if (e.target.checked) setVisibleCols((v) => [...v, col.key]);
                      else setVisibleCols((v) => v.filter((k) => k !== col.key));
                    }}
                    className="rounded border-default text-accent-500 focus-ring w-3.5 h-3.5"
                  />
                  <span className="text-xs text-secondary-c">{col.label}</span>
                </label>
              ))}
            </div>
          )}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-2 py-1 text-xs text-secondary-c border border-default rounded-md hover:text-primary-c hover:bg-subtle transition-colors focus-ring"
          >
            <Download className="w-3 h-3" strokeWidth={1.75} /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-subtle text-muted-c bg-subtle">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`px-3 py-2.5 ${col.sortable ? 'cursor-pointer hover:text-primary-c' : ''} transition-colors`}
                >
                  <div className={`flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : ''}`}>
                    <span className="font-medium">{col.label}</span>
                    {col.sortable && sortKey === col.key && (
                      sortDir === 'asc'
                        ? <ChevronDown className="w-3 h-3" strokeWidth={1.75} />
                        : <ChevronDown className="w-3 h-3 rotate-180" strokeWidth={1.75} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className="border-b border-subtle hover:bg-accent-50/50 dark:hover:bg-accent-950/20 cursor-pointer transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-3 py-2 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${
                      col.align === 'right' ? 'text-primary-c tabular-nums' : 'text-secondary-c'
                    } ${col.mono ? 'font-mono text-2xs text-primary-c' : ''} ${col.key === 'orderId' ? 'font-medium text-primary-c' : ''}`}
                  >
                    {col.render ? col.render(row[col.key]) : col.format ? col.format(row[col.key]) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-subtle">
        <div className="text-2xs text-muted-c">
          Halaman <span className="text-primary-c font-medium tabular-nums">{currentPage}</span> dari{' '}
          <span className="text-primary-c font-medium tabular-nums">{totalPages}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => gotoPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-md text-muted-c hover:text-primary-c hover:bg-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-ring"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
          </button>
          <button
            onClick={() => gotoPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-md text-muted-c hover:text-primary-c hover:bg-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-ring"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
}
