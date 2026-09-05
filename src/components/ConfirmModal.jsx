import { AlertTriangle, X } from "lucide-react";

function ConfirmModal({
  isOpen,
  title = "Confirm action",
  message = "Are you sure you want to continue?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
  danger = true,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-description"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onCancel();
        }
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="flex items-start justify-between px-5 pt-5">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                danger ? "bg-red-500/10" : "bg-blue-500/10"
              }`}
            >
              <AlertTriangle
                className={`h-5 w-5 ${
                  danger ? "text-red-400" : "text-blue-400"
                }`}
              />
            </div>

            <div className="pr-2">
              <h2
                id="confirm-modal-title"
                className="text-base font-semibold text-white"
              >
                {title}
              </h2>

              <p
                id="confirm-modal-description"
                className="mt-2 text-sm leading-6 text-slate-400"
              >
                {message}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            aria-label="Close confirmation dialog"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-800 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex justify-end gap-3 px-5 py-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
              danger
                ? "bg-red-600 hover:bg-red-500"
                : "bg-blue-600 hover:bg-blue-500"
            }`}
          >
            {loading ? "Please wait..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
