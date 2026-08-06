import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, Send, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrder, useOperators } from "@/hooks/useDatabase";

import { useAuth } from "@/hooks/useAuth";
import { useOrderPermissions } from "@/lib/orders/permissions";
import { transitionOrder, addNote } from "@/lib/orders/service";
import { generateTrackingUrl } from "@/lib/tracking";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_CLASSES,
  SERVICE_TYPE_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_CLASSES,
  getAvailableTransitions,
  formatDueDate,
  operatorLabel,
  isOverdue,
} from "@/lib/orders/ui";
import type { OrderStatus } from "@/lib/types";

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const order = useOrder(id);
  const operators = useOperators();
  const perms = useOrderPermissions(order, session);

  const [noteText, setNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [trackingUrl, setTrackingUrl] = useState("");
  const [trackingCopied, setTrackingCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!order) {
    return (
      <div className="p-8 text-sm text-on-surface-variant">
        {id ? "Cargando orden..." : "Orden no encontrada"}
      </div>
    );
  }

  const availableTransitions = getAvailableTransitions(order);
  const overdue = isOverdue(order);
  const paymentStatus =
    order.totalPaid >= order.price ? "paid" : order.totalPaid > 0 ? "partial" : "unpaid";

  async function handleStatusChange(to: OrderStatus) {
    if (!session) return;
    setError(null);
    setChangingStatus(true);
    try {
      await transitionOrder(order!.id, to, session.operatorId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cambiar estado");
    } finally {
      setChangingStatus(false);
    }
  }

  async function handleAddNote() {
    if (!noteText.trim() || !session) return;
    setAddingNote(true);
    try {
      await addNote(order!.id, noteText.trim(), session.operatorId);
      setNoteText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al agregar nota");
    } finally {
      setAddingNote(false);
    }
  }

  async function handleGenerateTracking() {
    const url = await generateTrackingUrl({
      id: order!.id,
      clientName: order!.clientName,
      serviceType: order!.serviceType,
      status: order!.status,
      description: (() => {
        const d = order!.details;
        if ("tema" in d && typeof d.tema === "string") return d.tema;
        if ("proposito" in d && typeof d.proposito === "string") return d.proposito;
        return "";
      })(),
      price: order!.price,
      dueDate: order!.dueDate ?? "",
      paymentStatus,
    });
    setTrackingUrl(window.location.origin + url);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate("/admin/ordenes")}
        className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a órdenes
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-headline-md text-primary mb-1">
            Orden {order.id}
          </h2>
          <p className="text-sm text-on-surface-variant">
            Creada {new Date(order.createdAt).toLocaleDateString("es-VE", { day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {order.urgent && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-urgency-alert text-white">
              Urgente
            </span>
          )}
          {overdue && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-error text-on-error">
              Vencida
            </span>
          )}
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${ORDER_STATUS_CLASSES[order.status]}`}>
            {ORDER_STATUS_LABELS[order.status]}
          </span>
        </div>
      </div>

      {/* Info grid */}
      <Card className="p-6">
        <CardContent className="px-0">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider mb-1">Cliente</p>
              <p className="font-medium text-on-surface">{order.clientName}</p>
              <p className="text-sm text-on-surface-variant">{order.clientPhone}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider mb-1">Servicio</p>
              <p className="font-medium text-on-surface">{SERVICE_TYPE_LABELS[order.serviceType]}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider mb-1">Operador asignado</p>
              <p className="font-medium text-on-surface">{operatorLabel(operators, order.operatorId)}</p>
              <p className="text-xs text-on-surface-variant">{order.operatorId}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider mb-1">Precio</p>
              <p className="font-medium text-on-surface">${order.price}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider mb-1">Pago</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${PAYMENT_STATUS_CLASSES[paymentStatus]}`}>
                {PAYMENT_STATUS_LABELS[paymentStatus]}
              </span>
              {order.paidAmount > 0 && (
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Bs {order.paidAmount.toLocaleString()} — ref: {order.paymentRef || "—"}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider mb-1">Fecha límite</p>
              <p className="font-medium text-on-surface">{formatDueDate(order.dueDate)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detalles del servicio */}
      <Card className="p-6">
        <CardHeader className="px-0 pb-4">
          <CardTitle className="text-headline-sm text-primary font-display">Detalles del servicio</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <dl className="grid gap-2 text-sm">
            {Object.entries(order.details).map(([key, val]) => (
              <div key={key} className="flex gap-2">
                <dt className="text-on-surface-variant capitalize min-w-32">{key.replace(/([A-Z])/g, " $1").toLowerCase()}:</dt>
                <dd className="font-medium text-on-surface">{String(val)}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      {/* Cambio de estado */}
      <Card className="p-6">
        <CardHeader className="px-0 pb-4">
          <CardTitle className="text-headline-sm text-primary font-display">Cambiar estado</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {!perms.canChangeStatus ? (
            <p className="text-sm text-on-surface-variant">
              Solo el operador asignado ({operatorLabel(operators, order.operatorId)}) puede cambiar el estado de esta orden.
            </p>
          ) : availableTransitions.length === 0 ? (
            <p className="text-sm text-on-surface-variant">
              Esta orden está en estado terminal ({ORDER_STATUS_LABELS[order.status]}) y no puede cambiar.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableTransitions.map((to) => (
                <Button
                  key={to}
                  variant={to === "cancelada" ? "outline" : "default"}
                  disabled={changingStatus}
                  onClick={() => handleStatusChange(to)}
                  className={to === "cancelada" ? "border-error text-error hover:bg-error/10" : ""}
                >
                  {changingStatus ? "Guardando..." : `→ ${ORDER_STATUS_LABELS[to]}`}
                </Button>
              ))}
            </div>
          )}
          {error && (
            <p className="mt-2 text-sm text-error">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Notas */}
      <Card className="p-6">
        <CardHeader className="px-0 pb-4">
          <CardTitle className="text-headline-sm text-primary font-display">Notas</CardTitle>
        </CardHeader>
        <CardContent className="px-0 space-y-4">
          {order.notes.length === 0 ? (
            <p className="text-sm text-on-surface-variant">Sin notas aún.</p>
          ) : (
            <div className="space-y-3">
              {order.notes.map((note, i) => (
                <div key={i} className="rounded-lg bg-surface-container p-3 text-sm">
                  <p className="text-on-surface">{note.text}</p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    {operatorLabel(operators, note.author)} · {new Date(note.at).toLocaleString("es-VE")}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Agregar nota — cualquier operador puede */}
          <div className="space-y-2">
            <Textarea
              placeholder="Agregar una nota..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={3}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddNote}
              disabled={!noteText.trim() || addingNote}
            >
              <Send className="h-4 w-4" />
              {addingNote ? "Guardando..." : "Agregar nota"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enlace de seguimiento (colapsable) */}
      <Card className="p-6">
        <button
          type="button"
          onClick={() => setShowTracking((v) => !v)}
          className="w-full flex items-center justify-between text-left"
        >
          <span className="flex items-center gap-2 font-display text-headline-sm text-primary font-semibold">
            <Link2 className="h-4 w-4" />
            Enlace de seguimiento para el cliente
          </span>
          <ChevronDown className={`h-4 w-4 text-on-surface-variant transition-transform ${showTracking ? "rotate-180" : ""}`} />
        </button>

        {showTracking && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-on-surface-variant">
              Genera un enlace público para que el cliente pueda ver el estado actual de su orden sin acceder al panel.
            </p>
            <Button type="button" variant="outline" onClick={handleGenerateTracking}>
              Generar enlace
            </Button>
            {trackingUrl && (
              <div className="flex gap-2">
                <input
                  readOnly
                  value={trackingUrl}
                  className="h-10 flex-1 rounded-lg border border-border-subtle bg-surface-container-low px-3 text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(trackingUrl);
                    setTrackingCopied(true);
                    setTimeout(() => setTrackingCopied(false), 2000);
                  }}
                >
                  {trackingCopied ? "¡Copiado!" : "Copiar"}
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
