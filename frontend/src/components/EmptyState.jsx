import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'Tidak ada data', message, action, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-subtle flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-muted-c" strokeWidth={1.75} />
      </div>
      <h3 className="text-sm font-medium text-primary-c">{title}</h3>
      {message && <p className="text-xs text-muted-c mt-1 max-w-[300px]">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message = 'Terjadi kesalahan saat memuat data', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-danger-50 dark:bg-danger-950/30 flex items-center justify-center mb-4">
        <span className="text-danger-500 text-lg">!</span>
      </div>
      <h3 className="text-sm font-medium text-primary-c">Gagal Memuat</h3>
      <p className="text-xs text-muted-c mt-1 max-w-[300px]">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-3 py-1.5 text-xs font-medium text-accent-600 dark:text-accent-400 border border-accent-200 dark:border-accent-800 rounded-md hover:bg-accent-50 dark:hover:bg-accent-950/30 transition-colors"
        >
          Coba lagi
        </button>
      )}
    </div>
  );
}

export function LoadingState({ message = 'Memuat data...' }) {
  return (
    <div className="flex items-center justify-center py-16 gap-3">
      <div className="w-4 h-4 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm text-muted-c">{message}</span>
    </div>
  );
}
