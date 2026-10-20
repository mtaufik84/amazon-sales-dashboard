import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext({ showToast: () => {} });

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, { type = 'success', duration = 3000 } = {}) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 no-print">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center gap-3 bg-surface border border-default rounded-lg px-4 py-3 shadow-lg animate-slide-up min-w-[260px]"
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-success-500 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-danger-500 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-accent-500 shrink-0" />}
            <span className="text-sm text-primary-c flex-1">{toast.message}</span>
            <button
              onClick={() => dismiss(toast.id)}
              className="text-muted-c hover:text-primary-c transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
