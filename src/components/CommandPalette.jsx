import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, LayoutDashboard, Map, Lightbulb, Table2 } from 'lucide-react';

const commands = [
  { label: 'Ringkasan', path: '/', icon: LayoutDashboard, category: 'Navigasi' },
  { label: 'Peta Segmentasi Wilayah', path: '/wilayah', icon: Map, category: 'Navigasi' },
  { label: 'Sistem Rekomendasi', path: '/rekomendasi', icon: Lightbulb, category: 'Navigasi' },
  { label: 'Daftar Pesanan', path: '/data', icon: Table2, category: 'Navigasi' },
];

export default function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (cmd) => {
    navigate(cmd.path);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) handleSelect(filtered[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center pt-[15vh] no-print" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 animate-fade-in" />
      <div
        className="relative w-full max-w-[520px] bg-surface border border-default rounded-lg shadow-xl animate-slide-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-subtle">
          <Search className="w-4 h-4 text-muted-c shrink-0" strokeWidth={1.75} />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Cari halaman atau perintah..."
            className="flex-1 bg-transparent text-sm text-primary-c placeholder:text-muted-c outline-none"
          />
          <kbd className="text-2xs bg-subtle border border-subtle rounded px-1.5 py-0.5 text-muted-c">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[320px] overflow-y-auto scrollbar-thin py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-c">Tidak ada hasil untuk "{query}"</div>
          ) : (
            filtered.map((cmd, i) => (
              <button
                key={cmd.path}
                onClick={() => handleSelect(cmd)}
                onMouseEnter={() => setSelectedIndex(i)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                  i === selectedIndex ? 'bg-accent-50 dark:bg-accent-950/50' : ''
                }`}
              >
                <cmd.icon
                  className={`w-4 h-4 shrink-0 ${i === selectedIndex ? 'text-accent-600 dark:text-accent-400' : 'text-muted-c'}`}
                  strokeWidth={1.75}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-primary-c">{cmd.label}</div>
                  <div className="text-2xs text-muted-c">{cmd.category}</div>
                </div>
                {i === selectedIndex && (
                  <ArrowRight className="w-3.5 h-3.5 text-accent-500" strokeWidth={1.75} />
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-subtle flex items-center gap-3 text-2xs text-muted-c">
          <span className="flex items-center gap-1">
            <kbd className="bg-subtle rounded px-1 py-0.5">↑↓</kbd> navigasi
          </span>
          <span className="flex items-center gap-1">
            <kbd className="bg-subtle rounded px-1 py-0.5">↵</kbd> pilih
          </span>
        </div>
      </div>
    </div>
  );
}
