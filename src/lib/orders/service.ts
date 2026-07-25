import { db } from "@/lib/db/delegaDb";
import { logActivity } from "@/lib/db/activity";
import { isTransitionValid, canCancel } from "@/lib/orders/stateMachine";
import { derivePaymentStatus } from "@/lib/orders/permissions";
import type {
  Order,
  OrderAttachment,
  OrderDetails,
  OrderStatus,
  ServiceType,
} from "@/lib/types";

// Capa de servicio de órdenes (contracts §C2, research R10).
// La UI nunca toca `db` directo para órdenes; usa estos helpers.

const ATTACHMENT_LIMIT_BYTES = 25 * 1024 * 1024; // ~25 MB (edge case spec)

export interface OrderCreateInput {
  clientName: string;
  clientPhone: string;
  serviceType: ServiceType;
  details: OrderDetails;
  dueDate?: string | null;
  urgent?: boolean;
  price: number;
  paidAmount?: number;
  paymentRef?: string;
}

function formatOrdinal(n: number): string {
  return `ORD-${String(n).padStart(3, "0")}`;
}

// Crea una orden asignando operador vía serviceOperatorMap (fallback op_001).
export async function createOrder(
  input: OrderCreateInput,
  operatorId: string,
): Promise<string> {
  const config = await db.config.get("app");
  if (!config) throw new Error("Config no inicializada");
  if (!input.serviceType) throw new Error("serviceType es obligatorio");

  const assigned = config.serviceOperatorMap[input.serviceType] ?? "op_001";
  const usedFallback = !config.serviceOperatorMap[input.serviceType];
  const hasValidFallback = !usedFallback || (config.serviceOperatorMap[input.serviceType] ?? "op_001") === "op_001";

  if (usedFallback && !hasValidFallback) {
    throw new Error(`ServiceType '${input.serviceType}' sin mapeo en Config; operativos afectados`);
  }

  let orderId: string;
  await db.transaction("rw", db.orders, db.config, db.activity_log, async () => {
    const cfg = await db.config.get("app");
    if (!cfg) throw new Error("Config no inicializada");
    const next = (cfg.orderCounter ?? 0) + 1;
    await db.config.update("app", { orderCounter: next, updatedAt: Date.now() });
    orderId = formatOrdinal(next);

    const now = new Date().toISOString();
    const totalPaid = input.paidAmount ?? 0;
    const order: Order = {
      id: orderId,
      clientPhone: input.clientPhone,
      clientName: input.clientName,
      serviceType: input.serviceType,
      operatorId: assigned,
      details: input.details,
      hasMaterial: null,
      price: input.price,
      paidAmount: input.paidAmount ?? 0,
      totalPaid,
      paymentRef: input.paymentRef ?? "",
      status: "nueva",
      urgent: input.urgent ?? false,
      paymentStatus: derivePaymentStatus({ totalPaid, price: input.price }),
      createdAt: now,
      dueDate: input.dueDate ?? null,
      completedAt: null,
      notes: [],
      statusHistory: [{ from: "nueva", to: "nueva", by: operatorId, at: Date.now() }],
      subscriptionId: null,
    };
    await db.orders.add(order);

    await logActivity({
      operatorId,
      action: "create_order",
      targetId: orderId,
      details: `Creó orden ${orderId} (${input.serviceType}) → ${assigned}`,
    });
    if (usedFallback) {
      await logActivity({
        operatorId,
        action: "create_order",
        targetId: orderId,
        details: `Asignación por defecto (fallback op_001): serviceType sin mapa`,
      });
    }
  });

  window.dispatchEvent(
    new CustomEvent("delega:order-created", {
      detail: { orderId: orderId!, clientName: input.clientName },
    }),
  );

  return orderId!;
}

// Actualiza campos editables de una orden (precio, detalles, fecha límite, etc.).
export async function updateOrder(
  orderId: string,
  patch: Partial<Order>,
  operatorId: string,
): Promise<void> {
  await db.transaction("rw", db.orders, db.activity_log, async () => {
    const order = await db.orders.get(orderId);
    if (!order) throw new Error("Orden no encontrada");
    const updated = { ...order, ...patch };
    await db.orders.update(orderId, updated);
    await logActivity({
      operatorId,
      action: "update_order",
      targetId: orderId,
      details: `Actualizó orden ${orderId}`,
    });
  });
}

