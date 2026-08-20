import { estimatePrice, formatPrice } from "@/lib/pricing";
import type { ServiceType } from "@/lib/types";

export function PriceEstimator({
  serviceType,
  params,
}: {
  serviceType: ServiceType | null;
  params?: Record<string, string>;
}) {
  const estimated = serviceType ? estimatePrice(serviceType, params) : 0;

  if (!serviceType) return null;

  return (
    <div className="rounded-lg border-2 border-secondary/20 bg-secondary/5 p-4">
      <p className="text-sm text-on-surface-variant font-semibold uppercase tracking-wider">Precio estimado</p>
      <p className="text-2xl font-bold text-secondary font-display">{formatPrice(estimated)}</p>
      <p className="mt-1 text-xs text-on-surface-variant">
        El precio final se confirma al enviar la solicitud
      </p>
    </div>
  );
}