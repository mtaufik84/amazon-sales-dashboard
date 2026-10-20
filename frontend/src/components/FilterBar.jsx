import { Search, X, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

function FilterDropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors focus-ring ${
          value !== 'all'
            ? 'bg-accent-50 border-accent-200 text-accent-700 dark:bg-accent-950/40 dark:border-accent-800 dark:text-accent-300'
            : 'bg-surface border-default text-secondary-c hover:text-primary-c hover:bg-subtle'
        }`}
      >
        {label}
        {value !== 'all' && <span className="text-accent-500">·</span>}
        {value !== 'all' && <span className="text-accent-600 dark:text-accent-400">{value}</span>}
        <ChevronDown className="w-3 h-3" strokeWidth={1.75} />
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 w-48 bg-surface border border-default rounded-md shadow-lg py-1 animate-fade-in max-h-64 overflow-y-auto scrollbar-thin">
          <button
            onClick={() => { onChange('all'); setOpen(false); }}
            className={`w-full text-left px-3 py-1.5 text-xs hover:bg-subtle transition-colors ${
              value === 'all' ? 'text-accent-600 dark:text-accent-400 font-medium' : 'text-secondary-c'
            }`}
          >
            Semua {label}
          </button>
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-subtle transition-colors ${
                value === opt ? 'text-accent-600 dark:text-accent-400 font-medium' : 'text-secondary-c'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FilterBar({ filters, onFilterChange, onReset, searchValue, onSearchChange, searchPlaceholder = 'Cari SKU, pesanan...' }) {
  const activeCount = Object.values(filters).filter((v) => v !== 'all').length;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-c" strokeWidth={1.75} />
        <input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-8 pr-3 py-1.5 bg-surface border border-default rounded-md text-xs text-primary-c placeholder:text-muted-c focus-ring focus:border-accent-400 transition-colors"
        />
      </div>

      {/* Filter dropdowns */}
      {Object.entries(filters).map(([key, config]) => (
        <FilterDropdown
          key={key}
          label={config.label}
          options={config.options}
          value={config.value}
          onChange={(val) => onFilterChange(key, val)}
        />
      ))}

      {/* Active filters & reset */}
      {activeCount > 0 && (
        <button
          onClick={onReset}
          className="flex items-center gap-1 px-2 py-1.5 text-xs text-muted-c hover:text-primary-c transition-colors"
        >
          <X className="w-3 h-3" strokeWidth={1.75} />
          Reset ({activeCount})
        </button>
      )}
    </div>
  );
}

export function ActiveFilterChips({ filters, onFilterChange }) {
  const active = Object.entries(filters).filter(([, c]) => c.value !== 'all');
  if (active.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-2">
      {active.map(([key, config]) => (
        <button
          key={key}
          onClick={() => onFilterChange(key, 'all')}
          className="inline-flex items-center gap-1.5 px-2 py-1 bg-accent-50 dark:bg-accent-950/40 text-accent-700 dark:text-accent-300 rounded text-2xs font-medium hover:bg-accent-100 dark:hover:bg-accent-900/40 transition-colors"
        >
          {config.label}: {config.value}
          <X className="w-2.5 h-2.5" strokeWidth={2} />
        </button>
      ))}
    </div>
  );
}
