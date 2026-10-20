import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import RiskGauge from './RiskGauge.jsx';
import { RiskBadge } from './StatusBadge.jsx';
import { getMLCancelRisk, predictMLCancel } from '../services/api.js';
import { formatNumber, formatPercent } from '../lib/format.js';

// Semua angka dari POST /recommendations/predict-cancel & GET
// /recommendations/cancel-risk (versi lama) — kalkulasi lokal fiktif milik
// mock dihapus. Skor gabungan model tidak ada di API, jadi baris
// F1/Precision-Recall kelas 1 yang tersedia yang ditampilkan.
const CATEGORY_OPTIONS = ['Set', 'Kurta', 'Western Dress', 'Top', 'Blouse', 'Ethnic Dress'];
const SIZE_OPTIONS = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];
const STATE_OPTIONS = ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Uttar Pradesh'];

const RISK_TABS = [
  { id: 'category', label: 'Kategori' },
  { id: 'fulfilment', label: 'Jalur' },
  { id: 'price', label: 'Harga' },
  { id: 'day', label: 'Hari' },
];

const DAY_LABELS = {
  '0': 'Minggu',
  '1': 'Senin',
  '2': 'Selasa',
  '3': 'Rabu',
  '4': 'Kamis',
  '5': 'Jumat',
  '6': 'Sabtu',
};

function shuffleRiskSection(riskData, tabId) {
  const entries = Object.entries(riskData || {});
  return entries.map(([key, v]) => ({
    label: tabId === 'day' ? (DAY_LABELS[key] || key) : key,
    total: v.total_orders,
    cancelled: v.cancelled_orders,
    rate: (v.cancel_rate || 0) * 100,
    level: v.risk_level,
  })).sort((a, b) => b.rate - a.rate);
}

