import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ActivityLogFilters as Filters } from "@/hooks/useActivityLog";
import type { ActionType } from "@/lib/types";

const ACTION_OPTIONS: { value: ActionType; label: string }[] = [
  { value: "create_order", label: "Creó orden" },
  { value: "update_order", label: "Actualizó orden" },
  { value: "delete_order", label: "Eliminó orden" },
  { value: "change_status", label: "Cambió estado" },
  { value: "add_note", label: "Agregó nota" },
  { value: "upload_file", label: "Subió archivo" },
  { value: "create_client", label: "Creó cliente" },
  { value: "update_client", label: "Actualizó cliente" },
  { value: "create_subscription", label: "Creó suscripción" },
  { value: "cancel_subscription", label: "Canceló suscripción" },
  { value: "renew_subscription", label: "Renovó suscripción" },
  { value: "login", label: "Inicio de sesión" },
  { value: "logout", label: "Cierre de sesión" },
];

interface Props {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  onReset: () => void;
}

export function ActivityLogFiltersComponent({ filters, onFilterChange, onReset }: Props) {
  return (
    <div className="flex flex-wrap items-end gap-3 p-4 bg-muted/50 rounded-lg">
      <div className="flex-1 min-w-[150px]">
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          Operador
        </label>
        <Input
          placeholder="ID del operador..."
          value={filters.operatorId || ""}
          onChange={(e) =>
            onFilterChange({ ...filters, operatorId: e.target.value || undefined })
          }
        />
      </div>

      <div className="flex-1 min-w-[150px]">
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          Tipo de acción
        </label>
        <Select
          value={filters.action || ""}
          onValueChange={(val) =>
            onFilterChange({ ...filters, action: (val as ActionType) || undefined })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {ACTION_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[150px]">
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          Desde
        </label>
        <Input
          type="date"
          value={filters.dateFrom || ""}
          onChange={(e) =>
            onFilterChange({ ...filters, dateFrom: e.target.value || undefined })
          }
        />
      </div>

      <div className="flex-1 min-w-[150px]">
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          Hasta
        </label>
        <Input
          type="date"
          value={filters.dateTo || ""}
          onChange={(e) =>
            onFilterChange({ ...filters, dateTo: e.target.value || undefined })
          }
        />
      </div>

      <Button variant="outline" onClick={onReset}>
        Limpiar
      </Button>
    </div>
  );
}
