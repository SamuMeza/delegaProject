import { Badge } from "@/components/ui/badge";
import type { ActivityLogEntry as ActivityLogEntryType } from "@/lib/types";

const ACTION_LABELS: Record<string, string> = {
  login: "Inicio de sesión",
  logout: "Cierre de sesión",
  create_order: "Creó orden",
  update_order: "Actualizó orden",
  delete_order: "Eliminó orden",
  add_note: "Agregó nota",
  upload_file: "Subió archivo",
  change_status: "Cambió estado",
  create_client: "Creó cliente",
  update_client: "Actualizó cliente",
  create_subscription: "Creó suscripción",
  cancel_subscription: "Canceló suscripción",
  renew_subscription: "Renovó suscripción",
};

const ACTION_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  login: "default",
  logout: "secondary",
  create_order: "default",
  update_order: "outline",
  delete_order: "destructive",
  add_note: "secondary",
  upload_file: "outline",
  change_status: "default",
  create_client: "default",
  update_client: "outline",
  create_subscription: "default",
  cancel_subscription: "destructive",
  renew_subscription: "default",
};

interface Props {
  entry: ActivityLogEntryType;
}

export function ActivityLogEntry({ entry }: Props) {
  const date = new Date(entry.timestamp);
  const formattedDate = date.toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("es-VE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={ACTION_COLORS[entry.action] || "default"}>
            {ACTION_LABELS[entry.action] || entry.action}
          </Badge>
          {entry.targetId && (
            <span className="text-xs text-muted-foreground font-mono">
              {entry.targetId}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-foreground line-clamp-2">{entry.details}</p>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <span>{entry.operatorId}</span>
          <span>·</span>
          <span>{formattedDate} {formattedTime}</span>
        </div>
      </div>
    </div>
  );
}
