import { useState, useMemo } from 'react';
import RecommendationCard from '../components/RecommendationCard.jsx';
import StockPlanTable from '../components/StockPlanTable.jsx';
import CancelRiskPanel from '../components/CancelRiskPanel.jsx';
import { recommendations, recommendationFilters } from '../mocks/recommendations.js';
import { stock } from '../mocks/stock.js';

const TABS = [
  { id: 'main', label: 'Rekomendasi Utama' },
  { id: 'stock', label: 'Rencana Stok & ROP' },
  { id: 'risk', label: 'Risiko Pembatalan' },
];

export default function RecommendationPage() {
  const [activeTab, setActiveTab] = useState('main');
  const [pillarFilter, setPillarFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const filteredRecs = useMemo(() => {
    return recommendations.filter((r) => {
      if (pillarFilter !== 'all' && r.pillar !== pillarFilter) return false;
      if (priorityFilter !== 'all' && r.priority !== priorityFilter) return false;
      return true;
    });
  }, [pillarFilter, priorityFilter]);

  const priorityOrder = { Kritis: 0, Tinggi: 1, Sedang: 2, Rendah: 3 };
  const sortedRecs = [...filteredRecs].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  const featured = sortedRecs[0];
  const rest = sortedRecs.slice(1);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-primary-c">Sistem Rekomendasi</h1>
        <p className="text-sm text-muted-c mt-0.5">Rekomendasi data-driven untuk optimasi penjualan</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-default">
        <div className="flex gap-1 relative">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-accent-600 dark:text-accent-400'
                  : 'text-secondary-c hover:text-primary-c'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-500 transition-all duration-300" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'main' && (
        <div className="space-y-4 animate-fade-in">
          {/* Filters */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-2xs text-muted-c uppercase tracking-wider mr-1">Pilar:</span>
              <button
                onClick={() => setPillarFilter('all')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                  pillarFilter === 'all' ? 'bg-accent-50 border-accent-200 text-accent-700 dark:bg-accent-950/40 dark:border-accent-800 dark:text-accent-300' : 'bg-surface border-default text-secondary-c hover:text-primary-c'
                }`}
              >
                Semua
              </button>
              {recommendationFilters.pillars.map((p) => (
                <button
                  key={p}
                  onClick={() => setPillarFilter(p)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                    pillarFilter === p ? 'bg-accent-50 border-accent-200 text-accent-700 dark:bg-accent-950/40 dark:border-accent-800 dark:text-accent-300' : 'bg-surface border-default text-secondary-c hover:text-primary-c'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="w-px h-5 bg-default mx-1" />
            <div className="flex items-center gap-1.5">
              <span className="text-2xs text-muted-c uppercase tracking-wider mr-1">Prioritas:</span>
              <button
                onClick={() => setPriorityFilter('all')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                  priorityFilter === 'all' ? 'bg-accent-50 border-accent-200 text-accent-700 dark:bg-accent-950/40 dark:border-accent-800 dark:text-accent-300' : 'bg-surface border-default text-secondary-c hover:text-primary-c'
                }`}
              >
                Semua
              </button>
              {recommendationFilters.priorities.map((p) => (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                    priorityFilter === p ? 'bg-accent-50 border-accent-200 text-accent-700 dark:bg-accent-950/40 dark:border-accent-800 dark:text-accent-300' : 'bg-surface border-default text-secondary-c hover:text-primary-c'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Featured card */}
          {featured && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <RecommendationCard recommendation={featured} featured />
              </div>
              <div className="space-y-4">
                {rest.slice(0, 2).map((r) => (
                  <RecommendationCard key={r.id} recommendation={r} />
                ))}
              </div>
            </div>
          )}

          {/* Rest of cards */}
          {rest.length > 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rest.slice(2).map((r) => (
                <RecommendationCard key={r.id} recommendation={r} />
              ))}
            </div>
          )}

          {sortedRecs.length === 0 && (
            <div className="text-center py-16 text-sm text-muted-c">Tidak ada rekomendasi untuk filter ini</div>
          )}
        </div>
      )}

      {activeTab === 'stock' && (
        <div className="animate-fade-in">
          <StockPlanTable data={stock} />
        </div>
      )}

      {activeTab === 'risk' && (
        <div className="animate-fade-in">
          <CancelRiskPanel />
        </div>
      )}
    </div>
  );
}
