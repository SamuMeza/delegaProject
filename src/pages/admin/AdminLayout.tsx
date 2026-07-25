import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
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
  Home,
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

const BOTTOM_TABS = [
  { to: "/admin", label: "Inicio", icon: Home, end: true },
  { to: "/admin/ordenes", label: "Órdenes", icon: ClipboardList, end: false },
  { to: "/admin/estadisticas", label: "Stats", icon: BarChart3, end: false },
  { to: "/admin/activity-log", label: "Log", icon: ScrollText, end: false },
];

export function AdminLayout() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { lastNotification, clearTabIndicator, notify } = useNotifications();

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

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-64">
        <main
          id="main-content"
          className="flex-1 overflow-auto bg-surface-studio pt-16 md:pt-0 pb-20 md:pb-0"
          role="main"
        >
          <div className="max-w-[1280px] mx-auto px-4 py-6 md:px-16 md:py-12">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 w-full bg-surface-container-lowest border-t border-border-subtle flex justify-around items-center h-[72px] z-50" aria-label="Navegación móvil">
        {BOTTOM_TABS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors ${
                isActive
                  ? "text-secondary"
                  : "text-on-surface-variant hover:text-secondary"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`w-12 h-8 rounded-full flex items-center justify-center ${isActive ? "bg-secondary-container" : ""}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-bold tracking-wider uppercase">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Mobile FAB */}
      <button
        className="md:hidden fixed bottom-24 right-4 w-14 h-14 bg-secondary text-white rounded-full shadow-ambient-hover flex items-center justify-center z-50"
        aria-label="Crear nueva orden"
        onClick={() => navigate("/admin/ordenes?new=true")}
      >
        <Plus className="h-6 w-6" />
      </button>

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
