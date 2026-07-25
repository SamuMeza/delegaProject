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
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#20bd5a] shadow-ambient hover:shadow-ambient-hover"
      >
        Enviar por WhatsApp
      </a>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(message);
          onCopy?.();
        }}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-border-subtle bg-surface-container-lowest px-6 py-3 text-sm font-medium transition-all hover:bg-surface-container text-on-surface"
      >
        Copiar mensaje al portapapeles
      </button>
    </div>
  );
}