import { useToastStore, Toast as ToastType } from '@/store/toast.store';

const toastStyles = {
  success: 'bg-green-500 text-white',
  error: 'bg-red-500 text-white',
  info: 'bg-blue-500 text-white',
  warning: 'bg-yellow-500 text-white',
};

const toastIcons = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

function ToastItem({ toast }: { toast: ToastType }) {
  const removeToast = useToastStore((state) => state.removeToast);

  return (
    <div
      className={`${toastStyles[toast.type]} rounded-lg shadow-lg p-4 mb-3 min-w-[300px] max-w-md animate-in slide-in-from-right duration-300`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <span className="text-xl font-bold flex-shrink-0">
          {toastIcons[toast.type]}
        </span>
        <div className="flex-1">
          <h4 className="font-semibold">{toast.title}</h4>
          {toast.message && (
            <p className="text-sm mt-1 opacity-90">{toast.message}</p>
          )}
        </div>
        <button
          onClick={() => removeToast(toast.id)}
          className="text-white/80 hover:text-white text-xl leading-none"
          aria-label="Fechar"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

