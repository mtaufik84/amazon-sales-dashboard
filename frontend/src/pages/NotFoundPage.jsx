import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <div className="text-6xl font-bold text-primary-c tabular-nums">404</div>
      <h1 className="text-lg font-medium text-primary-c mt-4">Halaman Tidak Ditemukan</h1>
      <p className="text-sm text-muted-c mt-1 max-w-[300px]">
        Halaman yang Anda cari tidak ada atau telah dipindahkan.
      </p>
      <Link
        to="/"
        className="mt-6 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent-600 dark:text-accent-400 border border-accent-200 dark:border-accent-800 rounded-md hover:bg-accent-50 dark:hover:bg-accent-950/30 transition-colors"
      >
        <Home className="w-3.5 h-3.5" strokeWidth={1.75} />
        Kembali ke Ringkasan
      </Link>
    </div>
  );
}
