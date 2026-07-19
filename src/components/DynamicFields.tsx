import type { ServiceType } from "@/lib/types";

// Campos condicionales según el servicio (manual §2.2.4 / §6.1). Placeholder.
export function DynamicFields({ serviceType }: { serviceType: ServiceType }) {
  return (
    <div className="rounded-lg border p-4 text-sm text-muted-foreground">
      Campos para: <span className="capitalize">{serviceType}</span> (pendiente)
    </div>
  );
}
