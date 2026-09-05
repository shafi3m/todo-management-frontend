import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CheckCircle2, CircleAlert, Info, X, XCircle } from "lucide-react";

const ToastContext = createContext(null);

let toastId = 0;

const TOAST_DURATION = 3500;

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, TOAST_DURATION);

    return () => {
      clearTimeout(timer);
    };
  }, [toast.id, onRemove]);

  const toastStyles = {
    success: {
      container: "border-emerald-500/20 bg-emerald-500/10",
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
      text: "text-emerald-100",
    },
    error: {
      container: "border-red-500/20 bg-red-500/10",
      icon: <XCircle className="h-5 w-5 text-red-400" />,
      text: "text-red-100",
    },
    warning: {
      container: "border-amber-500/20 bg-amber-500/10",
      icon: <CircleAlert className="h-5 w-5 text-amber-400" />,
      text: "text-amber-100",
    },
    info: {
      container: "border-blue-500/20 bg-blue-500/10",
      icon: <Info className="h-5 w-5 text-blue-400" />,
      text: "text-blue-100",
    },
  };

  const style = toastStyles[toast.type] || toastStyles.info;

  return (
    <div
      role="alert"
      className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-sm ${style.container}`}
    >
      <div className="mt-0.5 shrink-0">{style.icon}</div>

      <p className={`flex-1 text-sm font-medium ${style.text}`}>
        {toast.message}
      </p>

      <button
        type="button"
        onClick={() => onRemove(toast.id)}
        aria-label="Dismiss notification"
        className="shrink-0 rounded-md p-1 text-slate-500 transition hover:bg-slate-800/60 hover:text-slate-200"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = "info") => {
    const id = ++toastId;

    setToasts((previous) => [
      ...previous,
      {
        id,
        message,
        type,
      },
    ]);

    return id;
  }, []);

  const success = useCallback(
    (message) => {
      return showToast(message, "success");
    },
    [showToast],
  );

  const error = useCallback(
    (message) => {
      return showToast(message, "error");
    },
    [showToast],
  );

  const warning = useCallback(
    (message) => {
      return showToast(message, "warning");
    },
    [showToast],
  );

  const info = useCallback(
    (message) => {
      return showToast(message, "info");
    },
    [showToast],
  );

  const value = useMemo(
    () => ({
      showToast,
      success,
      error,
      warning,
      info,
      removeToast,
    }),
    [showToast, success, error, warning, info, removeToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-3 px-4 sm:right-4 sm:left-auto sm:items-end">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}
