import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Download, Trash2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useOperators, useOrder, useAttachments } from "@/hooks/useDelegaDB";
import { useOrderPermissions } from "@/lib/orders/permissions";
import {
  addNote,
  cancelOrder,
  deleteAttachment,
  transitionOrder,
  uploadAttachment,
} from "@/lib/orders/service";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_CLASSES,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_CLASSES,
  SERVICE_TYPE_LABELS,
  getAvailableTransitions,
  isOverdue,
  operatorLabel,
  formatDueDate,
} from "@/lib/orders/ui";

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const operators = useOperators();
  const order = useOrder(id);
  const attachments = useAttachments(id);

  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (order === undefined) {
    return <main className="p-8 text-sm text-muted-foreground">Cargando orden…</main>;
  }
  if (!order) {
    return (
      <main className="p-8">
        <p className="text-sm text-muted-foreground">Orden no encontrada.</p>
        <Link to="/admin/ordenes" className="mt-2 inline-block text-primary hover:underline">
          Volver a órdenes
        </Link>
      </main>
    );
  }

  const perms = useOrderPermissions(order, session);
  const overdue = isOverdue(order);
  const transitions = getAvailableTransitions(order);

  async function handleTransition(to: typeof order.status) {
    if (!session) return;
    setBusy(true);
    setError(null);
    try {
      await transitionOrder(order.id, to, session.operatorId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transición inválida.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel() {
    if (!session) return;
    setBusy(true);
    setError(null);
    try {
      await cancelOrder(order.id, session.operatorId);
      setConfirmCancel(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cancelar.");
    } finally {
      setBusy(false);
    }
  }

  async function handleAddNote() {
    if (!session || !note.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await addNote(order.id, note.trim(), session.operatorId);
      setNote("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo agregar la nota.");
    } finally {
      setBusy(false);
    }
  }

  async function handleUpload() {
    if (!session || !file) return;
    setBusy(true);
    setError(null);
    try {
      await uploadAttachment(order.id, file, session.operatorId);
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir el archivo.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteAttachment(attachmentId: string) {
    if (!session) return;
    setBusy(true);
    setError(null);
    try {
      await deleteAttachment(attachmentId, session.operatorId);
      setConfirmDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar.");
    } finally {
      setBusy(false);
    }
  }

  function downloadAttachment(att: { name: string; blob: Blob }) {
    const url = URL.createObjectURL(att.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = att.name;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-4 sm:p-8">
      <button
        type="button"
        onClick={() => navigate("/admin/ordenes")}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a órdenes
      </button>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-xl font-semibold">{order.id}</h1>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_CLASSES[order.status]}`}>
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {SERVICE_TYPE_LABELS[order.serviceType]} · Cliente: {order.clientName} ({order.clientPhone})
          </p>
          <p className="text-sm text-muted-foreground">
            Operador asignado: {operatorLabel(operators, order.operatorId)}
            {!perms.canEdit && " · solo lectura"}
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {order.urgent && (
            <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-medium text-white">Urgente</span>
          )}
          {overdue && (
            <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-medium text-white">Vencida</span>
          )}
        </div>
      </header>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <section className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
        <div>
          <h2 className="text-sm font-medium">Pago (Pago Móvil)</h2>
          <div className="mt-1 flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PAYMENT_STATUS_CLASSES[order.paymentStatus]}`}>
              {PAYMENT_STATUS_LABELS[order.paymentStatus]}
            </span>
          </div>
          <p className="mt-2 text-sm">
            Precio: ${order.price} · Pagado: ${order.totalPaid}
            {order.paymentRef && ` · Ref: ${order.paymentRef}`}
          </p>
        </div>
        <div>
          <h2 className="text-sm font-medium">Fechas</h2>
          <p className="mt-1 text-sm">Creada: {formatDueDate(order.createdAt)}</p>
          <p className="text-sm">Límite: {formatDueDate(order.dueDate)}</p>
          {order.completedAt && <p className="text-sm">Completada: {formatDueDate(order.completedAt)}</p>}
        </div>
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="text-sm font-medium">Detalles del servicio</h2>
        <dl className="mt-2 grid grid-cols-1 gap-1 text-sm sm:grid-cols-2">
          {Object.entries(order.details).map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <dt className="capitalize text-muted-foreground">{k}:</dt>
              <dd>{String(v)}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="text-sm font-medium">Cambio de estado</h2>
        {perms.canChangeStatus ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {transitions.map((to) => (
              <Button key={to} size="sm" disabled={busy} onClick={() => handleTransition(to)}>
                Mover a {ORDER_STATUS_LABELS[to]}
              </Button>
            ))}
            {perms.canCancel && (
              confirmCancel ? (
                <span className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">¿Cancelar orden?</span>
                  <Button size="sm" variant="destructive" disabled={busy} onClick={handleCancel}>
                    Sí, cancelar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setConfirmCancel(false)}>
                    No
                  </Button>
                </span>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setConfirmCancel(true)}>
                  Cancelar orden
                </Button>
              )
            )}
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            Solo el operador asignado ({operatorLabel(operators, order.operatorId)}) puede cambiar el estado.
          </p>
        )}
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="text-sm font-medium">Historial de estados</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {order.statusHistory.map((h, i) => (
            <li key={i} className="text-muted-foreground">
              {ORDER_STATUS_LABELS[h.from]} → {ORDER_STATUS_LABELS[h.to]} ·{" "}
              {operatorLabel(operators, h.by)} · {new Date(h.at).toLocaleString("es-VE")}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="text-sm font-medium">Notas internas</h2>
        <ul className="mt-2 space-y-2">
          {order.notes.length === 0 ? (
            <li className="text-sm text-muted-foreground">Sin notas aún.</li>
          ) : (
            order.notes.map((n) => (
              <li key={n.id} className="rounded-md bg-muted/40 p-2 text-sm">
                <p>{n.text}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {operatorLabel(operators, n.author)} · {new Date(n.at).toLocaleString("es-VE")}
                </p>
              </li>
            ))
          )}
        </ul>
        <div className="mt-3 space-y-2">
          <Label htmlFor="note">Agregar nota (todas las notas son de solo lectura)</Label>
          <Textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            aria-label="Agregar nota interna"
          />
          <Button size="sm" disabled={busy || !note.trim()} onClick={handleAddNote}>
            <Send className="h-4 w-4" />
            Agregar nota
          </Button>
        </div>
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="text-sm font-medium">Adjuntos</h2>
        <ul className="mt-2 space-y-2">
          {attachments === undefined ? (
            <li className="text-sm text-muted-foreground">Cargando…</li>
          ) : attachments.length === 0 ? (
            <li className="text-sm text-muted-foreground">Sin adjuntos.</li>
          ) : (
            attachments.map((att) => (
              <li key={att.id} className="flex items-center justify-between gap-2 rounded-md bg-muted/40 p-2 text-sm">
                <span>
                  {att.name} <span className="text-xs text-muted-foreground">({(att.size / 1024).toFixed(0)} KB)</span>
                </span>
                <span className="flex items-center gap-1">
                  <Button size="sm" variant="outline" onClick={() => downloadAttachment(att)}>
                    <Download className="h-4 w-4" />
                    Descargar
                  </Button>
                  {perms.canDeleteAttachment &&
                    (confirmDelete === att.id ? (
                      <>
                        <Button size="sm" variant="destructive" disabled={busy} onClick={() => handleDeleteAttachment(att.id)}>
                          Sí
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setConfirmDelete(null)}>
                          No
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setConfirmDelete(att.id)}>
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </Button>
                    ))}
                </span>
              </li>
            ))
          )}
        </ul>
        {perms.canEdit && (
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <div className="flex-1">
              <Label htmlFor="file">Subir archivo (máx. 25 MB)</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                aria-label="Subir archivo adjunto"
              />
            </div>
            <Button size="sm" disabled={busy || !file} onClick={handleUpload}>
              Subir
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}
