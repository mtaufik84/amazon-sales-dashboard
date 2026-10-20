import { useLocation } from 'react-router-dom';
import { Search, Sun, Moon, Command } from 'lucide-react';
import { useTheme } from './ThemeContext.jsx';

const routeLabels = {
  '/': 'Ringkasan',
  '/wilayah': 'Peta Segmentasi Wilayah',
  '/rekomendasi': 'Sistem Rekomendasi',
  '/data': 'Daftar Pesanan',
};

export default function Topbar({ onOpenCommand }) {
  const location = useLocation();
  const { theme, toggle } = useTheme();

  const currentLabel = routeLabels[location.pathname.split('/')[1] ? '/' + location.pathname.split('/')[1] : '/'] || 'Halaman Tidak Dikenal';

  return (
    <header className="h-14 bg-surface border-b border-default flex items-center justify-between px-5 shrink-0 no-print">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-c">Analitik</span>
        <span className="text-muted-c">/</span>
        <span className="text-primary-c font-medium">{currentLabel}</span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenCommand}
          className="flex items-center gap-2 px-3 py-1.5 bg-subtle border border-subtle rounded-md text-muted-c hover:text-primary-c hover:border-default transition-colors focus-ring w-[240px]"
        >
          <Search className="w-3.5 h-3.5" strokeWidth={1.75} />
          <span className="text-xs flex-1 text-left">Cari halaman, SKU, pesanan...</span>
          <kbd className="flex items-center gap-0.5 text-2xs bg-surface border border-default rounded px-1 py-0.5">
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        </button>

        <button
          onClick={toggle}
          className="p-2 rounded-md text-secondary-c hover:text-primary-c hover:bg-subtle transition-colors focus-ring"
          title={theme === 'light' ? 'Mode gelap' : 'Mode terang'}
        >
          {theme === 'light' ? (
            <Moon className="w-[18px] h-[18px]" strokeWidth={1.75} />
          ) : (
            <Sun className="w-[18px] h-[18px]" strokeWidth={1.75} />
          )}
        </button>
      </div>
    </header>
  );
}
