import { Navigate, Outlet } from "react-router-dom";
import { ShieldX } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-white" />
          </div>

          <p className="text-sm text-slate-400">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
            <ShieldX className="h-7 w-7 text-red-400" />
          </div>

          <h1 className="text-xl font-bold text-white">Access denied</h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            You don't have administrator permissions to access this page.
          </p>

          <button
            type="button"
            onClick={() => {
              window.location.replace("/todos");
            }}
            className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Back to Todos
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
}

export default AdminRoute;
