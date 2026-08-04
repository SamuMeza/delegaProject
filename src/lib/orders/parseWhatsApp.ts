import type { ServiceType } from "@/lib/types";

const SERVICE_TYPE_MAP: Record<string, ServiceType> = {
  ensayo: "ensayo",
  presentación: "presentacion",
  presentacion: "presentacion",
  investigación: "investigacion",
  investigacion: "investigacion",
  formato: "formato",
  diseño: "diseno",
  diseno: "diseno",
  video: "video",
};

function extractLine(text: string, emoji: string): string | undefined {
  const regex = new RegExp(`${emoji}\\s*(.+)`, "i");
  const match = text.match(regex);
  if (!match?.[1]) return undefined;
  // Strip Unicode variation selectors and leading/trailing whitespace
  return match[1].replace(/[\uFE0F\u200D\u20E3]/g, "").trim();
}

function parseParameters(raw: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!raw) return result;

  const pairs = raw.split(",").map((s) => s.trim());
  for (const pair of pairs) {
    const colonIdx = pair.indexOf(":");
    if (colonIdx === -1) continue;
    const key = pair.slice(0, colonIdx).trim();
    const value = pair.slice(colonIdx + 1).trim();
    if (key && value) {
      result[key] = value;
    }
  }
  return result;
}

function mapServiceType(raw: string): ServiceType {
  const normalized = raw.toLowerCase().trim();
  return SERVICE_TYPE_MAP[normalized] ?? "ensayo";
}

export interface ParsedWhatsApp {
  clientName: string;
  clientPhone: string;
  serviceType: ServiceType;
  price: number;
  description: string;
  parameters: Record<string, string>;
  raw: string;
}

export function parseWhatsApp(text: string): ParsedWhatsApp | null {
  if (!text || !text.includes("Delega")) return null;

  const clientName = extractLine(text, "👤\\s*Cliente:") ?? "";
  const clientPhone = extractLine(text, "📞\\s*Contacto:") ?? "";
  const serviceRaw = extractLine(text, "🎓\\s*Servicio:") ?? "ensayo";
  const description = extractLine(text, "📝\\s*Descripción:") ?? "";
  const parametersRaw = extractLine(text, "⚙️\\s*Parámetros:") ?? "";
  const priceRaw = extractLine(text, "💰\\s*Precio\\s*estimado:") ?? "0";

  const priceMatch = priceRaw.match(/([\d.]+)/);
  const price = priceMatch ? parseFloat(priceMatch[1]) : 0;

  return {
    clientName,
    clientPhone,
    serviceType: mapServiceType(serviceRaw),
    price,
    description,
    parameters: parseParameters(parametersRaw),
    raw: text,
  };
}
