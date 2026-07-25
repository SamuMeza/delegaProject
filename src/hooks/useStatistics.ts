import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/delegaDb";
import type { Order, Subscription, OperatorStats, OrderStatus } from "@/lib/types";

export interface MonthlyStatistics {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  byOperator: Record<string, OperatorStats>;
  activeSubscriptions: number;
  subscriptionRevenue: number;
  byStatus: Record<OrderStatus, number>;
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function useStatistics(): MonthlyStatistics | undefined {
  return useLiveQuery(async () => {
    const currentMonth = getCurrentMonth();
    const orders: Order[] = await db.orders.toArray();
    const subscriptions: Subscription[] = await db.subscriptions.toArray();

    const monthOrders = orders.filter((o) => o.createdAt.startsWith(currentMonth));

    const totalOrders = monthOrders.length;
    const completedOrders = monthOrders.filter((o) => o.status === "completada").length;
    const pendingOrders = monthOrders.filter(
      (o) => o.status !== "completada" && o.status !== "cancelada",
    ).length;
    const cancelledOrders = monthOrders.filter((o) => o.status === "cancelada").length;

    const totalRevenue = monthOrders.reduce((sum, o) => sum + (o.price || 0), 0);

    const byOperator: Record<string, OperatorStats> = {};
    for (const order of monthOrders) {
      if (!byOperator[order.operatorId]) {
        byOperator[order.operatorId] = { orders: 0, revenue: 0 };
      }
      byOperator[order.operatorId].orders++;
      byOperator[order.operatorId].revenue += order.price || 0;
    }

    const byStatus: Record<OrderStatus, number> = {
      nueva: 0,
      pendiente_pago: 0,
      en_progreso: 0,
      revision: 0,
      pendiente_final: 0,
      completada: 0,
      cancelada: 0,
    };
    for (const order of monthOrders) {
      byStatus[order.status]++;
    }

    const activeSubscriptions = subscriptions.filter(
      (s) => s.status === "activa" && s.endDate >= currentMonth,
    ).length;

    const subscriptionRevenue = subscriptions
      .filter((s) => s.status === "activa" && s.startDate.startsWith(currentMonth))
      .reduce((sum, s) => sum + s.price, 0);

    return {
      totalOrders,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      totalRevenue,
      byOperator,
      activeSubscriptions,
      subscriptionRevenue,
      byStatus,
    };
  }, []);
}
