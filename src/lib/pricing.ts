import type { ServiceType } from "@/lib/types";
import { getServiceConfig } from "@/lib/config/serviceTypes";

const ADJUSTMENTS: Record<string, Record<string, number>> = {
  ensayo: {
    "paginas:8+": 3,
    "wordCount:2000+": 2,
    "academicLevel:postgrado": 2,
    "academicLevel:pregrado": 1,
  },
  presentacion: {
    "slideCount:20+": 2,
    "audienceLevel:avanzado": 2,
    "audienceLevel:intermedio": 1,
  },
  investigacion: {
    "wordCount:3000+": 2,
    "academicLevel:postgrado": 2,
    "sourceCount:10+": 2,
  },
  formato: {},
  diseno: {
    "designType:logo": 2,
    "designType:infographic": 1,
  },
  video: {
    "duration:mas": 3,
    "duration:3-5min": 2,
    "resolution:4k": 2,
    "resolution:1080p": 1,
  },
};

export function estimatePrice(serviceType: ServiceType, params?: Record<string, unknown>, urgent?: boolean): number {
  const config = getServiceConfig(serviceType);
  if (!config) return 0;

  let price = config.basePrice;
  const adjustments = ADJUSTMENTS[serviceType];

  if (params && adjustments) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === "") continue;
      const strVal = String(value);
      const adjustmentKey = `${key}:${strVal}`;
      if (adjustments[adjustmentKey]) {
        price += adjustments[adjustmentKey];
      }
    }
  }

  if (urgent) {
    price = Math.round(price * 1.5);
  }

  return price;
}

export function formatPrice(price: number): string {
  return `$${price.toFixed(0)}`;
}