function FeatureImportanceChart({ features }) {
  const data = (features || []).slice(0, 6);
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
        <XAxis type="number" domain={[0, 0.55]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
        <YAxis type="category" dataKey="feature" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} tickLine={false} axisLine={false} width={120} />
        <Tooltip
          contentStyle={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: '6px',
            fontSize: '11px',
          }}
          formatter={(v) => [`${(v * 100).toFixed(2)}%`, 'Importance']}
          cursor={{ fill: 'var(--bg-subtle)' }}
        />
        <Bar dataKey="importance" radius={[0, 3, 3, 0]} barSize={14} animationDuration={600}>
          {data.map((_, i) => (
            <Cell key={i} fill={i === 0 ? '#2457FF' : '#8aa6ff'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function RiskByDimensionTable({ rows }) {
  if (!rows || rows.length === 0) {
    return <div className="text-xs text-muted-c p-4 text-center">Data risiko tidak tersedia</div>;
  }
  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-subtle text-muted-c">
            <th className="text-left font-medium px-4 py-2.5">Segmen</th>
            <th className="text-right font-medium px-3 py-2.5">Total Pesanan</th>
            <th className="text-right font-medium px-3 py-2.5">Dibatalkan</th>
            <th className="text-right font-medium px-3 py-2.5">Risiko</th>
            <th className="text-center font-medium px-4 py-2.5">Level</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b border-subtle hover:bg-subtle transition-colors">
              <td className="px-4 py-2 text-secondary-c font-medium">{r.label}</td>
              <td className="px-3 py-2 text-right text-primary-c tabular-nums">{formatNumber(r.total)}</td>
              <td className="px-3 py-2 text-right text-secondary-c tabular-nums">{formatNumber(r.cancelled)}</td>
              <td className={`px-3 py-2 text-right tabular-nums font-medium ${r.rate > 15 ? 'text-danger-600 dark:text-danger-400' : 'text-primary-c'}`}>
                {formatPercent(r.rate)}
              </td>
              <td className="px-4 py-2 text-center"><RiskBadge level={r.level} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CancelRiskPanel() {
  const [cancelRiskData, setCancelRiskData] = useState(null);
  const [loadingRisk, setLoadingRisk] = useState(true);
  const [riskError, setRiskError] = useState(null);
  const [activeTab, setActiveTab] = useState('category');
  const [refreshKey, setRefreshKey] = useState(0);

  const [form, setForm] = useState({
    Category: 'Kurta',
    Size: 'L',
    is_fba: 1,
    is_expedited: 1,
    ship_state_clean: 'Maharashtra',
    unit_price: 599,
    qty_imputed: 1,
    has_promotion: 1,
    is_b2b: 0,
    day_of_week: 2,
    day_of_month: 15,
  });
  const [simulating, setSimulating] = useState(false);
  const [simError, setSimError] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);

  useEffect(() => {
    setLoadingRisk(true);
    setRiskError(null);
    getMLCancelRisk()
      .then(setCancelRiskData)
      .catch((err) => {
        console.error('Gagal memuat risiko pembatalan:', err);
        setRiskError('Data risiko pembatalan tidak dapat dimuat. Pastikan backend berjalan.');
      })
      .finally(() => setLoadingRisk(false));
  }, [refreshKey]);

  const metrics = cancelRiskData?.model_metrics;
  const cm = metrics?.confusion_matrix || [[0, 0], [0, 0]];

  const riskRows = useMemo(
    () => shuffleRiskSection(
      cancelRiskData?.[`risk_by_${activeTab === 'price' ? 'price_tier' : activeTab === 'day' ? 'day_of_week' : activeTab}`],
      activeTab
    ),
    [cancelRiskData, activeTab]
  );

  const handleSimulate = async (e) => {
    e.preventDefault();
    setSimulating(true);
    setSimError(null);
    try {
      const res = await predictMLCancel({
        Category: form.Category,
        Size: form.Size,
        is_fba: Number(form.is_fba),
        is_expedited: Number(form.is_expedited),
        ship_state_clean: form.ship_state_clean,
        unit_price: Number(form.unit_price),
        qty_imputed: Number(form.qty_imputed),
        has_promotion: Number(form.has_promotion),
        is_b2b: Number(form.is_b2b),
        day_of_week: Number(form.day_of_week),
        day_of_month: Number(form.day_of_month),
      });
      setPredictionResult(res.prediction);
    } catch (err) {
      console.error('Gagal memproses prediksi:', err);
      setSimError('Prediksi gagal diproses. Coba lagi.');
    } finally {
      setSimulating(false);
    }
  };

  const updateForm = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const selectClass =
    'w-full bg-subtle border border-default rounded-md px-2 py-1.5 text-xs text-primary-c focus-ring focus:border-accent-400';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Model Metrics Panel */}
      <div className="space-y-4">
        <div className="bg-surface border border-default rounded-lg p-5">
          <h3 className="text-sm font-medium text-primary-c mb-4">Metrik Model</h3>
          {riskError ? (
            <p className="text-xs text-danger-600 dark:text-danger-400">{riskError}</p>
          ) : loadingRisk ? (
            <div className="grid grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-14 rounded-md" />)}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'ROC-AUC (LR)', value: metrics?.roc_auc?.toFixed(4) ?? '-' },
                { label: 'ROC-AUC (RF)', value: metrics?.rf_roc_auc?.toFixed(4) ?? '-' },
                { label: 'PR-AUC', value: metrics?.pr_auc?.toFixed(4) ?? '-' },
                { label: 'Akurasi', value: metrics?.accuracy != null ? (metrics.accuracy * 100).toFixed(2) + '%' : '-' },
                { label: 'F1 (Kelas Batal)', value: metrics?.f1_class_1?.toFixed(4) ?? '-' },
                { label: 'Recall (Kelas Batal)', value: metrics?.recall_class_1?.toFixed(4) ?? '-' },
              ].map((m) => (
                <div key={m.label} className="bg-subtle rounded-md p-3">
                  <div className="text-2xs text-muted-c uppercase tracking-wider">{m.label}</div>
                  <div className="text-sm font-semibold text-primary-c tabular-nums mt-1">{m.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confusion Matrix */}
        {!riskError && metrics && (
          <div className="bg-surface border border-default rounded-lg p-5">
            <h3 className="text-sm font-medium text-primary-c mb-4">Confusion Matrix</h3>
            <div className="grid grid-cols-3 gap-1 max-w-[260px]">
              <div className="" />
              <div className="text-center text-2xs text-muted-c uppercase font-medium pb-2">Prediksi: Batal</div>
              <div className="text-center text-2xs text-muted-c uppercase font-medium pb-2">Prediksi: Tidak</div>

              <div className="text-2xs text-muted-c uppercase font-medium pr-2 flex items-center">Aktual: Batal</div>
              <div className="bg-accent-50 dark:bg-accent-950/30 border border-accent-200 dark:border-accent-800 rounded p-3 text-center">
                <div className="text-lg font-semibold text-accent-700 dark:text-accent-300 tabular-nums">{formatNumber(cm[1][1])}</div>
                <div className="text-2xs text-muted-c">TP</div>
              </div>
              <div className="bg-danger-50 dark:bg-danger-950/20 border border-danger-200 dark:border-danger-800 rounded p-3 text-center">
                <div className="text-lg font-semibold text-danger-700 dark:text-danger-400 tabular-nums">{formatNumber(cm[1][0])}</div>
                <div className="text-2xs text-muted-c">FN</div>
              </div>

              <div className="text-2xs text-muted-c uppercase font-medium pr-2 flex items-center">Aktual: Tidak</div>
              <div className="bg-danger-50 dark:bg-danger-950/20 border border-danger-200 dark:border-danger-800 rounded p-3 text-center">
                <div className="text-lg font-semibold text-danger-700 dark:text-danger-400 tabular-nums">{formatNumber(cm[0][1])}</div>
                <div className="text-2xs text-muted-c">FP</div>
              </div>
              <div className="bg-success-50 dark:bg-success-950/20 border border-success-200 dark:border-success-800 rounded p-3 text-center">
                <div className="text-lg font-semibold text-success-700 dark:text-success-400 tabular-nums">{formatNumber(cm[0][0])}</div>
                <div className="text-2xs text-muted-c">TN</div>
              </div>
            </div>
            <p className="text-2xs text-muted-c mt-3">
              {formatNumber(metrics?.train_samples ?? 0)} sampel latihan · {formatNumber(metrics?.test_samples ?? 0)} sampel uji
            </p>
          </div>
        )}

        {/* Feature Importance */}
        {!riskError && cancelRiskData && (
          <div className="bg-surface border border-default rounded-lg p-5">
            <h3 className="text-sm font-medium text-primary-c mb-4">Feature Importance</h3>
            <FeatureImportanceChart features={cancelRiskData.top_feature_importances} />
          </div>
        )}
      </div>

      {/* Simulator + Risiko per dimensi */}
      <div className="space-y-4">
        <div className="bg-surface border border-default rounded-lg p-5">
          <h3 className="text-sm font-medium text-primary-c mb-1">Simulator Risiko Pembatalan</h3>
          <p className="text-2xs text-muted-c mb-4">Fitur model diuji via POST /predict-cancel (versi lama)</p>
          <form onSubmit={handleSimulate}>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-2xs text-muted-c uppercase tracking-wider block mb-1">Kategori</label>
                <select value={form.Category} onChange={(e) => updateForm('Category', e.target.value)} className={selectClass}>
                  {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-2xs text-muted-c uppercase tracking-wider block mb-1">Ukuran</label>
                <select value={form.Size} onChange={(e) => updateForm('Size', e.target.value)} className={selectClass}>
                  {SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-2xs text-muted-c uppercase tracking-wider block mb-1">FBA</label>
                <select value={form.is_fba} onChange={(e) => updateForm('is_fba', Number(e.target.value))} className={selectClass}>
                  <option value={1}>Amazon FBA</option>
                  <option value={0}>Merchant (Easy Ship)</option>
                </select>
              </div>
              <div>
                <label className="text-2xs text-muted-c uppercase tracking-wider block mb-1">Jalur Ekspedisi</label>
                <select value={form.is_expedited} onChange={(e) => updateForm('is_expedited', Number(e.target.value))} className={selectClass}>
                  <option value={1}>Expedited</option>
                  <option value={0}>Standar</option>
                </select>
              </div>
              <div>
                <label className="text-2xs text-muted-c uppercase tracking-wider block mb-1">Negara Bagian</label>
                <select value={form.ship_state_clean} onChange={(e) => updateForm('ship_state_clean', e.target.value)} className={selectClass}>
                  {STATE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-2xs text-muted-c uppercase tracking-wider block mb-1">Harga per Unit (₹)</label>
                <input type="number" min="0" value={form.unit_price} onChange={(e) => updateForm('unit_price', e.target.value)} className={`${selectClass} tabular-nums`} />
              </div>
              <div>
                <label className="text-2xs text-muted-c uppercase tracking-wider block mb-1">Kuantitas</label>
                <input type="number" min="0" value={form.qty_imputed} onChange={(e) => updateForm('qty_imputed', e.target.value)} className={`${selectClass} tabular-nums`} />
              </div>
              <div>
                <label className="text-2xs text-muted-c uppercase tracking-wider block mb-1">Tipe Pembeli</label>
                <select value={form.is_b2b} onChange={(e) => updateForm('is_b2b', Number(e.target.value))} className={selectClass}>
                  <option value={0}>Retail</option>
                  <option value={1}>B2B (Bisnis)</option>
                </select>
              </div>
              <div>
                <label className="text-2xs text-muted-c uppercase tracking-wider block mb-1">Hari Pesanan (0=Minggu)</label>
                <select value={form.day_of_week} onChange={(e) => updateForm('day_of_week', Number(e.target.value))} className={selectClass}>
                  {[0, 1, 2, 3, 4, 5, 6].map((d) => <option key={d} value={d}>{d} ({DAY_LABELS[d]})</option>)}
                </select>
              </div>
              <div>
                <label className="text-2xs text-muted-c uppercase tracking-wider block mb-1">Tanggal Pesanan</label>
                <input type="number" min="1" max="31" value={form.day_of_month} onChange={(e) => updateForm('day_of_month', e.target.value)} className={`${selectClass} tabular-nums`} />
              </div>
              <div className="col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.has_promotion === 1} onChange={(e) => updateForm('has_promotion', e.target.checked ? 1 : 0)} className="rounded border-default text-accent-500 focus-ring w-3.5 h-3.5" />
                  <span className="text-xs text-secondary-c">Promo diterapkan</span>
                </label>
              </div>
            </div>
            <button
              type="submit"
              disabled={simulating}
              className="w-full px-4 py-2 rounded-md text-xs font-medium bg-accent-500 text-white hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-ring"
            >
              {simulating ? 'Memproses...' : 'Prediksi Risiko'}
            </button>
            {simError && (
              <p className="mt-2 text-2xs text-danger-600 dark:text-danger-400">{simError}</p>
            )}
          </form>
        </div>

        {/* Gauge + Result */}
        {predictionResult && (
          <div className="bg-surface border border-default rounded-lg p-5 animate-fade-in">
            <RiskGauge probability={predictionResult.probability * 100} riskLevel={predictionResult.risk_level} />
            <div className="flex items-center justify-center gap-2 mt-2 mb-4">
              <span className="text-2xs text-muted-c">Tingkat Risiko:</span>
              <RiskBadge level={predictionResult.risk_level} />
            </div>

            {/* Contributing factors */}
            <div className="space-y-2">
              <div className="text-2xs font-medium text-muted-c uppercase tracking-wider">Faktor Kontribusi</div>
              {predictionResult.contributing_factors.map((f, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5 px-2 bg-subtle rounded-md">
                  {f.direction === 'Menaikkan Risiko' ? (
                    <TrendingUp className="w-3 h-3 text-danger-500 shrink-0" strokeWidth={1.75} />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-success-500 shrink-0" strokeWidth={1.75} />
                  )}
                  <span className="text-xs text-secondary-c flex-1">
                    {f.feature} <span className="text-muted-c">(= {String(f.value)})</span>
                  </span>
                  <span className="text-xs font-medium tabular-nums">
                    {f.direction === 'Menaikkan Risiko' ? '+' : ''}{f.effect}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risiko per dimensi — tabel historis versi lama */}
        {!riskError && cancelRiskData && (
          <div className="bg-surface border border-default rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-subtle flex items-center gap-1.5 flex-wrap">
              {RISK_TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                    activeTab === t.id
                      ? 'bg-accent-50 border-accent-200 text-accent-700 dark:bg-accent-950/40 dark:border-accent-800 dark:text-accent-300'
                      : 'bg-surface border-default text-secondary-c hover:text-primary-c'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <RiskByDimensionTable rows={riskRows} />
          </div>
        )}
      </div>
    </div>
  );
}
