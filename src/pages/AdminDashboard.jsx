import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  ListTodo,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  deleteAdminTodo,
  deleteAdminUser,
  getAdminDashboard,
  getAllTodos,
  getAllUsers,
} from "../services/adminService";
import ConfirmModal from "../components/ConfirmModal";

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { success, error: showError } = useToast();

  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [todos, setTodos] = useState([]);

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [forbidden, setForbidden] = useState(false);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const [todoToDelete, setTodoToDelete] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  const [deleteType, setDeleteType] = useState(null);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError("");
      setForbidden(false);

      const [dashboardResponse, usersResponse, todosResponse] =
        await Promise.all([getAdminDashboard(), getAllUsers(), getAllTodos()]);

      setDashboard(dashboardResponse?.data || null);
      setUsers(usersResponse?.data || []);
      setTodos(todosResponse?.data || []);
    } catch (error) {
      if (error.response?.status === 403) {
        setForbidden(true);
        return;
      }

      setError(
        error.response?.data?.message || "Unable to load admin dashboard.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const openUserDeleteConfirmation = (selectedUser) => {
    if (selectedUser.id === user?.id) {
      showError("You cannot delete your own admin account.");
      return;
    }

    setUserToDelete(selectedUser);
    setTodoToDelete(null);
    setDeleteType("user");
    setConfirmDeleteOpen(true);
  };

  const openTodoDeleteConfirmation = (todo) => {
    setTodoToDelete(todo);
    setUserToDelete(null);
    setDeleteType("todo");
    setConfirmDeleteOpen(true);
  };

  const closeDeleteConfirmation = () => {
    if (deleting) {
      return;
    }

    setConfirmDeleteOpen(false);
    setTodoToDelete(null);
    setUserToDelete(null);
    setDeleteType(null);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      const deletedUser = userToDelete;

      await deleteAdminUser(deletedUser.id);

      setUsers((previous) =>
        previous.filter((item) => item.id !== deletedUser.id),
      );

      setDashboard((previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          totalUsers: Math.max(previous.totalUsers - 1, 0),
        };
      });

      setConfirmDeleteOpen(false);
      setUserToDelete(null);
      setDeleteType(null);

      success("User deleted successfully");
    } catch (error) {
      showError(
        error.response?.data?.message ||
          "Unable to delete the user. Please try again.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteTodo = async () => {
    if (!todoToDelete) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      const deletedTodo = todoToDelete;

      await deleteAdminTodo(deletedTodo.id);

      setTodos((previous) =>
        previous.filter((todo) => todo.id !== deletedTodo.id),
      );

      setDashboard((previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          totalTodos: Math.max(previous.totalTodos - 1, 0),
          completedTodos: deletedTodo.completed
            ? Math.max(previous.completedTodos - 1, 0)
            : previous.completedTodos,
          pendingTodos: deletedTodo.completed
            ? previous.pendingTodos
            : Math.max(previous.pendingTodos - 1, 0),
        };
      });

      setConfirmDeleteOpen(false);
      setTodoToDelete(null);
      setDeleteType(null);

      success("Todo deleted successfully");
    } catch (error) {
      showError(error.response?.data?.message || "Unable to delete the todo.");
    } finally {
      setDeleting(false);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteType === "user") {
      handleDeleteUser();
      return;
    }

    if (deleteType === "todo") {
      handleDeleteTodo();
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />
          Loading admin dashboard...
        </div>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
            <XCircle className="h-7 w-7 text-red-400" />
          </div>

          <h1 className="text-xl font-bold text-white">Access denied</h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            You don't have administrator permissions to access this dashboard.
          </p>

          <button
            type="button"
            onClick={() => navigate("/todos")}
            className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Back to Todos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8">
          <p className="mb-2 text-sm font-medium text-blue-400">
            Administration
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            System Overview
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Monitor users, todos, and overall application activity.
          </p>
        </section>

        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Users</p>

                <p className="mt-2 text-3xl font-bold text-white">
                  {dashboard?.totalUsers ?? 0}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Todos</p>

                <p className="mt-2 text-3xl font-bold text-white">
                  {dashboard?.totalTodos ?? 0}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10">
                <ClipboardList className="h-5 w-5 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Completed</p>

                <p className="mt-2 text-3xl font-bold text-white">
                  {dashboard?.completedTodos ?? 0}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Pending</p>

                <p className="mt-2 text-3xl font-bold text-white">
                  {dashboard?.pendingTodos ?? 0}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10">
                <ListTodo className="h-5 w-5 text-amber-400" />
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 px-5 py-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-400" />

              <div>
                <h3 className="font-semibold text-white">Registered Users</h3>

                <p className="text-xs text-slate-500">{users.length} users</p>
              </div>
            </div>
          </div>

          {users.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-500">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead className="border-b border-slate-800 bg-slate-950/40">
                  <tr>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      ID
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Name
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Email
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                  {users.map((item) => {
                    const isCurrentUser = item.id === user?.id;

                    return (
                      <tr
                        key={item.id}
                        className="transition hover:bg-slate-800/30"
                      >
                        <td className="px-5 py-4 text-sm text-slate-500">
                          #{item.id}
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-slate-200">
                          <div className="flex items-center gap-2">
                            {item.name}

                            {isCurrentUser && (
                              <span className="rounded-full bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-400">
                                You
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-400">
                          {item.email}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => openUserDeleteConfirmation(item)}
                            disabled={isCurrentUser}
                            aria-label={
                              isCurrentUser
                                ? "Cannot delete your own account"
                                : `Delete ${item.name}`
                            }
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 px-5 py-4">
            <div className="flex items-center gap-3">
              <ListTodo className="h-5 w-5 text-purple-400" />

              <div>
                <h3 className="font-semibold text-white">All Todos</h3>

                <p className="text-xs text-slate-500">
                  Manage todos across the system
                </p>
              </div>
            </div>
          </div>

          {todos.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-500">
              No todos found.
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-800/30"
                >
                  <div className="shrink-0">
                    {todo.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <ListTodo className="h-5 w-5 text-amber-400" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`break-words text-sm font-medium ${
                        todo.completed
                          ? "text-slate-500 line-through"
                          : "text-slate-200"
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
                    onClick={() => openTodoDeleteConfirmation(todo)}
                    aria-label={`Delete ${todo.task}`}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <ConfirmModal
        isOpen={confirmDeleteOpen}
        title={deleteType === "user" ? "Delete user?" : "Delete todo?"}
        message={
          deleteType === "user"
            ? userToDelete
              ? `Are you sure you want to permanently delete "${userToDelete.name}"? All todos belonging to this user will also be deleted. This action cannot be undone.`
              : "Are you sure you want to delete this user?"
            : todoToDelete
              ? `Are you sure you want to permanently delete "${todoToDelete.task}"? This action cannot be undone.`
              : "Are you sure you want to delete this todo?"
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteConfirmation}
        loading={deleting}
        danger
      />
    </div>
  );
}

export default AdminDashboard;
