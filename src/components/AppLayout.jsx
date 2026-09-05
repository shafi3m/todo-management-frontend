import { useState } from "react";
import {
  LayoutDashboard,
  ListTodo,
  LogOut,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AppLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const navigation = [
    {
      name: "My Todos",
      path: "/todos",
      icon: ListTodo,
    },
  ];

  if (user?.role === "ADMIN") {
    navigation.push({
      name: "Admin Dashboard",
      path: "/admin",
      icon: ShieldCheck,
    });
  }

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
      isActive
        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/10"
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-800 bg-slate-900 lg:flex lg:flex-col">
        <div className="flex h-20 items-center gap-3 border-b border-slate-800 px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>

          <div>
            <h1 className="font-bold text-white">Todo Manager</h1>

            <p className="text-xs text-slate-500">Task management</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-600">
            Menu
          </p>

          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink key={item.path} to={item.path} className={navLinkClass}>
                <Icon className="h-5 w-5 shrink-0" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="mb-3 rounded-xl bg-slate-950 px-3 py-3">
            <p className="truncate text-sm font-medium text-slate-200">
              {user?.name || "User"}
            </p>

            <p className="mt-1 truncate text-xs text-slate-500">
              {user?.email || ""}
            </p>

            {user?.role === "ADMIN" && (
              <div className="mt-2 inline-flex items-center rounded-full bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-400">
                Administrator
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur lg:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
                <ListTodo className="h-5 w-5 text-white" />
              </div>

              <span className="font-bold text-white">Todo Manager</span>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((previous) => !previous)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="border-t border-slate-800 bg-slate-900 px-4 py-4">
              <nav className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={closeMobileMenu}
                      className={navLinkClass}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {item.name}
                    </NavLink>
                  );
                })}

                <div className="my-2 border-t border-slate-800" />

                <div className="rounded-xl bg-slate-950 px-3 py-3">
                  <p className="truncate text-sm font-medium text-slate-200">
                    {user?.name || "User"}
                  </p>

                  <p className="mt-1 truncate text-xs text-slate-500">
                    {user?.email || ""}
                  </p>

                  {user?.role === "ADMIN" && (
                    <div className="mt-2 inline-flex items-center rounded-full bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-400">
                      Administrator
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </nav>
            </div>
          )}
        </header>

        <div className="min-h-screen">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
