interface Props {
  data: Record<string, { orders: number; revenue: number }>;
}

export function OperatorDistributionChart({ data }: Props) {
  const entries = Object.entries(data);

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Sin datos de operadores
      </div>
    );
  }

  const maxOrders = Math.max(...entries.map(([_, stats]) => stats.orders));

  return (
    <div className="space-y-4">
      {entries.map(([operatorId, stats]) => (
        <div key={operatorId} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{operatorId}</span>
            <span className="text-muted-foreground">
              {stats.orders} órdenes · ${stats.revenue.toLocaleString()}
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{
                width: `${maxOrders > 0 ? (stats.orders / maxOrders) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
