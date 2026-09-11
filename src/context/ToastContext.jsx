import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import Toast from '../components/ui/Toast';

export const ToastContext = createContext(null);

const AUTO_DISMISS_MS = 4000;

/** App-wide toast notifications: toast.success/error/info("message"). */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback((type, message) => {
    nextId.current += 1;
    const id = nextId.current;
    setToasts((current) => [...current, { id, type, message }]);
  }, []);

  const toast = useMemo(
    () => ({
      success: (message) => push('success', message),
      error: (message) => push('error', message),
      info: (message) => push('info', message),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="pointer-events-none fixed inset-x-4 top-4 z-[60] flex flex-col items-stretch gap-2 sm:items-end"
      >
        {toasts.map((item) => (
          <Toast
            key={item.id}
            type={item.type}
            message={item.message}
            durationMs={AUTO_DISMISS_MS}
            onDismiss={() => dismiss(item.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider.');
  }
  return context;
}
