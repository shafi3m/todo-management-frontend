import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  ClipboardList,
  Edit3,
  Plus,
  Search,
  Trash2,
  Clock3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  createTodo,
  deleteTodo,
  getTodos,
  updateTodo,
} from "../services/todoService";
import TodoModal from "../components/TodoModal";
import ConfirmModal from "../components/ConfirmModal";

function TodoDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { success, error: showError } = useToast();

  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const [keyword, setKeyword] = useState("");
  const [completed, setCompleted] = useState("");
  const [page, setPage] = useState(0);

  const [pagination, setPagination] = useState({
    totalPages: 0,
    totalElements: 0,
    currentPage: 0,
    pageSize: 10,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState(null);

  const loadTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        size: 10,
        sortBy: "id",
        direction: "desc",
      };

      if (keyword.trim()) {
        params.keyword = keyword.trim();
      }

      if (completed !== "") {
        params.completed = completed;
      }

      const response = await getTodos(params);
      const data = response?.data;

      setTodos(data?.content || []);

      setPagination({
        totalPages: data?.totalPages || 0,
        totalElements: data?.totalElements || 0,
        currentPage: data?.number || 0,
        pageSize: data?.size || 10,
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load your todos. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [completed, keyword, page]);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const completedTodos = useMemo(
    () => todos.filter((todo) => todo.completed).length,
    [todos],
  );

  const pendingTodos = useMemo(
    () => todos.filter((todo) => !todo.completed).length,
    [todos],
  );

  const openCreateModal = () => {
    setSelectedTodo(null);
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (todo) => {
    setSelectedTodo(todo);
    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setSelectedTodo(null);
  };

  const handleSaveTodo = async (todoData) => {
    try {
      setSaving(true);
      setError("");

      if (selectedTodo) {
        const response = await updateTodo(selectedTodo.id, todoData);

        const updatedTodo = response?.data;

        if (updatedTodo) {
          setTodos((previous) =>
            previous.map((todo) =>
              todo.id === selectedTodo.id ? updatedTodo : todo,
            ),
          );
        }

        setModalOpen(false);
        setSelectedTodo(null);

        success("Todo updated successfully");
      } else {
        const response = await createTodo(todoData);
        const createdTodo = response?.data;

        if (createdTodo) {
          setTodos((previous) => [createdTodo, ...previous]);

          setPagination((previous) => ({
            ...previous,
            totalElements: previous.totalElements + 1,
          }));
        }

        setModalOpen(false);
        setSelectedTodo(null);

        success("Todo created successfully");
      }
    } catch (error) {
      showError(
        error.response?.data?.message ||
          "Unable to save the todo. Please try again.",
      );

      throw error;
    } finally {
      setSaving(false);
    }
  };

  const openDeleteConfirmation = (todo) => {
    setTodoToDelete(todo);
    setConfirmDeleteOpen(true);
  };

  const closeDeleteConfirmation = () => {
    if (deleting) {
      return;
    }

    setConfirmDeleteOpen(false);
    setTodoToDelete(null);
  };

  const handleDelete = async () => {
    if (!todoToDelete) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteTodo(todoToDelete.id);

      setTodos((previous) =>
        previous.filter((todo) => todo.id !== todoToDelete.id),
      );

      setPagination((previous) => ({
        ...previous,
        totalElements: Math.max(previous.totalElements - 1, 0),
      }));

      setConfirmDeleteOpen(false);
      setTodoToDelete(null);

      success("Todo deleted successfully");
    } catch (error) {
      showError(
        error.response?.data?.message ||
          "Unable to delete the todo. Please try again.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleCompleted = async (todo) => {
    try {
      setError("");

      const response = await updateTodo(todo.id, {
        task: todo.task,
        completed: !todo.completed,
      });

      const updatedTodo = response?.data;

      if (updatedTodo) {
        setTodos((previous) =>
          previous.map((item) => (item.id === todo.id ? updatedTodo : item)),
        );
      }

      success(
        todo.completed ? "Todo marked as pending" : "Todo marked as completed",
      );
    } catch (error) {
      showError(
        error.response?.data?.message ||
          "Unable to update the todo. Please try again.",
      );
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setPage(0);
  };

  const handleFilterChange = (event) => {
    setCompleted(event.target.value);
    setPage(0);
  };

  const handlePreviousPage = () => {
    if (page > 0) {
      setPage((previous) => previous - 1);
    }
  };

  const handleNextPage = () => {
    if (page < pagination.totalPages - 1) {
      setPage((previous) => previous + 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8">
          <p className="mb-2 text-sm font-medium text-blue-400">
            Your workspace
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Your Todos
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Manage your tasks and keep track of your progress.
          </p>
        </section>

        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total tasks</p>

                <p className="mt-2 text-3xl font-bold text-white">
                  {pagination.totalElements}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
                <ClipboardList className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Pending on page</p>

                <p className="mt-2 text-3xl font-bold text-white">
                  {pendingTodos}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10">
                <Clock3 className="h-5 w-5 text-amber-400" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Completed on page</p>

                <p className="mt-2 text-3xl font-bold text-white">
                  {completedTodos}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <form onSubmit={handleSearchSubmit} className="flex flex-1 gap-2">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                  <input
                    type="search"
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    placeholder="Search your todos..."
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  Search
                </button>
              </form>

              <div className="flex flex-col gap-2 sm:flex-row">
                <select
                  value={completed}
                  onChange={handleFilterChange}
                  className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-blue-500"
                >
                  <option value="">All tasks</option>
                  <option value="false">Pending</option>
                  <option value="true">Completed</option>
                </select>

                <button
                  type="button"
                  onClick={openCreateModal}
                  className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  <Plus className="h-4 w-4" />
                  Add Todo
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="m-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex min-h-72 items-center justify-center p-8">
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />
                Loading your todos...
              </div>
            </div>
          ) : todos.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800">
                <ClipboardList className="h-7 w-7 text-slate-500" />
              </div>

              <h3 className="text-lg font-semibold text-white">
                No todos found
              </h3>

              <p className="mt-2 max-w-md text-sm text-slate-500">
                You don't have any tasks matching your current search or filter.
              </p>

              <button
                type="button"
                onClick={openCreateModal}
                className="mt-5 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                <Plus className="h-4 w-4" />
                Create your first todo
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-3 px-4 py-4 transition hover:bg-slate-800/40 sm:gap-4 sm:px-5"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleCompleted(todo)}
                    aria-label={
                      todo.completed
                        ? `Mark ${todo.task} as pending`
                        : `Mark ${todo.task} as completed`
                    }
                    className="shrink-0 rounded-full"
                  >
                    {todo.completed ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-400 transition hover:text-emerald-300" />
                    ) : (
                      <Circle className="h-6 w-6 text-slate-500 transition hover:text-blue-400" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`break-words text-sm font-medium ${
                        todo.completed
                          ? "text-slate-500 line-through"
                          : "text-slate-100"
                      }`}
                    >
                      {todo.task}
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      Todo #{todo.id}
                    </p>
                  </div>

                  <span
                    className={`hidden rounded-full px-3 py-1 text-xs font-medium sm:inline-flex ${
                      todo.completed
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {todo.completed ? "Completed" : "Pending"}
                  </span>

                  <button
                    type="button"
                    onClick={() => openEditModal(todo)}
                    aria-label={`Edit ${todo.task}`}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-blue-500/10 hover:text-blue-400"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => openDeleteConfirmation(todo)}
                    aria-label={`Delete ${todo.task}`}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {!loading && pagination.totalPages > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-800 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-sm text-slate-500">
                Page {pagination.currentPage + 1} of {pagination.totalPages}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePreviousPage}
                  disabled={page === 0}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={page >= pagination.totalPages - 1}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      <TodoModal
        isOpen={modalOpen}
        todo={selectedTodo}
        onClose={closeModal}
        onSave={handleSaveTodo}
        loading={saving}
      />

      <ConfirmModal
        isOpen={confirmDeleteOpen}
        title="Delete todo?"
        message={
          todoToDelete
            ? `Are you sure you want to delete "${todoToDelete.task}"? This action cannot be undone.`
            : "Are you sure you want to delete this todo?"
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={closeDeleteConfirmation}
        loading={deleting}
        danger
      />
    </div>
  );
}

export default TodoDashboard;
