import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { HomePage } from "@/pages/HomePage";
import { ServicesPage } from "@/pages/ServicesPage";
import { DelegatePage } from "@/pages/DelegatePage";
import { ContactPage } from "@/pages/ContactPage";
import { OrderTrackingPage } from "@/pages/OrderTrackingPage";
import { TerminosPage } from "@/pages/legal/TerminosPage";
import { PrivacidadPage } from "@/pages/legal/PrivacidadPage";
import { IntegridadPage } from "@/pages/legal/IntegridadPage";
import { LoginPage } from "@/pages/admin/LoginPage";

const AdminLayout = lazy(() =>
  import("@/pages/admin/AdminLayout").then((m) => ({ default: m.AdminLayout })),
);
const DashboardPage = lazy(() =>
  import("@/pages/admin/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);
const OrdersListPage = lazy(() =>
  import("@/pages/admin/OrdersListPage").then((m) => ({ default: m.OrdersListPage })),
);
const OrderDetailPage = lazy(() =>
  import("@/pages/admin/OrderDetailPage").then((m) => ({ default: m.OrderDetailPage })),
);
const OrderCreatePage = lazy(() =>
  import("@/pages/admin/OrderCreatePage").then((m) => ({ default: m.OrderCreatePage })),
);
const ClientsListPage = lazy(() =>
  import("@/pages/admin/ClientsListPage").then((m) => ({ default: m.ClientsListPage })),
);
const ClientDetailPage = lazy(() =>
  import("@/pages/admin/ClientDetailPage").then((m) => ({ default: m.ClientDetailPage })),
);
const SubscriptionsPage = lazy(() =>
  import("@/pages/admin/SubscriptionsPage").then((m) => ({ default: m.SubscriptionsPage })),
);
const ActivityLogPage = lazy(() =>
  import("@/pages/admin/ActivityLogPage").then((m) => ({ default: m.ActivityLogPage })),
);
const StatisticsPage = lazy(() =>
  import("@/pages/admin/StatisticsPage").then((m) => ({ default: m.StatisticsPage })),
);
const ExportPage = lazy(() =>
  import("@/pages/admin/ExportPage").then((m) => ({ default: m.ExportPage })),
);

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

// Protege el acceso a /admin/*: si la sesión expiró en caliente, redirige a login.
function AdminGuardExpiry({ children }: { children: React.ReactNode }) {
  const { session, isExpired, logout } = useAuth();
  if (!session || isExpired()) {
    logout();
    return <Navigate to="/admin/login" replace />;
  }
  return <AdminGuard>{children}</AdminGuard>;
}

function AdminRoutes() {
  return (
    <Suspense fallback={<div className="p-8">Cargando…</div>}>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="ordenes" element={<OrdersListPage />} />
          <Route path="ordenes/nueva" element={<OrderCreatePage />} />
          <Route path="ordenes/:id" element={<OrderDetailPage />} />
          <Route path="clientes" element={<ClientsListPage />} />
          <Route path="clientes/:phone" element={<ClientDetailPage />} />
          <Route path="suscripciones" element={<SubscriptionsPage />} />
          <Route path="activity-log" element={<ActivityLogPage />} />
          <Route path="estadisticas" element={<StatisticsPage />} />
          <Route path="exportar" element={<ExportPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="p-8">Cargando…</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/servicios" element={<ServicesPage />} />
          <Route path="/delegar" element={<DelegatePage />} />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/legal/terminos" element={<TerminosPage />} />
          <Route path="/legal/privacidad" element={<PrivacidadPage />} />
          <Route path="/legal/integridad" element={<IntegridadPage />} />
          <Route path="/orden/:token" element={<OrderTrackingPage />} />
          <Route path="/admin/login" element={<LoginPage />} />
          <Route
            path="/admin/*"
            element={
              <AdminGuardExpiry>
                <AdminRoutes />
              </AdminGuardExpiry>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
