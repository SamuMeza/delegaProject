import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { LogOut, LayoutDashboard, ClipboardList, Users, CreditCard, BarChart3, ScrollText, Download } from "lucide-react";
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
    <div className="flex min-h-screen">
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>
      <aside className="w-64 shrink-0 border-r bg-card p-4" role="complementary">
        <p className="px-2 py-3 text-lg font-semibold">Delega</p>
        <nav className="mt-2 space-y-1" aria-label="Navegación principal">
          {SIDEBAR.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-card px-6 py-3">
          <span className="text-sm text-muted-foreground">
            Hola, {session?.displayName ?? "operador"}
          </span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </Button>
        </header>

        <main id="main-content" className="flex-1 overflow-auto bg-muted/20" role="main">
          <Outlet />
        </main>

        {lastNotification && (
          <NotificationToast
            title={lastNotification.title}
            body={lastNotification.body}
            onDismiss={clearTabIndicator}
          />
        )}
      </div>
    </div>
  );
}
