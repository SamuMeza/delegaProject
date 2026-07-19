import type { ServiceType } from "@/lib/types";

// Cálculo de precio (manual §9.2). Skeleton de preparación de terreno.
// Precios base por variante de servicio. La urgencia (+50%) y la suscripción
// ($0 dentro de cupo) se aplican en la fase de features.

export const BASE_PRICES: Record<string, number> = {
  "ensayo_1-3": 3,
  "ensayo_4-7": 5,
  "presentacion_hasta-10": 4,
  "presentacion_11-20": 6,
  "investigacion": 5,
  "formato": 2,
  "diseno": 3,
  "video_corto-redes": 8,
  "video_presentacion": 15,
  "video_publicitario": 12,
  "video_educativo": 10,
};

export function estimatePrice(
  serviceType: ServiceType,
  variant: string,
): number {
  const key = `${serviceType}_${variant}`;
  return BASE_PRICES[key] ?? BASE_PRICES[serviceType] ?? 0;
}
