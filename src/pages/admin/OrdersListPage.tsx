import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useOperators, useOrders } from "@/hooks/useDelegaDB";
import { useOrderPermissions } from "@/lib/orders/permissions";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_CLASSES,
  SERVICE_TYPE_LABELS,
  isOverdue,
  operatorLabel,
} from "@/lib/orders/ui";
import type { Operator, Order, OrderStatus, Session } from "@/lib/types";

const STATUS_FILTERS: { value: OrderStatus | "todas"; label: string }[] = [
  { value: "todas", label: "Todos los estados" },
  ...Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({
    value: value as OrderStatus,
    label,
  })),
];

function OrderRow({
  order,
  operators,
  session,
}: {
  order: Order;
  operators: Operator[] | undefined;
  session: Session | null;
}) {
  const perms = useOrderPermissions(order, session);
  const overdue = isOverdue(order);
  return (
    <tr className="border-b border-border-subtle hover:bg-surface-container-low transition-colors">
      <td className="py-4 px-6 font-medium text-primary">
        <Link
          to={`/admin/ordenes/${order.id}`}
          className="hover:underline"
        >
          #{order.id}
        </Link>
      </td>
      <td className="py-4 px-6">
        <div className="text-on-surface font-medium">{order.clientName}</div>
        <div className="text-xs text-on-surface-variant">{order.clientPhone}</div>
      </td>
      <td className="py-4 px-6 text-on-surface-variant">{SERVICE_TYPE_LABELS[order.serviceType]}</td>
      <td className="py-4 px-6">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${ORDER_STATUS_CLASSES[order.status]}`}
        >
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </td>
      <td className="py-4 px-6">
        <div className="text-on-surface">{operatorLabel(operators, order.operatorId)}</div>
        {!perms.canEdit && (
          <div className="text-xs text-on-surface-variant">solo lectura</div>
        )}
      </td>
      <td className="py-4 px-6">
        <div className="flex flex-wrap gap-1">
          {order.urgent && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-urgency-alert text-white">
              Urgente
            </span>
          )}
          {overdue && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-error text-on-error">
              Vencida
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}

export function OrdersListPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const operators = useOperators();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "todas">("todas");
  const [q, setQ] = useState("");
  const orders = useOrders({
    status: statusFilter === "todas" ? undefined : statusFilter,
    q: q.trim() || undefined,
  });

  if (orders === undefined) {
    return <div className="text-sm text-on-surface-variant p-8">Cargando órdenes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-headline-md text-primary mb-2">Órdenes</h2>
          <p className="text-sm text-on-surface-variant">
            Todas las órdenes del equipo (propias y de otros operadores).
          </p>
        </div>
        <Button onClick={() => navigate("/admin/ordenes/nueva")}>
          <Plus className="h-4 w-4" />
          Nueva orden
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <Input
            className="pl-9"
            placeholder="Buscar por cliente, teléfono o ID..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Buscar órdenes por cliente, teléfono o ID"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as OrderStatus | "todas")}
          aria-label="Filtrar por estado"
        >
          {STATUS_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </Select>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-subtle p-10 text-center bg-surface-container-lowest">
          <p className="text-sm text-on-surface-variant">
            Aún no hay órdenes registradas.
          </p>
          <Button className="mt-4" onClick={() => navigate("/admin/ordenes/nueva")}>
            <Plus className="h-4 w-4" />
            Crear la primera orden
          </Button>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl shadow-ambient overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-low border-b border-border-subtle text-left text-on-surface-variant">
              <tr>
                <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs">ID</th>
                <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs">Cliente</th>
                <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs">Servicio</th>
                <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs">Estado</th>
                <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs">Operador</th>
                <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs">Alertas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {orders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  operators={operators}
                  session={session}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
