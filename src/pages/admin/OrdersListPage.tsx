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
    <tr className="border-t hover:bg-muted/30">
      <td className="px-3 py-2 font-mono">
        <Link
          to={`/admin/ordenes/${order.id}`}
          className="text-primary underline-offset-2 hover:underline"
        >
          {order.id}
        </Link>
      </td>
      <td className="px-3 py-2">
        <div>{order.clientName}</div>
        <div className="text-xs text-muted-foreground">{order.clientPhone}</div>
      </td>
      <td className="px-3 py-2">{SERVICE_TYPE_LABELS[order.serviceType]}</td>
      <td className="px-3 py-2">
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_CLASSES[order.status]}`}
        >
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </td>
      <td className="px-3 py-2">
        <div>{operatorLabel(operators, order.operatorId)}</div>
        {!perms.canEdit && (
          <div className="text-xs text-muted-foreground">solo lectura</div>
        )}
      </td>
      <td className="px-3 py-2">
        <div className="flex flex-wrap gap-1">
          {order.urgent && (
            <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-medium text-white">
              Urgente
            </span>
          )}
          {overdue && (
            <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-medium text-white">
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
    return <main className="p-8 text-sm text-muted-foreground">Cargando órdenes…</main>;
  }

  return (
    <main className="p-4 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Órdenes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Todas las órdenes del equipo (propias y de otros operadores).
          </p>
        </div>
        <Button onClick={() => navigate("/admin/ordenes/nueva")}>
          <Plus className="h-4 w-4" />
          Nueva orden
        </Button>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por cliente, teléfono o ID…"
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
        <div className="mt-10 flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Aún no hay órdenes registradas.
          </p>
          <Button className="mt-4" onClick={() => navigate("/admin/ordenes/nueva")}>
            <Plus className="h-4 w-4" />
            Crear la primera orden
          </Button>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">ID</th>
                <th className="px-3 py-2 font-medium">Cliente</th>
                <th className="px-3 py-2 font-medium">Servicio</th>
                <th className="px-3 py-2 font-medium">Estado</th>
                <th className="px-3 py-2 font-medium">Operador</th>
                <th className="px-3 py-2 font-medium">Alertas</th>
              </tr>
            </thead>
            <tbody>
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
    </main>
  );
}
