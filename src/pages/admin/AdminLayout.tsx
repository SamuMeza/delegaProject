import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LogOut,
  LayoutDashboard,
  ClipboardList,
  Users,
  CreditCard,
  BarChart3,
  ScrollText,
  Download,
  Plus,
  Bell,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationToast } from "@/components/NotificationToast";
import { Button } from "@/components/ui/button";

const SIDEBAR = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/ordenes", label: "Órdenes", icon: ClipboardList, end: false },
  { to: "/admin/clientes", label: "Clientes", icon: Users, end: false },
  { to: "/admin/suscripciones", label: "Suscripciones", icon: CreditCard, end: false },
  { to: "/admin/estadisticas", label: "Estadísticas", icon: BarChart3, end: false },
  { to: "/admin/activity-log", label: "Log de actividad", icon: ScrollText, end: false },
  { to: "/admin/exportar", label: "Exportar", icon: Download, end: false },
];

export function AdminLayout() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { lastNotification, clearTabIndicator, notify } = useNotifications();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function handleOrderCreated(e: Event) {
      const detail = (e as CustomEvent).detail;
      notify(
        "Nueva orden creada",
        `${detail.orderId} — ${detail.clientName}`,
      );
    }
    window.addEventListener("delega:order-created", handleOrderCreated);
    return () => window.removeEventListener("delega:order-created", handleOrderCreated);
  }, [notify]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    logout();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen bg-surface-studio">
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 border-r border-border-subtle bg-surface-container-lowest flex-col py-6 px-4 fixed h-screen z-40" role="complementary">
        <div className="mb-8 px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
              <span className="text-on-primary-container text-sm font-bold">D</span>
            </div>
            <div>
              <h1 className="font-display text-headline-sm font-bold text-primary">Admin Panel</h1>
              <p className="text-body-sm text-on-surface-variant text-sm">Management Console</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto" aria-label="Navegación principal">
          <ul className="space-y-1">
            {SIDEBAR.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-4 py-2 text-sm transition-all ${
                      isActive
                        ? "bg-secondary-container text-on-secondary-container scale-[0.98]"
                        : "text-on-surface-variant hover:bg-surface-container"
                    }`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="font-medium">{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto pt-4 border-t border-border-subtle">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-on-surface-variant hover:bg-surface-container rounded-lg px-4 py-2 h-auto"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Cerrar sesión</span>
          </Button>
        </div>
      </aside>

      {/* Mobile top app bar */}
      <header className="md:hidden fixed top-0 w-full h-16 bg-surface-studio flex justify-between items-center px-4 z-50 shadow-ambient">
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container transition-colors"
          aria-label="Abrir menú"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5 text-primary" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
            <span className="text-on-primary-container text-xs font-bold">D</span>
          </div>
          <h1 className="font-display text-headline-sm font-bold text-primary">Admin Panel</h1>
        </div>
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container relative"
          aria-label="Notificaciones"
          onClick={() => navigate("/admin/activity-log")}
        >
          <Bell className="h-5 w-5 text-primary" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-urgency-alert rounded-full" />
        </button>
      </header>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-surface-container-lowest shadow-ambient flex flex-col">
            <div className="flex items-center justify-between px-4 h-16 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
                  <span className="text-on-primary-container text-xs font-bold">D</span>
                </div>
                <h1 className="font-display text-headline-sm font-bold text-primary">Admin Panel</h1>
              </div>
              <button
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors"
                aria-label="Cerrar menú"
                onClick={() => setMobileOpen(false)}
              >
                <X className="w-5 h-5 text-primary" />
              </button>
            </div>

            <nav className="flex-1 py-4 overflow-y-auto" aria-label="Navegación móvil">
              <ul className="space-y-1">
                {SIDEBAR.map(({ to, label, icon: Icon, end }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      end={end}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                          isActive
                            ? "bg-secondary-container text-on-secondary-container"
                            : "text-on-surface-variant hover:bg-surface-container"
                        }`
                      }
                      onClick={() => setMobileOpen(false)}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="p-4 border-t border-border-subtle space-y-2">
              <Button
                className="w-full gap-2"
                onClick={() => {
                  setMobileOpen(false);
                  navigate("/admin/ordenes?new=true");
                }}
              >
                <Plus className="h-4 w-4" />
                Nueva orden
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-on-surface-variant hover:bg-surface-container rounded-lg px-4 py-2 h-auto"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Cerrar sesión</span>
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-64">
        <main
          id="main-content"
          className="flex-1 overflow-auto bg-surface-studio pt-16 md:pt-0"
          role="main"
        >
          <div className="max-w-[1280px] mx-auto px-4 py-6 md:px-16 md:py-12">
            <Outlet />
          </div>
        </main>
      </div>

      {lastNotification && (
        <NotificationToast
          title={lastNotification.title}
          body={lastNotification.body}
          onDismiss={clearTabIndicator}
        />
      )}
    </div>
  );
}
