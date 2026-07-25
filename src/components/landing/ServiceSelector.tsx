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
            "flex flex-col items-center justify-center gap-1 rounded-xl border-2 px-4 py-4 text-center transition-all min-h-[100px]",
            selected === s.id
              ? "border-primary bg-primary/5 shadow-ambient"
              : "border-border-subtle bg-surface-container-lowest shadow-ambient hover:shadow-ambient-hover hover:border-primary/40",
          )}
        >
          <span className="text-lg font-semibold capitalize text-primary">{s.label}</span>
          <span className="text-xs text-on-surface-variant">{s.description}</span>
          <span className="mt-1 text-sm font-bold text-secondary">Desde ${s.basePrice}</span>
        </button>
      ))}
    </div>
  );
}