// Transiciona el estado validando ALLOWED_TRANSITIONS. Rechaza si inválido.
export async function transitionOrder(
  orderId: string,
  to: OrderStatus,
  operatorId: string,
): Promise<void> {
  await db.transaction("rw", db.orders, db.activity_log, async () => {
    const order = await db.orders.get(orderId);
    if (!order) throw new Error("Orden no encontrada");
    if (!isTransitionValid(order.status, to)) {
      throw new Error(`Transición inválida: ${order.status} → ${to}`);
    }
    const history = [
      ...order.statusHistory,
      { from: order.status, to, by: operatorId, at: Date.now() },
    ];
    const patch: Partial<Order> = {
      status: to,
      statusHistory: history,
      completedAt:
        to === "completada" ? new Date().toISOString() : order.completedAt,
    };
    await db.orders.update(orderId, patch);
    await logActivity({
      operatorId,
      action: "change_status",
      targetId: orderId,
      details: `${order.status} → ${to}`,
    });
  });
}

// Cancela una orden (solo desde estado activo).
export async function cancelOrder(
  orderId: string,
  operatorId: string,
): Promise<void> {
  await db.transaction("rw", db.orders, db.activity_log, async () => {
    const order = await db.orders.get(orderId);
    if (!order) throw new Error("Orden no encontrada");
    if (!canCancel(order.status)) {
      throw new Error(`No se puede cancelar desde ${order.status}`);
    }
    await db.orders.update(orderId, {
      status: "cancelada",
      statusHistory: [
        ...order.statusHistory,
        { from: order.status, to: "cancelada", by: operatorId, at: Date.now() },
      ],
    });
    await logActivity({
      operatorId,
      action: "change_status",
      targetId: orderId,
      details: `${order.status} → cancelada`,
    });
  });
}

// Agrega una nota (append-only, con autor y timestamp).
export async function addNote(
  orderId: string,
  text: string,
  author: string,
): Promise<void> {
  await db.transaction("rw", db.orders, db.activity_log, async () => {
    const order = await db.orders.get(orderId);
    if (!order) throw new Error("Orden no encontrada");
    const note = {
      id: crypto.randomUUID(),
      text,
      author,
      at: new Date().toISOString(),
    };
    await db.orders.update(orderId, { notes: [...order.notes, note] });
    await logActivity({
      operatorId: author,
      action: "add_note",
      targetId: orderId,
      details: `Nota en ${orderId}`,
    });
  });
}

// Sube un adjunto binario a order_attachments (límite ~25 MB).
export async function uploadAttachment(
  orderId: string,
  file: File,
  author: string,
): Promise<void> {
  if (file.size > ATTACHMENT_LIMIT_BYTES) {
    throw new Error(
      `El archivo excede el límite de ${Math.round(ATTACHMENT_LIMIT_BYTES / 1024 / 1024)} MB`,
    );
  }
  const attachment: OrderAttachment = {
    id: crypto.randomUUID(),
    orderId,
    name: file.name,
    mime: file.type || "application/octet-stream",
    size: file.size,
    blob: file,
    author,
    uploadedAt: new Date().toISOString(),
  };
  await db.order_attachments.add(attachment);
  await logActivity({
    operatorId: author,
    action: "upload_file",
    targetId: orderId,
    details: `Subió adjunto "${file.name}" a ${orderId}`,
  });
}

export async function deleteAttachment(
  attachmentId: string,
  operatorId: string,
): Promise<void> {
  const att = await db.order_attachments.get(attachmentId);
  if (!att) return;
  await db.order_attachments.delete(attachmentId);
  await logActivity({
    operatorId,
    action: "delete_attachment",
    targetId: att.orderId,
    details: `Eliminó adjunto "${att.name}"`,
  });
}

export async function listOrders(filter?: {
  status?: OrderStatus;
  q?: string;
}): Promise<Order[]> {
  let orders = await db.orders.toArray();
  if (filter?.status) orders = orders.filter((o) => o.status === filter.status);
  if (filter?.q) {
    const q = filter.q.toLowerCase();
    orders = orders.filter(
      (o) =>
        o.clientName.toLowerCase().includes(q) ||
        o.clientPhone.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q),
    );
  }
  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getOrder(id: string): Promise<Order | undefined> {
  return db.orders.get(id);
}

export async function listAttachments(
  orderId: string,
): Promise<OrderAttachment[]> {
  const atts = await db.order_attachments.where("orderId").equals(orderId).toArray();
  return atts.sort((a, b) => a.uploadedAt.localeCompare(b.uploadedAt));
}

export { ATTACHMENT_LIMIT_BYTES };
