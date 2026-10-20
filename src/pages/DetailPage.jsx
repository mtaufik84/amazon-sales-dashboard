import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Package, Truck, CreditCard, Building2 } from 'lucide-react';
import { getSalesById } from '../services/api.js';
import { formatINR, formatNumber, formatDate } from '../lib/format.js';
import StatusBadge from '../components/StatusBadge.jsx';

// Sumber data: GET /api/sales/:id (versi lama), ID dicocokkan sebagai String
// karena backend menangani String(id). Ongkir/GST fiktif milik mock dihapus,
// ringkasan keuangan hanya memakai jumlah riil dari API.
export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ok | notfound | error

  useEffect(() => {
    setStatus('loading');
    getSalesById(id)
      .then((data) => {
        setOrder(data);
        setStatus('ok');
      })
      .catch((err) => {
        console.error('Gagal memuat detail pesanan:', err);
        if (err?.response?.status === 404) setStatus('notfound');
        else setStatus('error');
      });
  }, [id]);

  const handleBack = () => navigate('/data'); // kembali /data seperti versi lama

  if (status === 'loading') {
    return (
      <div className="p-6 max-w-[800px] mx-auto">
        <div className="skeleton h-9 w-full rounded-md mb-4" />
        <div className="border border-default rounded-lg">
          <div className="skeleton h-20 w-full rounded-t-lg" />
          <div className="p-8 space-y-4">
            <div className="skeleton h-4 w-40 rounded" />
            <div className="skeleton h-4 w-64 rounded" />
            <div className="skeleton h-24 w-full rounded" />
            <div className="skeleton h-16 w-full rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (status !== 'ok' || !order) {
    return (
      <div className="p-6 max-w-[800px] mx-auto">
        <div className="text-center py-20">
          <h1 className="text-lg font-medium text-primary-c">
            {status === 'notfound' ? 'Pesanan tidak ditemukan' : 'Gagal memuat pesanan'}
          </h1>
          <p className="text-sm text-muted-c mt-1">
            {status === 'notfound'
              ? `Order ID #${id} tidak ada dalam data`
              : 'Terjadi kendala saat memuat data'}
          </p>
          <button
            onClick={handleBack}
            className="mt-4 px-3 py-1.5 text-xs font-medium text-accent-600 dark:text-accent-400 border border-accent-200 dark:border-accent-800 rounded-md hover:bg-accent-50 dark:hover:bg-accent-950/30 transition-colors"
          >
            Kembali ke Daftar Pesanan
          </button>
        </div>
      </div>
    );
  }

  const unitPrice = order.qty > 0 ? order.amount / order.qty : order.amount;

  return (
    <div className="p-6 max-w-[800px] mx-auto">
      {/* Top bar (no-print) */}
      <div className="flex items-center justify-between mb-6 no-print">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sm text-secondary-c hover:text-primary-c transition-colors focus-ring rounded-md"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
          Kembali
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-secondary-c border border-default rounded-md hover:text-primary-c hover:bg-subtle transition-colors focus-ring"
        >
          <Printer className="w-3.5 h-3.5" strokeWidth={1.75} /> Cetak
        </button>
      </div>

      {/* Invoice */}
      <div className="bg-surface border border-default rounded-lg p-8 print-page">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b border-subtle">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-md bg-accent-500 flex items-center justify-center">
                <Package className="w-4 h-4 text-white" strokeWidth={1.75} />
              </div>
              <span className="text-sm font-semibold text-primary-c">Amazon Analytics</span>
            </div>
            <p className="text-2xs text-muted-c">Amazon India · Women's Fashion</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-semibold text-primary-c">Faktur Pesanan</h2>
            <p className="text-xs text-muted-c mt-0.5">{order.orderId}</p>
            <div className="mt-2"><StatusBadge status={order.status} /></div>
          </div>
        </div>

        {/* Order info */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <div className="text-2xs text-muted-c uppercase tracking-wider mb-1.5">Tanggal Pesanan</div>
            <div className="text-sm text-primary-c">{formatDate(order.date)}</div>
          </div>
          <div>
            <div className="text-2xs text-muted-c uppercase tracking-wider mb-1.5">Tujuan</div>
            <div className="text-sm text-primary-c">
              {order.city}, {order.state}{order.postalCode ? ` (${order.postalCode})` : ''}
            </div>
          </div>
        </div>

        {/* Product spec */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-muted-c" strokeWidth={1.75} />
            <h3 className="text-sm font-medium text-primary-c">Spesifikasi Produk</h3>
          </div>
          <div className="bg-subtle rounded-md p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-2xs text-muted-c uppercase tracking-wider">SKU</div>
              <div className="text-xs font-mono text-primary-c mt-0.5">{order.sku}</div>
            </div>
            <div>
              <div className="text-2xs text-muted-c uppercase tracking-wider">Kategori · Style</div>
              <div className="text-xs text-primary-c mt-0.5">{order.category}{order.style ? ` · ${order.style}` : ''}</div>
            </div>
            <div>
              <div className="text-2xs text-muted-c uppercase tracking-wider">Ukuran · ASIN</div>
              <div className="text-xs font-mono text-primary-c mt-0.5">{order.size}{order.asin ? ` · ${order.asin}` : ''}</div>
            </div>
            <div>
              <div className="text-2xs text-muted-c uppercase tracking-wider">Kuantitas</div>
              <div className="text-xs text-primary-c tabular-nums mt-0.5">{formatNumber(order.qty)} unit</div>
            </div>
          </div>
        </div>

        {/* Shipping & logistics */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Truck className="w-4 h-4 text-muted-c" strokeWidth={1.75} />
            <h3 className="text-sm font-medium text-primary-c">Pengiriman & Logistik</h3>
          </div>
          <div className="bg-subtle rounded-md p-4 grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xs text-muted-c uppercase tracking-wider">Fulfilment</div>
              <div className="text-xs text-primary-c mt-0.5">{order.fulfilment === 'Amazon' ? 'Amazon FBA' : 'Merchant (Easy Ship)'}</div>
            </div>
            <div>
              <div className="text-2xs text-muted-c uppercase tracking-wider">Channel</div>
              <div className="text-xs text-primary-c mt-0.5">{order.channel}</div>
            </div>
            <div>
              <div className="text-2xs text-muted-c uppercase tracking-wider">Service Level</div>
              <div className="text-xs text-primary-c mt-0.5">{order.serviceLevel}</div>
            </div>
            <div>
              <div className="text-2xs text-muted-c uppercase tracking-wider">Status Kurir</div>
              <div className="text-xs text-primary-c mt-0.5">{order.courierStatus || '-'}</div>
            </div>
          </div>
        </div>

        {/* Ringkasan pembeli */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-muted-c" strokeWidth={1.75} />
            <h3 className="text-sm font-medium text-primary-c">Tipe Pembeli</h3>
          </div>
          <div className="bg-subtle rounded-md p-4 text-xs text-primary-c">
            {order.b2b ? 'B2B (Bisnis)' : 'Retail'}
          </div>
        </div>

        {/* Financial summary */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-4 h-4 text-muted-c" strokeWidth={1.75} />
            <h3 className="text-sm font-medium text-primary-c">Ringkasan Keuangan</h3>
          </div>
          <div className="bg-subtle rounded-md p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-secondary-c">Harga per Unit</span>
              <span className="text-primary-c tabular-nums">{formatINR(Math.round(unitPrice))}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-secondary-c">Kuantitas</span>
              <span className="text-primary-c tabular-nums">{formatNumber(order.qty)}</span>
            </div>
            <div className="border-t border-default pt-2.5 flex items-center justify-between">
              <span className="text-sm font-semibold text-primary-c">Jumlah ({order.currency})</span>
              <span className="text-sm font-semibold text-primary-c tabular-nums">{formatINR(order.amount)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-subtle text-center">
          <p className="text-2xs text-muted-c">Faktur ini dibuat secara otomatis · Amazon Analytics Platform</p>
        </div>
      </div>
    </div>
  );
}
