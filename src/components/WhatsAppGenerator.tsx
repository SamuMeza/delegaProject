// Generador de enlace wa.me (manual §6.2 / §11.7). Placeholder.
export function WhatsAppGenerator({
  message,
  phone,
}: {
  message: string;
  phone: string;
}) {
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  return (
    <a href={url} target="_blank" rel="noreferrer" className="text-primary underline">
      Enviar por WhatsApp
    </a>
  );
}
