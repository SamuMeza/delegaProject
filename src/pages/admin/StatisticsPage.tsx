import { useStatistics } from "@/hooks/useStatistics";
import { StatsCard } from "@/components/StatsCard";
import { OrderStatusChart } from "@/components/OrderStatusChart";
import { OperatorDistributionChart } from "@/components/OperatorDistributionChart";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, ShoppingCart, Users, CreditCard } from "lucide-react";

export function StatisticsPage() {
  const stats = useStatistics();

  if (!stats) {
    return (
      <main className="p-4 md:p-8 space-y-6">
        <h1 className="text-2xl font-semibold">Estadísticas</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" aria-live="polite" aria-label="Resumen de estadísticas">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </main>
    );
  }

  const ordersByStatus = stats.byStatus;

  return (
    <main className="p-4 md:p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Estadísticas del mes</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total órdenes"
          value={stats.totalOrders}
          description={`${stats.completedOrders} completadas`}
          icon={<ShoppingCart className="h-4 w-4" />}
        />
        <StatsCard
          title="Ingresos estimados"
          value={`$${(stats.totalRevenue + stats.subscriptionRevenue).toLocaleString()}`}
          description={`$${stats.totalRevenue.toLocaleString()} órdenes + $${stats.subscriptionRevenue.toLocaleString()} suscripciones`}
          icon={<CreditCard className="h-4 w-4" />}
        />
        <StatsCard
          title="Suscripciones activas"
          value={stats.activeSubscriptions}
          description="Clientes con suscripción vigente"
          icon={<Users className="h-4 w-4" />}
        />
        <StatsCard
          title="Órdenes pendientes"
          value={stats.pendingOrders}
          description={`${stats.cancelledOrders} canceladas`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribución por estado</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderStatusChart data={ordersByStatus} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribución por operador</CardTitle>
          </CardHeader>
          <CardContent>
            <OperatorDistributionChart data={stats.byOperator} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
