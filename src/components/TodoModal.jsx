import { useEffect, useState } from "react";
import { X, ListTodo } from "lucide-react";

function TodoModal({ isOpen, todo, onClose, onSave, loading }) {
  const [task, setTask] = useState("");
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");

  const isEditing = Boolean(todo);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setTask(todo?.task || "");
    setCompleted(todo?.completed || false);
    setError("");
  }, [isOpen, todo]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const trimmedTask = task.trim();

    if (!trimmedTask) {
      setError("Task cannot be empty.");
      return;
    }

    if (trimmedTask.length < 3) {
      setError("Task must be at least 3 characters.");
      return;
    }

    if (trimmedTask.length > 100) {
      setError("Task cannot exceed 100 characters.");
      return;
    }

    try {
      await onSave({
        task: trimmedTask,
        completed,
      });
    } catch (error) {
      const responseData = error.response?.data;

      if (responseData?.data) {
        const validationErrors = Object.values(responseData.data);

        if (validationErrors.length > 0) {
          setError(validationErrors.join(" "));
          return;
        }
      }

      setError(
        responseData?.message || "Unable to save the todo. Please try again.",
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="todo-modal-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
              <ListTodo className="h-5 w-5 text-blue-400" />
            </div>

            <div>
              <h2 id="todo-modal-title" className="font-semibold text-white">
                {isEditing ? "Edit todo" : "Create a todo"}
              </h2>

              <p className="text-xs text-slate-500">
                {isEditing
                  ? "Update your task details"
                  : "Add a new task to your list"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close modal"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-800 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-5 py-6">
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
              >
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="todo-task"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Task
              </label>

              <textarea
                id="todo-task"
                value={task}
                onChange={(event) => setTask(event.target.value)}
                placeholder="What needs to be done?"
                rows={4}
                maxLength={100}
                disabled={loading}
                autoFocus
                className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <div className="mt-1 flex justify-end">
                <span className="text-xs text-slate-600">
                  {task.length}/100
                </span>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-800 bg-slate-950 px-4 py-3">
              <input
                type="checkbox"
                checked={completed}
                onChange={(event) => setCompleted(event.target.checked)}
                disabled={loading}
                className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500"
              />

              <span className="text-sm text-slate-300">
                Mark this task as completed
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-800 px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : isEditing
                  ? "Save changes"
                  : "Create todo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TodoModal;
