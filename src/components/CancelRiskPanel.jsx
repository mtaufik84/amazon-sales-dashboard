import { useState, useMemo } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import RiskGauge from './RiskGauge.jsx';
import { RiskBadge } from './StatusBadge.jsx';
import { cancelRiskModel, cancelRiskSimulator } from '../mocks/cancelRisk.js';

const cm = cancelRiskModel.confusion_matrix;

const confusionMatrix = [
  { label: '', pred: 'Tidak', pred2: 'Batal' },
  { actual: 'Tidak', tn: cm.true_negative, fp: cm.false_positive },
  { actual: 'Batal', fn: cm.false_negative, tp: cm.true_positive },
];

function calculateRisk(form) {
  let score = 0.15;
  if (form.fulfilment === 'Merchant') score += 0.18;
  if (form.service === 'Ekspress') score += 0.14;
  if (form.amount > 2000) score += 0.12;
  if (form.promo) score += 0.09;
  const tier3States = ['Bihar', 'Odisha', 'Assam', 'Jharkhand', 'Chhattisgarh'];
  if (tier3States.includes(form.state)) score += 0.08;
  if (['XXL', '3XL'].includes(form.size)) score += 0.07;
  if (form.category === 'Gown') score += 0.06;
  score = Math.min(score, 0.95);
  const level = score < 0.35 ? 'Rendah' : score < 0.65 ? 'Sedang' : 'Tinggi';
  const factors = [];
  if (form.fulfilment === 'Merchant') factors.push({ feature: 'Fulfilment Merchant', effect: '+18%', direction: 'up' });
  if (form.service === 'Ekspress') factors.push({ feature: 'Layanan Ekspress', effect: '+14%', direction: 'up' });
  if (form.amount > 2000) factors.push({ feature: 'Nilai transaksi tinggi', effect: '+12%', direction: 'up' });
  if (form.promo) factors.push({ feature: 'Promo diterapkan', effect: '+9%', direction: 'up' });
  if (tier3States.includes(form.state)) factors.push({ feature: 'Negara bagian tier-3', effect: '+8%', direction: 'up' });
  if (['XXL', '3XL'].includes(form.size)) factors.push({ feature: `Ukuran ${form.size}`, effect: '+7%', direction: 'up' });
  if (form.category === 'Gown') factors.push({ feature: 'Kategori Gown', effect: '+6%', direction: 'up' });
  if (factors.length === 0) factors.push({ feature: 'Tidak ada faktor risiko dominan', effect: '0%', direction: 'down' });
  return { probability: score * 100, level, factors };
}

function FeatureImportanceChart() {
  const data = cancelRiskModel.feature_importance.slice(0, 6);
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
        <XAxis type="number" domain={[0, 0.2]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
        <YAxis type="category" dataKey="feature" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} tickLine={false} axisLine={false} width={120} />
        <Tooltip
          contentStyle={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: '6px',
            fontSize: '11px',
          }}
          formatter={(v) => [(v * 100).toFixed(2) + '%', 'Importance']}
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

