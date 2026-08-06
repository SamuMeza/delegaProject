import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { AlertTriangle, ScrollText, BarChart3, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useConfig } from "@/hooks/useDatabase";
import { useOrders } from "@/hooks/useDatabase";

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

  const monthlyOrders = useMemo(() => {
    return orders?.filter(
      (order) => new Date(order.createdAt).toLocaleString("es-VE", { month: "short", year: "numeric" }) === currentMonth
    ) ?? [];
  }, [orders, currentMonth]);

  const byStatus = useMemo(() => {
    return Object.entries(ORDER_STATUS_LABELS).reduce((acc, [status, label]) => {
      acc[status] = monthlyOrders.filter((o) => o.status === status).length;
      return acc;
    }, {} as Record<string, number>);
  }, [monthlyOrders]);

  const byOperator = useMemo(() => {
    const result: Record<string, { total: number; completed: number; pending: number; updatings: number; cancels: number }> = {};
    monthlyOrders.forEach((order) => {
      const opName = order.operatorId.replace("op_", "");
      result[opName] = result[opName] || { total: 0, completed: 0, pending: 0, updatings: 0, cancels: 0 };
      result[opName].total += 1;
      if (order.status === "completada") result[opName].completed += 1;
      if (order.status === "pendiente_final" || order.status === "revision") result[opName].pending += 1;
      if (order.status === "en_progreso") result[opName].updatings += 1;
      if (order.status === "cancelada") result[opName].cancels += 1;
    });
    return result;
  }, [monthlyOrders]);

  const paymentStatusCounts = useMemo(() => {
    return Object.entries(PAYMENT_STATUS_LABELS as any).reduce((acc, [status, label]) => {
      acc[status] = monthlyOrders.filter((o) => o.paymentStatus === (status as keyof typeof PAYMENT_STATUS_LABELS)).length ?? 0;
      return acc;
    }, {} as Record<string, number>);
  }, [monthlyOrders]);

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

  const urgentOrders = useMemo(() => {
    return orders?.filter((o) => isDueToday(o) || isDueTomorrow(o) || isOverdue(o)) ?? [];
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-10">
        <div>
          <h2 className="font-display text-headline-md text-primary mb-2">Dashboard Overview</h2>
          <p className="text-on-surface-variant text-sm">Current Month Summary — {currentMonth}</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/activity-log">
            <Button variant="surface" size="sm">
              <ScrollText className="h-4 w-4" />
              Activity Log
            </Button>
          </Link>
          <Link to="/admin/estadisticas">
            <Button variant="surface" size="sm">
              <BarChart3 className="h-4 w-4" />
              Stats
            </Button>
          </Link>
          <Link to="/admin/exportar">
            <Button variant="surface" size="sm">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient shadow-ambient-hover transition-shadow relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-semibold text-on-surface-variant uppercase tracking-wide">Total Orders</p>
            <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary">
              <span className="text-xs font-bold">{monthlyOrders.length}</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-primary font-display mb-2">{monthlyOrders.length}</h3>
          <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Mes actual</p>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient shadow-ambient-hover transition-shadow relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-semibold text-on-surface-variant uppercase tracking-wide">Revenue</p>
            <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <span className="text-xs font-bold">$</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-primary font-display mb-2">
            ${Object.values(paymentStatusCounts).reduce((a: number, b: any) => a + (typeof b === 'number' ? b : 0), 0)}
          </h3>
          <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Pagadas</p>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient shadow-ambient-hover transition-shadow relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-semibold text-on-surface-variant uppercase tracking-wide">Pending Review</p>
            <div className="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed-variant">
              <span className="text-xs font-bold">{byStatus["revision"] ?? 0}</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-primary font-display mb-2">{byStatus["revision"] ?? 0}</h3>
          <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Needs attention</p>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient shadow-ambient-hover transition-shadow relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-semibold text-on-surface-variant uppercase tracking-wide">Completed</p>
            <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
              <span className="text-xs font-bold">{byStatus["completada"] ?? 0}</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-primary font-display mb-2">{byStatus["completada"] ?? 0}</h3>
          <p className="text-xs text-brand-operator-2 font-semibold uppercase tracking-wider">This month</p>
        </div>
      </div>

      {/* Urgency Alerts + Renewals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Urgency Alerts */}
        {urgentOrders.length > 0 && (
          <div className="bg-surface-container-lowest rounded-xl shadow-ambient overflow-hidden flex flex-col h-full border border-error/20">
            <div className="p-6 border-b border-border-subtle bg-error-container/10 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-urgency-alert" />
              <h3 className="font-display text-headline-sm text-primary">Urgency Alerts</h3>
              <span className="ml-auto bg-urgency-alert text-white text-xs font-bold px-2 py-1 rounded-full">{urgentOrders.length}</span>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              {urgentOrders.slice(0, 3).map((order) => {
                const isUrgent = isDueToday(order) || isOverdue(order);
                return (
                  <Link
                    key={order.id}
                    to={`/admin/ordenes/${order.id}`}
                    className={`block p-4 rounded-lg bg-surface-container-low border-l-4 ${isUrgent ? "border-urgency-alert" : "border-orange-400"} shadow-sm hover:bg-surface-container transition-colors`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs font-bold uppercase tracking-wider ${isUrgent ? "text-urgency-alert" : "text-orange-600"}`}>
                        {isOverdue(order) ? "Overdue" : isDueToday(order) ? "Due today" : "Due tomorrow"}
                      </span>
                      <span className="text-xs text-on-surface-variant">#{order.id}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-primary mb-1">{order.serviceType}</h4>
                    <p className="text-sm text-on-surface-variant mb-3">{order.clientName}</p>
                    <span className="text-sm font-semibold text-brand-operator-1 hover:underline">Review Now</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Subscription Renewals */}
        {renewals.length > 0 && (
          <div className="bg-surface-container-lowest rounded-xl shadow-ambient overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-border-subtle flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-tertiary" />
              <h3 className="font-display text-headline-sm text-primary">Suscripciones por vencer</h3>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              {renewals.map((sub) => {
                const d = daysUntil(sub.endDate);
                return (
                  <Link
                    key={sub.id}
                    to={`/admin/clientes/${sub.clientPhone}`}
                    className="block p-3 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-primary">{sub.clientName}</span>
                      <span className="text-xs text-on-surface-variant">#{sub.id}</span>
                    </div>
                    <p className="text-sm text-on-surface-variant">
                      Vence en {d} día{d !== 1 ? "s" : ""} ({sub.endDate})
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* By Status Summary */}
        <div className="bg-surface-container-lowest rounded-xl shadow-ambient overflow-hidden">
          <div className="p-6 border-b border-border-subtle">
            <h3 className="font-display text-headline-sm text-primary">Por estado</h3>
          </div>
          <div className="p-4 space-y-2">
            {Object.entries(byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-low transition-colors">
                <span className={`text-sm font-medium ${ORDER_STATUS_CLASSES[status as keyof typeof ORDER_STATUS_LABELS]}`}>
                  {ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS]}
                </span>
                <span className="text-sm font-bold text-primary">{count as number}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* By Operator */}
      {Object.keys(byOperator).length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(byOperator).map(([opName, stats]) => (
            <div key={opName} className="bg-surface-container-lowest rounded-xl p-4 shadow-ambient">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-3 h-3 rounded-full ${opName === "001" ? "bg-brand-operator-1" : "bg-brand-operator-2"}`} />
                <span className="text-sm font-semibold text-primary">Operador {opName}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-on-surface-variant">Total: <span className="font-bold text-primary">{stats.total}</span></div>
                <div className="text-on-surface-variant">Completadas: <span className="font-bold text-brand-operator-2">{stats.completed}</span></div>
                <div className="text-on-surface-variant">En progreso: <span className="font-bold text-tertiary">{stats.updatings}</span></div>
                <div className="text-on-surface-variant">Pendientes: <span className="font-bold text-brand-operator-1">{stats.pending}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Session info */}
      <p className="text-sm text-on-surface-variant">
        Sesión expira tras {config?.sessionTimeoutHours ?? "—"} hora(s) de inactividad.
      </p>
    </div>
  );
}
