import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Package, Truck, CreditCard } from 'lucide-react';
import { orders } from '../mocks/orders.js';
import { formatINR, formatNumber, formatDate } from '../lib/format.js';
import StatusBadge from '../components/StatusBadge.jsx';

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const order = orders.find((o) => o.id === Number(id));

  if (!order) {
    return (
      <div className="p-6 max-w-[800px] mx-auto">
        <div className="text-center py-20">
          <h1 className="text-lg font-medium text-primary-c">Pesanan tidak ditemukan</h1>
          <p className="text-sm text-muted-c mt-1">Order ID #{id} tidak ada dalam data</p>
          <button
            onClick={() => navigate('/data')}
            className="mt-4 px-3 py-1.5 text-xs font-medium text-accent-600 dark:text-accent-400 border border-accent-200 dark:border-accent-800 rounded-md hover:bg-accent-50 dark:hover:bg-accent-950/30 transition-colors"
          >
            Kembali ke Daftar Pesanan
          </button>
        </div>
      </div>
    );
  }

  const subtotal = order.amount;
  const shipping = order.fulfilment === 'Amazon' ? 0 : 49;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;

  return (
    <div className="p-6 max-w-[800px] mx-auto">
      {/* Top bar (no-print) */}
      <div className="flex items-center justify-between mb-6 no-print">
        <button
          onClick={() => navigate('/data')}
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
            <div className="text-sm text-primary-c">{order.city}, {order.state}</div>
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
              <div className="text-2xs text-muted-c uppercase tracking-wider">Kategori</div>
              <div className="text-xs text-primary-c mt-0.5">{order.category}</div>
            </div>
            <div>
              <div className="text-2xs text-muted-c uppercase tracking-wider">Ukuran</div>
              <div className="text-xs text-primary-c mt-0.5">{order.size}</div>
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
              <div className="text-xs text-primary-c mt-0.5">{order.fulfilment === 'Amazon' ? 'Amazon FBA' : 'Merchant Fulfilled'}</div>
            </div>
            <div>
              <div className="text-2xs text-muted-c uppercase tracking-wider">Status</div>
              <div className="text-xs text-primary-c mt-0.5">{order.status}</div>
            </div>
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
              <span className="text-secondary-c">Subtotal ({formatNumber(order.qty)} × ₹{formatNumber(Math.round(order.amount / order.qty))})</span>
              <span className="text-primary-c tabular-nums">{formatINR(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-secondary-c">Ongkos Kirim</span>
              <span className="text-primary-c tabular-nums">{shipping === 0 ? 'Gratis' : formatINR(shipping)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-secondary-c">Pajak (GST 5%)</span>
              <span className="text-primary-c tabular-nums">{formatINR(tax)}</span>
            </div>
            <div className="border-t border-default pt-2.5 flex items-center justify-between">
              <span className="text-sm font-semibold text-primary-c">Total</span>
              <span className="text-sm font-semibold text-primary-c tabular-nums">{formatINR(total)}</span>
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
