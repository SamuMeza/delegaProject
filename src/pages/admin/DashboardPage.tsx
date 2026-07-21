import { useConfig } from "@/hooks/useDelegaDB";
import { useOrders } from "@/hooks/useDelegaDB";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_CLASSES,
  SERVICE_TYPE_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_CLASSES,
  isOverdue,
  formatDueDate,
} from "@/lib/orders/ui";

export function DashboardPage() {
  const config = useConfig();
  const orders = useOrders();

  // Calcular estadísticas mensuales
  const today = new Date();
  const currentMonth = today.toLocaleString("es-VE", { month: "short", year: "numeric" });
  const monthlyOrders = orders?.filter(
    (order) => new Date(order.createdAt).toLocaleString("es-VE", { month: "short", year: "numeric" }) === currentMonth
  ) ?? [];

  // Contar por estado (desglosado)
  const byStatus = Object.entries(ORDER_STATUS_LABELS).reduce((acc, [status, label]) => {
    acc[status] = monthlyOrders.filter((o) => o.status === status).length;
    return acc;
  }, {});

  // Contar por operador y estado
  const byOperator: Record<string, { total: number; completed: number; pending: number; updatings: number; cancels: number }> = {};
  monthlyOrders.forEach((order) => {
    const opName = order.operatorId.replace("op_", "");
    byOperator[opName] = byOperator[opName] || { total: 0, completed: 0, pending: 0, updatings: 0, cancels: 0 };
    byOperator[opName].total += 1;
    if (order.status === "completada") byOperator[opName].completed += 1;
    if (order.status === "pendiente_final" || order.status === "revision") byOperator[opName].pending += 1;
    if (order.status === "en_progreso") byOperator[opName].updatings += 1;
    if (order.status === "cancelada") byOperator[opName].cancels += 1;
  });

  // Pago Móvil tracking
  const paymentStatusCounts = Object.entries(PAYMENT_STATUS_LABELS as any).reduce((acc, [status, label]) => {
    acc[status] = monthlyOrders.filter((o) => o.paymentStatus === (status as keyof typeof PAYMENT_STATUS_LABELS)).length ?? 0;
    return acc;
  }, {});

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sesión expira tras {config?.sessionTimeoutHours ?? "—"} hora(s) de inactividad.
      </p>

      <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Estadísticas mensuales */}
        <div className="rounded-lg border p-4">
          <h2 className="text-sm font-medium">Mes actual: {currentMonth}</h2>
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            <div>Ordenes totales: {monthlyOrders.length}</div>
            <div>Pago Móvil - Sin pagar: {paymentStatusCounts.unpaid}</div>
            <div>Pago Móvil - Abono parcial: {paymentStatusCounts.partial}</div>
            <div>Pago Móvil - Pagada: {paymentStatusCounts.paid}</div>
          </div>
        </div>

        {/* Resumen por estado */}
        {Object.entries(byStatus).map(([status, count]) => (
          <div key={status} className="rounded-lg border p-2">
            <div className={`text-sm font-medium ${ORDER_STATUS_CLASSES[status as keyof typeof ORDER_STATUS_LABELS]}`}>
              {ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS]}
            </div>
            <div className="mt-1">{count}</div>
          </div>
        ))}

        {/* Desglosado por operador */}
        {Object.entries(byOperator).map(([opName, stats]) => (
          <div key={opName} className="rounded-lg border p-2">
            <div className="text-sm font-medium">Operador: {opName}</div>
            <div>Total: {stats.total}</div>
            <div>Completadas: {stats.completed}</div>
            <div>En progreso: {stats.updatings}</div>
            <div>Pendientes: {stats.pending}</div>
            <div>Canceladas: {stats.cancels}</div>
          </div>
        ))}
      </section>

      {/* Dashboard month='calendar month' */}
      <div className="mt-12">
        <h2 className="text-sm font-medium">Opciones avanzadas</h2>
        <div className="mt-2 flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Filtrar por mes:</label>
          <input type="text" placeholder="yyyy-mm" className="text-sm rounded-md border px-2 py-1 w-24" />
        </div>
      </div>
    </main>
  );
}
