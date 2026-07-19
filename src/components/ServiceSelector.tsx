import type { ServiceType } from "@/lib/types";

// Selector de servicio (manual §6.1 / §11.7). Placeholder de preparación.
export function ServiceSelector({
  onSelect,
}: {
  onSelect: (service: ServiceType) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {(
        [
          "ensayo",
          "presentacion",
          "investigacion",
          "formato",
          "diseno",
          "video",
        ] as ServiceType[]
      ).map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onSelect(s)}
          className="rounded-lg border p-4 capitalize"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
