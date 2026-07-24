import { SERVICE_TYPES, type ServiceTypeConfig } from "@/lib/config/serviceTypes";
import { cn } from "@/lib/utils";

export function ServiceSelector({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (service: ServiceTypeConfig) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {SERVICE_TYPES.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onSelect(s)}
          className={cn(
            "flex flex-col items-center justify-center gap-1 rounded-xl border-2 px-4 py-4 text-center transition-all hover:border-primary/40 hover:shadow-sm min-h-[100px]",
            selected === s.id
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border bg-white",
          )}
        >
          <span className="text-lg font-semibold capitalize">{s.label}</span>
          <span className="text-xs text-muted-foreground">{s.description}</span>
          <span className="mt-1 text-sm font-bold text-secondary">Desde ${s.basePrice}</span>
        </button>
      ))}
    </div>
  );
}