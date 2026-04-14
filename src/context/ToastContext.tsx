import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

/* ── Types ──────────────────────────────────────────────────── */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (type: ToastType, title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  dismiss: (id: string) => void;
}

/* ── Context ────────────────────────────────────────────────── */
const ToastContext = createContext<ToastContextValue | null>(null);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ICON_MAP: Record<ToastType, React.ComponentType<any>> = {
  success: CheckCircle2,
  error:   AlertCircle,
  info:    Info,
  warning: AlertTriangle,
};

const COLOR_MAP: Record<ToastType, string> = {
  success: 'bg-green-50  border-green-200  text-green-700',
  error:   'bg-red-50    border-red-200    text-red-700',
  info:    'bg-blue-50   border-blue-200   text-blue-700',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
};

const ICON_COLOR_MAP: Record<ToastType, string> = {
  success: 'text-green-500',
  error:   'text-red-500',
  info:    'text-blue-500',
  warning: 'text-yellow-500',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback(
    (type: ToastType, title: string, message?: string) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const newToast: Toast = { id, type, title, message };
      setToasts(prev => [...prev.slice(-4), newToast]); // keep max 5
      setTimeout(() => dismiss(id), 4500);
    },
    [dismiss]
  );

  const success = useCallback((t: string, m?: string) => toast('success', t, m), [toast]);
  const error   = useCallback((t: string, m?: string) => toast('error',   t, m), [toast]);
  const info    = useCallback((t: string, m?: string) => toast('info',    t, m), [toast]);
  const warning = useCallback((t: string, m?: string) => toast('warning', t, m), [toast]);

  return (
    <ToastContext.Provider value={{ toasts, toast, success, error, info, warning, dismiss }}>
      {children}

      {/* ── Toast container ──────────────────────────────── */}
      <div
        aria-live="polite"
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none"
      >
        {toasts.map(t => {
          const Icon = ICON_MAP[t.type];
          return (
            <div
              key={t.id}
              className={`
                pointer-events-auto flex items-start gap-3 min-w-[300px] max-w-[400px]
                rounded-2xl border px-4 py-3.5 shadow-lg animate-toast-in
                ${COLOR_MAP[t.type]}
              `}
            >
              <Icon size={18} className={`mt-0.5 flex-shrink-0 ${ICON_COLOR_MAP[t.type]}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold leading-snug">{t.title}</p>
                {t.message && (
                  <p className="mt-0.5 text-[12px] opacity-80 leading-snug">{t.message}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="flex-shrink-0 p-0.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

/* ── Hook ───────────────────────────────────────────────────── */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
