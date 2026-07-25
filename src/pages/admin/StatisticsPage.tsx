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
      <div className="space-y-6">
        <h2 className="font-display text-headline-md text-primary">Estadísticas</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" aria-live="polite" aria-label="Resumen de estadísticas">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  const ordersByStatus = stats.byStatus;

  return (
    <div className="space-y-6">
      <h2 className="font-display text-headline-md text-primary">Estadísticas del mes</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total órdenes"
          value={stats.totalOrders}
          description={`${stats.completedOrders} completadas`}
          icon={<ShoppingCart className="h-4 w-4" />}
          iconColor="bg-surface-container text-primary"
        />
        <StatsCard
          title="Ingresos"
          value={`$${(stats.totalRevenue + stats.subscriptionRevenue).toLocaleString()}`}
          description="órd + subs"
          icon={<CreditCard className="h-4 w-4" />}
          iconColor="bg-secondary-container text-on-secondary-container"
        />
        <StatsCard
          title="Suscripciones"
          value={stats.activeSubscriptions}
          description="activas"
          icon={<Users className="h-4 w-4" />}
          iconColor="bg-tertiary-fixed text-on-tertiary-fixed-variant"
        />
        <StatsCard
          title="Pendientes"
          value={stats.pendingOrders}
          description={`${stats.cancelledOrders} canceladas`}
          icon={<TrendingUp className="h-4 w-4" />}
          iconColor="bg-primary-fixed text-on-primary-fixed"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <CardHeader className="px-0 pb-4">
            <CardTitle className="text-base font-display text-headline-sm text-primary">Distribución por estado</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <OrderStatusChart data={ordersByStatus} />
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="px-0 pb-4">
            <CardTitle className="text-base font-display text-headline-sm text-primary">Distribución por operador</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <OperatorDistributionChart data={stats.byOperator} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
