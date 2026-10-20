import { formatINRCompact, formatNumber, formatPercent } from '../lib/format.js';

export default function ClusterTable({ clusters, geoData, selectedCluster, onClusterToggle }) {
  const clusterList = Object.entries(clusters).map(([id, c]) => ({ id, ...c }));

  return (
    <div className="bg-surface border border-default rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-subtle">
        <h3 className="text-sm font-medium text-primary-c">Perbandingan Cluster</h3>
        <p className="text-2xs text-muted-c mt-0.5">Klik legenda untuk menyorot cluster</p>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-subtle text-muted-c">
              <th className="text-left font-medium px-4 py-2.5">Cluster</th>
              <th className="text-center font-medium px-3 py-2.5">Negara</th>
              <th className="text-right font-medium px-3 py-2.5">Avg Pesanan</th>
              <th className="text-right font-medium px-3 py-2.5">Avg Pendapatan</th>
              <th className="text-right font-medium px-3 py-2.5">Pembatalan</th>
              <th className="text-right font-medium px-3 py-2.5">Avg Harga</th>
              <th className="text-right font-medium px-4 py-2.5">FBA Share</th>
            </tr>
          </thead>
          <tbody>
            {clusterList.map((c) => {
              const isDimmed = selectedCluster !== null && selectedCluster !== c.id;
              return (
                <tr
                  key={c.id}
                  onClick={() => onClusterToggle?.(selectedCluster === c.id ? null : c.id)}
                  className={`border-b border-subtle cursor-pointer transition-colors hover:bg-subtle ${
                    selectedCluster === c.id ? 'bg-accent-50 dark:bg-accent-950/30' : ''
                  } ${isDimmed ? 'opacity-40' : ''}`}
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="text-primary-c font-medium">{c.label}</span>
                    </div>
                  </td>
                  <td className="text-center text-secondary-c tabular-nums px-3 py-2.5">{c.state_count}</td>
                  <td className="text-right text-primary-c tabular-nums px-3 py-2.5">{formatNumber(c.avg_metrics.avg_orders)}</td>
                  <td className="text-right text-primary-c tabular-nums px-3 py-2.5">{formatINRCompact(c.avg_metrics.avg_revenue)}</td>
                  <td className={`text-right tabular-nums px-3 py-2.5 ${c.avg_metrics.cancellation_rate > 15 ? 'text-danger-600 dark:text-danger-400' : 'text-secondary-c'}`}>
                    {formatPercent(c.avg_metrics.cancellation_rate)}
                  </td>
                  <td className="text-right text-primary-c tabular-nums px-3 py-2.5">₹{formatNumber(c.avg_metrics.avg_unit_price)}</td>
                  <td className="text-right text-secondary-c tabular-nums px-4 py-2.5">{formatPercent(c.avg_metrics.fba_share)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
