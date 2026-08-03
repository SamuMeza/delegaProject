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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {SERVICE_TYPES.map((s) => {
        const Icon = s.icon;
        const isSelected = selected === s.id;
        return (
          <label
            key={s.id}
            className={cn(
              "relative flex flex-col items-start gap-4 rounded-xl border-2 p-6 cursor-pointer transition-all",
              isSelected
                ? "border-secondary bg-secondary-container shadow-ambient"
                : "border-border-subtle bg-surface-container-lowest shadow-ambient hover:shadow-ambient-hover hover:border-primary-fixed",
            )}
          >
            <input
              type="radio"
              name="serviceType"
              value={s.id}
              checked={isSelected}
              onChange={() => onSelect(s)}
              className="sr-only"
            />
            <Icon className="w-8 h-8 text-primary" strokeWidth={1.5} />
            <div>
              <h3 className="text-lg font-semibold text-primary">{s.label}</h3>
              <p className="text-sm text-on-surface-variant mt-1">{s.description}</p>
            </div>
            <span className="text-sm font-semibold text-secondary">
              Desde ${s.basePrice}
            </span>
          </label>
        );
      })}
    </div>
  );
}
