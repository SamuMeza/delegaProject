import { useState } from "react";
import { useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/delegaDb";
import { generateTrackingUrl } from "@/lib/tracking";
import type { Order } from "@/lib/types";

function orderDescription(order: Order): string {
  const d = order.details;
  if (!d) return "";
  if ("tema" in d && typeof d.tema === "string") return d.tema;
  if ("formatoEntrega" in d && typeof d.formatoEntrega === "string") return d.formatoEntrega;
  if ("tipoDiseno" in d && typeof d.tipoDiseno === "string") return d.tipoDiseno;
  if ("tipoVideo" in d && typeof d.tipoVideo === "string") return d.tipoVideo;
  return JSON.stringify(d).slice(0, 100);
}

const STATUS_OPTIONS = [
  { value: "nueva", label: "Nueva" },
  { value: "pendiente_pago", label: "Pendiente de pago" },
  { value: "en_progreso", label: "En progreso" },
  { value: "revision", label: "En revisión" },
  { value: "pendiente_final", label: "Pendiente final" },
  { value: "completada", label: "Completada" },
  { value: "cancelada", label: "Cancelada" },
];

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const order = useLiveQuery(() => (id ? db.orders.get(id) : undefined), [id]);
  const [status, setStatus] = useState("nueva");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    if (!order) return;
    const url = await generateTrackingUrl({
      id: order.id,
      clientName: order.clientName,
      serviceType: order.serviceType,
      status,
      description: orderDescription(order),
      price: order.price,
      dueDate: order.dueDate ?? "",
      paymentStatus: order.totalPaid >= order.price ? "paid" : order.totalPaid > 0 ? "partial" : "unpaid",
    });
    setTrackingUrl(window.location.origin + url);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-headline-md text-primary mb-2">Detalle de orden</h2>
        <p className="text-on-surface-variant text-sm">Orden: {id ?? "Sin ID"}</p>
      </div>

      {order && (
        <div className="bg-surface-container-lowest rounded-xl shadow-ambient p-6 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider mb-1">Cliente</p>
            <p className="font-medium text-on-surface">{order.clientName}</p>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider mb-1">Servicio</p>
            <p className="font-medium text-on-surface">{order.serviceType}</p>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider mb-1">Precio</p>
            <p className="font-medium text-on-surface">${order.price}</p>
          </div>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl shadow-ambient p-6 space-y-4">
        <h3 className="font-display text-headline-sm text-primary font-semibold">Generar enlace de seguimiento</h3>
        <div>
          <label className="mb-1 block text-sm font-semibold text-on-surface uppercase tracking-wider">Estado actual</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 rounded-lg border border-border-subtle bg-surface-studio px-3 text-sm focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-2"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          className="rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-on-secondary hover:bg-secondary/90 transition-colors"
        >
          Generar enlace de seguimiento
        </button>

        {trackingUrl && (
          <div className="mt-4">
            <label className="mb-1 block text-sm font-semibold text-on-surface uppercase tracking-wider">Enlace</label>
            <div className="flex gap-2">
              <input
                readOnly
                value={trackingUrl}
                className="h-10 flex-1 rounded-lg border border-border-subtle bg-surface-container-low px-3 text-sm"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(trackingUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="rounded-lg border border-border-subtle bg-surface-container-lowest px-3 text-sm font-medium hover:bg-surface-container transition-colors text-on-surface"
              >
                {copied ? "Copiado" : "Copiar enlace"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
