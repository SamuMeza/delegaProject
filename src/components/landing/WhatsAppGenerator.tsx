import { env } from "@/lib/config/env";

export interface WhatsAppMessageData {
  token: string;
  clientName: string;
  clientContact: string;
  serviceType: string;
  description: string;
  parameters: string;
  estimatedPrice: number;
  createdAt: string;
}

function buildMessage(data: WhatsAppMessageData): string {
  return [
    "【Nueva Solicitud de Delega】",
    "",
    `📋 ID de seguimiento: ${data.token}`,
    `👤 Cliente: ${data.clientName}`,
    `📞 Contacto: ${data.clientContact}`,
    `🎓 Servicio: ${data.serviceType}`,
    `📝 Descripción: ${data.description}`,
    `⚙️ Parámetros: ${data.parameters}`,
    `💰 Precio estimado: $${data.estimatedPrice}`,
    `📅 Fecha de solicitud: ${data.createdAt}`,
  ].join("\n");
}

export function WhatsAppGenerator({
  data,
  onCopy,
}: {
  data: WhatsAppMessageData;
  onCopy?: () => void;
}) {
  const message = buildMessage(data);
  const waUrl = `https://wa.me/${env.whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="space-y-3">
      <a
        href={waUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-secondary/90"
      >
        Enviar por WhatsApp
      </a>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(message);
          onCopy?.();
        }}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-white px-6 py-3 text-sm font-medium transition-all hover:bg-surface"
      >
        Copiar mensaje al portapapeles
      </button>
    </div>
  );
}