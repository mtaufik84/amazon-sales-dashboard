import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Copy, Download } from 'lucide-react';
import { formatINR, formatNumber } from '../lib/format.js';
import StatusBadge from './StatusBadge.jsx';
import { useToast } from './Toast.jsx';

function SortHeader({ label, active, direction, onClick, align = 'left' }) {
  return (
    <th
      onClick={onClick}
      className={`px-3 py-2.5 cursor-pointer select-none hover:text-primary-c transition-colors text-${align}`}
    >
      <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : ''}`}>
        <span className="font-medium">{label}</span>
        {active && (
          direction === 'asc'
            ? <ChevronUp className="w-3 h-3" strokeWidth={1.75} />
            : <ChevronDown className="w-3 h-3" strokeWidth={1.75} />
        )}
      </div>
    </th>
  );
}

export default function StockPlanTable({ data, loading }) {
  const [sortKey, setSortKey] = useState('estimatedReorderCost');
  const [sortDir, setSortDir] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('all');
  const { showToast } = useToast();

  const sorted = useMemo(() => {
    let filtered = data;
    if (statusFilter !== 'all') {
      filtered = data.filter((r) => r.status === statusFilter);
    }
    const sorted = [...filtered].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      const cmp = typeof aVal === 'number' ? aVal - bVal : String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [data, sortKey, sortDir, statusFilter]);

  const handleSort = (key) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const totalCost = data.reduce((sum, r) => sum + r.estimatedReorderCost, 0);
  const urgentCount = data.filter((r) => r.status === 'Mendesak').length;

  const handleCopy = () => {
    const text = sorted.map((r) =>
      `${r.sku}\t${r.category}\t${r.size}\t${r.ads}\t${r.forecast14d}\t${r.safetyStock}\t${r.reorderPoint}\t${r.status}\t${r.estimatedReorderCost}`
    ).join('\n');
    navigator.clipboard.writeText(`SKU\tKategori\tUkuran\tADS\tRamalan 14h\tSafety Stock\tROP\tStatus\tBiaya\n${text}`);
    showToast('Rencana pembelian disalin ke clipboard');
  };

  const handleDownload = () => {
    const headers = ['SKU', 'Kategori', 'Ukuran', 'ADS', 'Ramalan 14h', 'Safety Stock', 'ROP', 'Status', 'Biaya'];
    const rows = sorted.map((r) => [r.sku, r.category, r.size, r.ads, r.forecast14d, r.safetyStock, r.reorderPoint, r.status, r.estimatedReorderCost]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rencana-stok-rop.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('File CSV diunduh', { type: 'success' });
  };

  if (loading) {
    return <div className="skeleton h-[400px] w-full rounded-lg" />;
  }

  return (
    <div>
      {/* Summary strip */}
      <div className="flex flex-wrap items-center gap-4 mb-4 px-4 py-3 bg-surface border border-default rounded-lg">
        <div>
          <span className="text-2xs text-muted-c uppercase tracking-wider">Total SKU</span>
          <div className="text-sm font-semibold text-primary-c tabular-nums">{formatNumber(data.length)}</div>
        </div>
        <div className="w-px h-8 bg-default" />
        <div>
          <span className="text-2xs text-muted-c uppercase tracking-wider">Mendesak</span>
          <div className="text-sm font-semibold text-danger-600 dark:text-danger-400 tabular-nums">{urgentCount} SKU</div>
        </div>
        <div className="w-px h-8 bg-default" />
        <div>
          <span className="text-2xs text-muted-c uppercase tracking-wider">Total Biaya Reorder</span>
          <div className="text-sm font-semibold text-primary-c tabular-nums">{formatINR(totalCost)}</div>
        </div>
        <div className="flex-1" />
        {/* Status filter */}
        <div className="flex items-center gap-1.5">
          {['all', 'Mendesak', 'Aman'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                statusFilter === s
                  ? 'bg-accent-50 border-accent-200 text-accent-700 dark:bg-accent-950/40 dark:border-accent-800 dark:text-accent-300'
                  : 'bg-surface border-default text-secondary-c hover:text-primary-c'
              }`}
            >
              {s === 'all' ? 'Semua' : s}
            </button>
          ))}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-secondary-c border border-default rounded-md hover:text-primary-c hover:bg-subtle transition-colors focus-ring"
        >
          <Copy className="w-3 h-3" strokeWidth={1.75} /> Salin
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-secondary-c border border-default rounded-md hover:text-primary-c hover:bg-subtle transition-colors focus-ring"
        >
          <Download className="w-3 h-3" strokeWidth={1.75} /> CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-surface border border-default rounded-lg overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-subtle text-muted-c bg-subtle sticky top-0 z-10">
                <SortHeader label="SKU" active={sortKey === 'sku'} direction={sortDir} onClick={() => handleSort('sku')} />
                <SortHeader label="Kategori" active={sortKey === 'category'} direction={sortDir} onClick={() => handleSort('category')} />
                <SortHeader label="Ukuran" active={sortKey === 'size'} direction={sortDir} onClick={() => handleSort('size')} />
                <SortHeader label="ADS" active={sortKey === 'ads'} direction={sortDir} onClick={() => handleSort('ads')} align="right" />
                <SortHeader label="Ramalan 14h" active={sortKey === 'forecast14d'} direction={sortDir} onClick={() => handleSort('forecast14d')} align="right" />
                <SortHeader label="Safety Stock" active={sortKey === 'safetyStock'} direction={sortDir} onClick={() => handleSort('safetyStock')} align="right" />
                <SortHeader label="ROP" active={sortKey === 'reorderPoint'} direction={sortDir} onClick={() => handleSort('reorderPoint')} align="right" />
                <th className="px-3 py-2.5 text-center font-medium">Status</th>
                <SortHeader label="Biaya" active={sortKey === 'estimatedReorderCost'} direction={sortDir} onClick={() => handleSort('estimatedReorderCost')} align="right" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr key={row.id} className="border-b border-subtle hover:bg-subtle transition-colors">
                  <td className="px-3 py-2.5 text-primary-c font-medium font-mono text-2xs">{row.sku}</td>
                  <td className="px-3 py-2.5 text-secondary-c">{row.category}</td>
                  <td className="px-3 py-2.5 text-secondary-c">{row.size}</td>
                  <td className="px-3 py-2.5 text-right text-primary-c tabular-nums">{row.ads.toFixed(1)}</td>
                  <td className="px-3 py-2.5 text-right text-primary-c tabular-nums">{formatNumber(row.forecast14d)}</td>
                  <td className="px-3 py-2.5 text-right text-primary-c tabular-nums">{formatNumber(row.safetyStock)}</td>
                  <td className="px-3 py-2.5 text-right text-primary-c tabular-nums font-medium">{formatNumber(row.reorderPoint)}</td>
                  <td className="px-3 py-2.5 text-center"><StatusBadge status={row.status} /></td>
                  <td className="px-3 py-2.5 text-right text-primary-c tabular-nums">{formatINR(row.estimatedReorderCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
