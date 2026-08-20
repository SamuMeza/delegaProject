import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { OrderStatus, OperatorStats } from "@/lib/types";

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
  const [stats, setStats] = useState<MonthlyStatistics | undefined>(undefined);

  useEffect(() => {
    const currentMonth = getCurrentMonth();

    Promise.all([
      supabase.from("orders").select("*"),
      supabase.from("subscriptions").select("*")
    ]).then(([ordersRes, subsRes]) => {
      if (ordersRes.error || subsRes.error) {
        console.error("Error useStatistics:", ordersRes.error || subsRes.error);
        return;
      }

      const orders = ordersRes.data || [];
      const subscriptions = subsRes.data || [];

      const monthOrders = orders.filter((o: any) => o.created_at && o.created_at.startsWith(currentMonth));

      const totalOrders = monthOrders.length;
      const completedOrders = monthOrders.filter((o: any) => o.status === "completada").length;
      const pendingOrders = monthOrders.filter(
        (o: any) => o.status !== "completada" && o.status !== "cancelada"
      ).length;
      const cancelledOrders = monthOrders.filter((o: any) => o.status === "cancelada").length;

      const totalRevenue = monthOrders.reduce((sum: number, o: any) => sum + (Number(o.price) || 0), 0);

      const byOperator: Record<string, OperatorStats> = {};
      for (const order of monthOrders) {
        const opId = order.operator_id;
        if (!byOperator[opId]) {
          byOperator[opId] = { orders: 0, revenue: 0 };
        }
        byOperator[opId].orders++;
        byOperator[opId].revenue += Number(order.price) || 0;
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
        byStatus[order.status as OrderStatus]++;
      }

      const activeSubscriptions = subscriptions.filter(
        (s: any) => s.status === "activa" && s.end_date >= currentMonth
      ).length;

      const subscriptionRevenue = subscriptions
        .filter((s: any) => s.status === "activa" && s.start_date.startsWith(currentMonth))
        .reduce((sum: number, s: any) => sum + Number(s.price), 0);

      setStats({
        totalOrders,
        completedOrders,
        pendingOrders,
        cancelledOrders,
        totalRevenue,
        byOperator,
        activeSubscriptions,
        subscriptionRevenue,
        byStatus,
      });
    });
  }, []);

  return stats;
}