export default function CancelRiskPanel() {
  const [form, setForm] = useState({
    category: 'Set',
    size: 'M',
    fulfilment: 'Merchant',
    service: 'Standar',
    state: 'Maharashtra',
    promo: false,
    amount: 1500,
  });

  const result = useMemo(() => calculateRisk(form), [form]);

  const updateForm = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Model Metrics Panel */}
      <div className="space-y-4">
        <div className="bg-surface border border-default rounded-lg p-5">
          <h3 className="text-sm font-medium text-primary-c mb-4">Metrik Model</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'ROC-AUC', value: cancelRiskModel.roc_auc.toFixed(4) },
              { label: 'Akurasi', value: cancelRiskModel.accuracy.toFixed(2) + '%' },
              { label: 'F1 Score', value: cancelRiskModel.f1.toFixed(4) },
              { label: 'Presisi', value: cancelRiskModel.precision.toFixed(4) },
              { label: 'Recall', value: cancelRiskModel.recall.toFixed(4) },
              { label: 'Threshold', value: '0.5' },
            ].map((m) => (
              <div key={m.label} className="bg-subtle rounded-md p-3">
                <div className="text-2xs text-muted-c uppercase tracking-wider">{m.label}</div>
                <div className="text-sm font-semibold text-primary-c tabular-nums mt-1">{m.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Confusion Matrix */}
        <div className="bg-surface border border-default rounded-lg p-5">
          <h3 className="text-sm font-medium text-primary-c mb-4">Confusion Matrix</h3>
          <div className="grid grid-cols-3 gap-1 max-w-[260px]">
            <div className="" />
            <div className="text-center text-2xs text-muted-c uppercase font-medium pb-2">Prediksi: Batal</div>
            <div className="text-center text-2xs text-muted-c uppercase font-medium pb-2">Prediksi: Tidak</div>

            <div className="text-2xs text-muted-c uppercase font-medium pr-2 flex items-center">Aktual: Batal</div>
            <div className="bg-accent-50 dark:bg-accent-950/30 border border-accent-200 dark:border-accent-800 rounded p-3 text-center">
              <div className="text-lg font-semibold text-accent-700 dark:text-accent-300 tabular-nums">{cm.true_positive}</div>
              <div className="text-2xs text-muted-c">TP</div>
            </div>
            <div className="bg-danger-50 dark:bg-danger-950/20 border border-danger-200 dark:border-danger-800 rounded p-3 text-center">
              <div className="text-lg font-semibold text-danger-700 dark:text-danger-400 tabular-nums">{cm.false_negative}</div>
              <div className="text-2xs text-muted-c">FN</div>
            </div>

            <div className="text-2xs text-muted-c uppercase font-medium pr-2 flex items-center">Aktual: Tidak</div>
            <div className="bg-danger-50 dark:bg-danger-950/20 border border-danger-200 dark:border-danger-800 rounded p-3 text-center">
              <div className="text-lg font-semibold text-danger-700 dark:text-danger-400 tabular-nums">{cm.false_positive}</div>
              <div className="text-2xs text-muted-c">FP</div>
            </div>
            <div className="bg-success-50 dark:bg-success-950/20 border border-success-200 dark:border-success-800 rounded p-3 text-center">
              <div className="text-lg font-semibold text-success-700 dark:text-success-400 tabular-nums">{cm.true_negative}</div>
              <div className="text-2xs text-muted-c">TN</div>
            </div>
          </div>
        </div>

        {/* Feature Importance */}
        <div className="bg-surface border border-default rounded-lg p-5">
          <h3 className="text-sm font-medium text-primary-c mb-4">Feature Importance</h3>
          <FeatureImportanceChart />
        </div>
      </div>

      {/* Simulator */}
      <div className="space-y-4">
        <div className="bg-surface border border-default rounded-lg p-5">
          <h3 className="text-sm font-medium text-primary-c mb-1">Simulator Risiko Pembatalan</h3>
          <p className="text-2xs text-muted-c mb-4">Atur parameter untuk melihat estimasi risiko</p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-2xs text-muted-c uppercase tracking-wider block mb-1">Kategori</label>
              <select value={form.category} onChange={(e) => updateForm('category', e.target.value)} className="w-full bg-subtle border border-default rounded-md px-2 py-1.5 text-xs text-primary-c focus-ring focus:border-accent-400">
                {cancelRiskSimulator.categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-2xs text-muted-c uppercase tracking-wider block mb-1">Ukuran</label>
              <select value={form.size} onChange={(e) => updateForm('size', e.target.value)} className="w-full bg-subtle border border-default rounded-md px-2 py-1.5 text-xs text-primary-c focus-ring focus:border-accent-400">
                {cancelRiskSimulator.sizes.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-2xs text-muted-c uppercase tracking-wider block mb-1">Fulfilment</label>
              <select value={form.fulfilment} onChange={(e) => updateForm('fulfilment', e.target.value)} className="w-full bg-subtle border border-default rounded-md px-2 py-1.5 text-xs text-primary-c focus-ring focus:border-accent-400">
                {cancelRiskSimulator.fulfilments.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-2xs text-muted-c uppercase tracking-wider block mb-1">Layanan</label>
              <select value={form.service} onChange={(e) => updateForm('service', e.target.value)} className="w-full bg-subtle border border-default rounded-md px-2 py-1.5 text-xs text-primary-c focus-ring focus:border-accent-400">
                {cancelRiskSimulator.services.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-2xs text-muted-c uppercase tracking-wider block mb-1">Negara Bagian</label>
              <select value={form.state} onChange={(e) => updateForm('state', e.target.value)} className="w-full bg-subtle border border-default rounded-md px-2 py-1.5 text-xs text-primary-c focus-ring focus:border-accent-400">
                {cancelRiskSimulator.states.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-2xs text-muted-c uppercase tracking-wider block mb-1">Nilai Transaksi (₹)</label>
              <input type="number" value={form.amount} onChange={(e) => updateForm('amount', Number(e.target.value))} className="w-full bg-subtle border border-default rounded-md px-2 py-1.5 text-xs text-primary-c tabular-nums focus-ring focus:border-accent-400" />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.promo} onChange={(e) => updateForm('promo', e.target.checked)} className="rounded border-default text-accent-500 focus-ring w-3.5 h-3.5" />
                <span className="text-xs text-secondary-c">Promo diterapkan</span>
              </label>
            </div>
          </div>
        </div>

        {/* Gauge + Result */}
        <div className="bg-surface border border-default rounded-lg p-5">
          <RiskGauge probability={result.probability} riskLevel={result.level} />
          <div className="flex items-center justify-center gap-2 mt-2 mb-4">
            <span className="text-2xs text-muted-c">Tingkat Risiko:</span>
            <RiskBadge level={result.level} />
          </div>

          {/* Contributing factors */}
          <div className="space-y-2">
            <div className="text-2xs font-medium text-muted-c uppercase tracking-wider">Faktor Kontribusi</div>
            {result.factors.map((f, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5 px-2 bg-subtle rounded-md">
                {f.direction === 'up' ? (
                  <TrendingUp className="w-3 h-3 text-danger-500 shrink-0" strokeWidth={1.75} />
                ) : (
                  <TrendingDown className="w-3 h-3 text-success-500 shrink-0" strokeWidth={1.75} />
                )}
                <span className="text-xs text-secondary-c flex-1">{f.feature}</span>
                <span className={`text-xs font-medium tabular-nums ${f.direction === 'up' ? 'text-danger-600 dark:text-danger-400' : 'text-success-600 dark:text-success-400'}`}>
                  {f.effect}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
