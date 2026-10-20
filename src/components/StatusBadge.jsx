const statusConfig = {
  Shipped: { label: 'Dikirim', className: 'bg-accent-50 text-accent-700 dark:bg-accent-950/40 dark:text-accent-300' },
  Delivered: { label: 'Terkirim', className: 'bg-success-50 text-success-700 dark:bg-success-950/30 dark:text-success-400' },
  Cancelled: { label: 'Dibatalkan', className: 'bg-danger-50 text-danger-700 dark:bg-danger-950/30 dark:text-danger-400' },
  Pending: { label: 'Tertunda', className: 'bg-warning-50 text-warning-700 dark:bg-warning-950/30 dark:text-warning-400' },
  Returned: { label: 'Dikembalikan', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  Mendesak: { label: 'Mendesak', className: 'bg-danger-50 text-danger-700 dark:bg-danger-950/30 dark:text-danger-400' },
  Aman: { label: 'Aman', className: 'bg-success-50 text-success-700 dark:bg-success-950/30 dark:text-success-400' },
};

const priorityConfig = {
  Kritis: 'bg-danger-500 text-white',
  Tinggi: 'bg-warning-500 text-white',
  Sedang: 'bg-accent-500 text-white',
  Rendah: 'bg-gray-400 text-white',
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-2xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const className = priorityConfig[priority] || 'bg-gray-400 text-white';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-2xs font-medium ${className}`}>
      {priority}
    </span>
  );
}

export function RiskBadge({ level }) {
  const config = {
    Rendah: 'bg-success-50 text-success-700 dark:bg-success-950/30 dark:text-success-400',
    Sedang: 'bg-warning-50 text-warning-700 dark:bg-warning-950/30 dark:text-warning-400',
    Tinggi: 'bg-danger-50 text-danger-700 dark:bg-danger-950/30 dark:text-danger-400',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${config[level] || config.Sedang}`}>
      {level}
    </span>
  );
}
