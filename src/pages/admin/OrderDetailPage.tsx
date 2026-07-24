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
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Detalle de orden</h1>
      <p className="mb-4 text-muted-foreground">Orden: {id ?? "Sin ID"}</p>

      {order && (
        <div className="mb-8 grid gap-4 rounded-xl border bg-card p-6 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Cliente</p>
            <p className="font-medium">{order.clientName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Servicio</p>
            <p className="font-medium">{order.serviceType}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Precio</p>
            <p className="font-medium">${order.price}</p>
          </div>
        </div>
      )}

      <div className="mb-8 space-y-4 rounded-xl border bg-card p-6">
        <h2 className="font-semibold">Generar enlace de seguimiento</h2>
        <div>
          <label className="mb-1 block text-sm font-medium">Estado actual</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          className="rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-white hover:bg-secondary/90"
        >
          Generar enlace de seguimiento
        </button>

        {trackingUrl && (
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium">Enlace</label>
            <div className="flex gap-2">
              <input
                readOnly
                value={trackingUrl}
                className="h-9 flex-1 rounded-md border border-input bg-muted px-3 text-sm"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(trackingUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="rounded-md border border-input bg-white px-3 text-sm font-medium hover:bg-surface"
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