interface StatusData {
  status: string;
  count: number;
  color: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  nueva: { label: "Nueva", color: "bg-brand-operator-1" },
  pendiente_pago: { label: "Pendiente pago", color: "bg-tertiary" },
  en_progreso: { label: "En progreso", color: "bg-secondary" },
  revision: { label: "Revisión", color: "bg-orange-500" },
  pendiente_final: { label: "Pendiente final", color: "bg-cyan-500" },
  completada: { label: "Completada", color: "bg-brand-operator-2" },
  cancelada: { label: "Cancelada", color: "bg-error" },
};

interface Props {
  data: Record<string, number>;
}

export function OrderStatusChart({ data }: Props) {
  const total = Object.values(data).reduce((sum, count) => sum + count, 0);

  if (total === 0) {
    return (
      <div className="text-center py-8 text-on-surface-variant">
        Sin datos de órdenes
      </div>
    );
  }

  const statusData: StatusData[] = Object.entries(data)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      status,
      count,
      color: STATUS_CONFIG[status]?.color || "bg-gray-500",
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-3">
      {statusData.map(({ status, count, color }) => {
        const percentage = Math.round((count / total) * 100);
        return (
          <div key={status} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${color}`} />
                {STATUS_CONFIG[status]?.label || status}
              </span>
              <span className="text-on-surface-variant">
                {count} ({percentage}%)
              </span>
            </div>
            <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className={`h-full ${color} transition-all duration-500`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
