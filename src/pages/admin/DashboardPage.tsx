import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { AlertTriangle, AlertTriangle as AlertIcon, ScrollText, BarChart3, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useConfig } from "@/hooks/useDelegaDB";
import { useOrders } from "@/hooks/useDelegaDB";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_CLASSES,
  SERVICE_TYPE_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_CLASSES,
  isOverdue,
  isDueToday,
  isDueTomorrow,
  formatDueDate,
} from "@/lib/orders/ui";
import { db } from "@/lib/db/delegaDb";

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function DashboardPage() {
  const config = useConfig();
  const orders = useOrders();

  const today = new Date();
  const currentMonth = today.toLocaleString("es-VE", { month: "short", year: "numeric" });
  const monthlyOrders = orders?.filter(
    (order) => new Date(order.createdAt).toLocaleString("es-VE", { month: "short", year: "numeric" }) === currentMonth
  ) ?? [];

  const byStatus = Object.entries(ORDER_STATUS_LABELS).reduce((acc, [status, label]) => {
    acc[status] = monthlyOrders.filter((o) => o.status === status).length;
    return acc;
  }, {});

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

  const paymentStatusCounts = Object.entries(PAYMENT_STATUS_LABELS as any).reduce((acc, [status, label]) => {
    acc[status] = monthlyOrders.filter((o) => o.paymentStatus === (status as keyof typeof PAYMENT_STATUS_LABELS)).length ?? 0;
    return acc;
  }, {});

  const renewals = useLiveQuery(
    () =>
      db.transaction("r", db.subscriptions, db.clients, async () => {
        const subs = await db.subscriptions
          .where("status")
          .equals("activa")
          .toArray();
        const nearEnd = subs
          .filter((s) => {
            const d = daysUntil(s.endDate);
            return d >= 0 && d <= 15;
          })
          .sort((a, b) => daysUntil(a.endDate) - daysUntil(b.endDate));
        const phones = [...new Set(nearEnd.map((s) => s.clientPhone))];
        const clients = await db.clients.bulkGet(phones);
        const nameMap = new Map<string, string>();
        for (const c of clients) {
          if (c) nameMap.set(c.phone, c.name);
        }
        return nearEnd.map((s) => ({
          ...s,
          clientName: nameMap.get(s.clientPhone) ?? s.clientPhone,
        }));
      }),
    [],
    [],
  );

  return (
    <main className="p-4 md:p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="flex flex-wrap gap-3">
        <Link to="/admin/activity-log">
          <Button variant="outline" size="sm">
            <ScrollText className="mr-2 h-4 w-4" />
            Log de actividad
          </Button>
        </Link>
        <Link to="/admin/estadisticas">
          <Button variant="outline" size="sm">
            <BarChart3 className="mr-2 h-4 w-4" />
            Estadísticas
          </Button>
        </Link>
        <Link to="/admin/exportar">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar datos
          </Button>
        </Link>
      </div>

{renewals.length > 0 && (
         <Card>
           <CardHeader>
             <CardTitle className="flex items-center gap-2 text-amber-600">
               <AlertTriangle className="h-5 w-5" />
               Suscripciones próximas a vencer
             </CardTitle>
           </CardHeader>
           <CardContent>
             <ul className="space-y-2">
               {renewals.map((sub) => {
                 const d = daysUntil(sub.endDate);
                 return (
                   <li key={sub.id} className="flex items-center justify-between text-sm">
                     <Link to={`/admin/clientes/${sub.clientPhone}`} className="text-primary hover:underline">
                       {sub.clientName}
                     </Link>
                     <span className="text-muted-foreground">
                       Vence en {d} día{d !== 1 ? "s" : ""} ({sub.endDate})
                     </span>
                   </li>
                 );
               })}
             </ul>
           </CardContent>
         </Card>
       )}

       {/* Alertas de urgencia */}
       {orders && (
         <>
           {(() => {
             const todayOrders = orders.filter(isDueToday);
             const tomorrowOrders = orders.filter(isDueTomorrow);
             if (todayOrders.length === 0 && tomorrowOrders.length === 0) return null;
             
             return (
               <Card>
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2 text-orange-600">
                     <AlertTriangle className="h-5 w-5" />
                     Órdenes próximas a vencer
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   {todayOrders.length > 0 && (
                     <div className="mb-4 p-3 bg-orange-50 rounded">
                       <div className="font-medium text-orange-800 flex items-center gap-2">
                         <AlertTriangle className="h-4 w-4" />
                         Vencen hoy ({todayOrders.length})
                       </div>
                       <ul className="mt-2 text-sm space-y-1">
                         {todayOrders.slice(0, 5).map((order) => (
                           <li key={order.id} className="flex justify-between">
                             <Link to={`/admin/ordenes/${order.id}`} className="hover:underline">
                               #{order.id} - {order.clientName}
                             </Link>
                             <span className="text-orange-600">{formatDueDate(order.dueDate)}</span>
                           </li>
                         ))}
                         {todayOrders.length > 5 && (
                           <li className="text-center text-xs text-muted-foreground">
                             y {todayOrders.length - 5} más...
                           </li>
                         )}
                       </ul>
                     </div>
                   )}
                   
                   {tomorrowOrders.length > 0 && (
                     <div className="p-3 bg-yellow-50 rounded">
                       <div className="font-medium text-yellow-800 flex items-center gap-2">
                         <AlertTriangle className="h-4 w-4" />
                         Vencen mañana ({tomorrowOrders.length})
                       </div>
                       <ul className="mt-2 text-sm space-y-1">
                         {tomorrowOrders.slice(0, 5).map((order) => (
                           <li key={order.id} className="flex justify-between">
                             <Link to={`/admin/ordenes/${order.id}`} className="hover:underline">
                               #{order.id} - {order.clientName}
                             </Link>
                             <span className="text-yellow-600">{formatDueDate(order.dueDate)}</span>
                           </li>
                         ))}
                         {tomorrowOrders.length > 5 && (
                           <li className="text-center text-xs text-muted-foreground">
                             y {tomorrowOrders.length - 5} más...
                           </li>
                         )}
                       </ul>
                     </div>
                   )}
                 </CardContent>
               </Card>
             );
           })()}
         </>
       )}

       <p className="text-sm text-muted-foreground">
         Sesión expira tras {config?.sessionTimeoutHours ?? "—"} hora(s) de inactividad.
       </p>

      <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-4">
          <h2 className="text-sm font-medium">Mes actual: {currentMonth}</h2>
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            <div>Ordenes totales: {monthlyOrders.length}</div>
            <div>Pago Móvil - Sin pagar: {paymentStatusCounts.unpaid}</div>
            <div>Pago Móvil - Abono parcial: {paymentStatusCounts.partial}</div>
            <div>Pago Móvil - Pagada: {paymentStatusCounts.paid}</div>
          </div>
        </div>

        {Object.entries(byStatus).map(([status, count]) => (
          <div key={status} className="rounded-lg border p-2">
            <div className={`text-sm font-medium ${ORDER_STATUS_CLASSES[status as keyof typeof ORDER_STATUS_LABELS]}`}>
              {ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS]}
            </div>
            <div className="mt-1">{count}</div>
          </div>
        ))}

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