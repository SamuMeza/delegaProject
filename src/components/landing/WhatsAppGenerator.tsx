import { useState } from "react";
import { env } from "@/lib/config/env";
import { Check, Copy, MessageCircle } from "lucide-react";

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
  const [copied, setCopied] = useState(false);
  const message = buildMessage(data);

  async function handleCopyAndOpen() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      onCopy?.();
      window.open(`https://wa.me/${env.whatsappNumber}`, "_blank");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = message;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      onCopy?.();
      window.open(`https://wa.me/${env.whatsappNumber}`, "_blank");
      setTimeout(() => setCopied(false), 3000);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleCopyAndOpen}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#1DA851] shadow-ambient hover:shadow-ambient-hover"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" />
            ¡Mensaje copiado! Abrir WhatsApp
          </>
        ) : (
          <>
            <MessageCircle className="w-4 h-4" />
            Copiar y abrir WhatsApp
          </>
        )}
      </button>
      <p className="text-xs text-on-surface-variant text-center">
        {copied
          ? "El mensaje se copió. Pégalo en el chat de WhatsApp."
          : "Se copiará el mensaje y se abrirá WhatsApp. Pégalo en el chat."}
      </p>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(message);
          setCopied(true);
          onCopy?.();
          setTimeout(() => setCopied(false), 3000);
        }}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-border-subtle bg-surface-container-lowest px-6 py-3 text-sm font-medium transition-all hover:bg-surface-container text-on-surface"
      >
        <Copy className="w-4 h-4" />
        Solo copiar mensaje
      </button>
    </div>
  );
}
