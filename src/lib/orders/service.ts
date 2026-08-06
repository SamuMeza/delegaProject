import { supabase } from "@/lib/supabase";
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
// Migrado de Dexie a Supabase — operaciones secuenciales (sin transacciones).

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
  const { data: config } = await supabase
    .from("config")
    .select("service_operator_map, order_counter")
    .eq("id", "app")
    .maybeSingle();

  if (!config) throw new Error("Config no inicializada");
  if (!input.serviceType) throw new Error("serviceType es obligatorio");

  const map = config.service_operator_map as Record<string, string>;
  const assigned = map[input.serviceType] ?? "op_001";
  const usedFallback = !map[input.serviceType];

  // Incrementar contador
  const next = (config.order_counter ?? 0) + 1;
  const orderId = formatOrdinal(next);

  const { error: counterError } = await supabase
    .from("config")
    .update({ order_counter: next, updated_at: new Date().toISOString() })
    .eq("id", "app");
  if (counterError) {
    console.error("[createOrder] Error actualizando counter:", counterError.code, counterError.message);
  }

  const now = new Date().toISOString();
  const totalPaid = input.paidAmount ?? 0;

  // Auto-crear o actualizar cliente ANTES de insertar la orden (foreign key constraint)
  const { data: existingClient } = await supabase
    .from("clients")
    .select("phone, total_orders, total_spent, history")
    .eq("phone", input.clientPhone)
    .maybeSingle();

  if (existingClient) {
    const history = Array.isArray(existingClient.history)
      ? existingClient.history
      : [];
    await supabase
      .from("clients")
      .update({
        total_orders: existingClient.total_orders + 1,
        total_spent: existingClient.total_spent + input.price,
        history: [...history, orderId],
      })
      .eq("phone", input.clientPhone);
  } else {
    await supabase.from("clients").insert({
      phone: input.clientPhone,
      name: input.clientName,
      total_orders: 1,
      total_spent: input.price,
      subscription: null,
      history: [orderId],
    });
    await logActivity({
      operatorId,
      action: "create_client",
      targetId: input.clientPhone,
      details: `Cliente creado automáticamente desde orden ${orderId}`,
    });
  }

  const order: Record<string, any> = {
    id: orderId,
    client_phone: input.clientPhone,
    client_name: input.clientName,
    service_type: input.serviceType,
    operator_id: assigned,
    details: input.details,
    has_material: null,
    price: input.price,
    paid_amount: input.paidAmount ?? 0,
    total_paid: totalPaid,
    payment_ref: input.paymentRef ?? "",
    status: "nueva",
    urgent: input.urgent ?? false,
    payment_status: derivePaymentStatus({ totalPaid, price: input.price }),
    created_at: now,
    due_date: input.dueDate ?? null,
    completed_at: null,
    notes: [],
    status_history: [{ from: "nueva", to: "nueva", by: operatorId, at: Date.now() }],
    subscription_id: null,
  };

  const { error: insertError } = await supabase.from("orders").insert(order);
  if (insertError) {
    console.error("[createOrder] Error Supabase:", insertError.code, insertError.message, insertError.details);
    throw new Error(`Error creando orden: ${insertError.message}`);
  }

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

  window.dispatchEvent(
    new CustomEvent("delega:order-created", {
      detail: { orderId, clientName: input.clientName },
    }),
  );

  return orderId;
}

// Actualiza campos editables de una orden (precio, detalles, fecha límite, etc.).
export async function updateOrder(
  orderId: string,
  patch: Partial<Order>,
  operatorId: string,
): Promise<void> {
  const { data: existing } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (!existing) throw new Error("Orden no encontrada");

  const updatePatch: Record<string, any> = {};
  if (patch.price !== undefined) updatePatch.price = patch.price;
  if (patch.details !== undefined) updatePatch.details = patch.details;
  if (patch.dueDate !== undefined) updatePatch.due_date = patch.dueDate;
  if (patch.paidAmount !== undefined) updatePatch.paid_amount = patch.paidAmount;
  if (patch.paymentRef !== undefined) updatePatch.payment_ref = patch.paymentRef;
  if (patch.urgent !== undefined) updatePatch.urgent = patch.urgent;
  if (patch.notes !== undefined) updatePatch.notes = patch.notes;

  await supabase
    .from("orders")
    .update(updatePatch)
    .eq("id", orderId);

  await logActivity({
    operatorId,
    action: "update_order",
    targetId: orderId,
    details: `Actualizó orden ${orderId}`,
  });
}

// Transiciona el estado validando ALLOWED_TRANSITIONS. Rechaza si inválido.
export async function transitionOrder(
  orderId: string,
  to: OrderStatus,
  operatorId: string,
): Promise<void> {
  const { data: order } = await supabase
    .from("orders")
    .select("status, status_history, completed_at")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) throw new Error("Orden no encontrada");
  if (!isTransitionValid(order.status, to)) {
    throw new Error(`Transición inválida: ${order.status} → ${to}`);
  }

  const history = [
    ...(Array.isArray(order.status_history) ? order.status_history : []),
    { from: order.status, to, by: operatorId, at: Date.now() },
  ];

  const patch: Record<string, any> = {
    status: to,
    status_history: history,
  };
  if (to === "completada") {
    patch.completed_at = new Date().toISOString();
  }

  await supabase
    .from("orders")
    .update(patch)
    .eq("id", orderId);

  await logActivity({
    operatorId,
    action: "change_status",
    targetId: orderId,
    details: `${order.status} → ${to}`,
  });
}

// Cancela una orden (solo desde estado activo).
export async function cancelOrder(
  orderId: string,
  operatorId: string,
): Promise<void> {
  const { data: order } = await supabase
    .from("orders")
    .select("status, status_history")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) throw new Error("Orden no encontrada");
  if (!canCancel(order.status)) {
    throw new Error(`No se puede cancelar desde ${order.status}`);
  }

  const history = [
    ...(Array.isArray(order.status_history) ? order.status_history : []),
    { from: order.status, to: "cancelada", by: operatorId, at: Date.now() },
  ];

  await supabase
    .from("orders")
    .update({ status: "cancelada", status_history: history })
    .eq("id", orderId);

  await logActivity({
    operatorId,
    action: "change_status",
    targetId: orderId,
    details: `${order.status} → cancelada`,
  });
}

// Agrega una nota (append-only, con autor y timestamp).
export async function addNote(
  orderId: string,
  text: string,
  author: string,
): Promise<void> {
  const { data: order } = await supabase
    .from("orders")
    .select("notes")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) throw new Error("Orden no encontrada");

  const note = {
    id: crypto.randomUUID(),
    text,
    author,
    at: new Date().toISOString(),
  };

  const notes = Array.isArray(order.notes) ? order.notes : [];

  await supabase
    .from("orders")
    .update({ notes: [...notes, note] })
    .eq("id", orderId);

  await logActivity({
    operatorId: author,
    action: "add_note",
    targetId: orderId,
    details: `Nota en ${orderId}`,
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

  const attachment = {
    id: crypto.randomUUID(),
    order_id: orderId,
    name: file.name,
    mime: file.type || "application/octet-stream",
    size: file.size,
    author,
    uploaded_at: new Date().toISOString(),
  };

  await supabase.from("order_attachments").insert(attachment);

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
  const { data: att } = await supabase
    .from("order_attachments")
    .select("order_id, name")
    .eq("id", attachmentId)
    .maybeSingle();

  if (!att) return;

  await supabase
    .from("order_attachments")
    .delete()
    .eq("id", attachmentId);

  await logActivity({
    operatorId,
    action: "delete_attachment",
    targetId: att.order_id,
    details: `Eliminó adjunto "${att.name}"`,
  });
}

export async function listOrders(filter?: {
  status?: OrderStatus;
  q?: string;
}): Promise<Order[]> {
  let query = supabase.from("orders").select("*");

  if (filter?.status) {
    query = query.eq("status", filter.status);
  }

  const { data } = await query;

  let orders = (data || []).map((o: any) => ({
    id: o.id,
    clientPhone: o.client_phone,
    clientName: o.client_name,
    serviceType: o.service_type,
    operatorId: o.operator_id,
    details: o.details,
    hasMaterial: o.has_material,
    price: Number(o.price),
    paidAmount: Number(o.paid_amount),
    totalPaid: Number(o.total_paid),
    paymentRef: o.payment_ref,
    status: o.status,
    urgent: o.urgent,
    paymentStatus: o.payment_status,
    statusHistory: o.status_history,
    createdAt: o.created_at,
    dueDate: o.due_date,
    completedAt: o.completed_at,
    notes: o.notes,
    subscriptionId: o.subscription_id,
    coverageTipo: o.coverage_tipo,
  }));

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
  const { data: o } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!o) return undefined;

  return {
    id: o.id,
    clientPhone: o.client_phone,
    clientName: o.client_name,
    serviceType: o.service_type,
    operatorId: o.operator_id,
    details: o.details,
    hasMaterial: o.has_material,
    price: Number(o.price),
    paidAmount: Number(o.paid_amount),
    totalPaid: Number(o.total_paid),
    paymentRef: o.payment_ref,
    status: o.status,
    urgent: o.urgent,
    paymentStatus: o.payment_status,
    statusHistory: o.status_history,
    createdAt: o.created_at,
    dueDate: o.due_date,
    completedAt: o.completed_at,
    notes: o.notes,
    subscriptionId: o.subscription_id,
    coverageTipo: o.coverage_tipo,
  };
}

export async function listAttachments(
  orderId: string,
): Promise<OrderAttachment[]> {
  const { data } = await supabase
    .from("order_attachments")
    .select("*")
    .eq("order_id", orderId);

  const mapped = (data || []).map((a: any) => ({
    id: a.id,
    orderId: a.order_id,
    name: a.name,
    mime: a.mime,
    size: a.size,
    blob: new Blob([]),
    author: a.author,
    uploadedAt: a.uploaded_at,
  }));

  return mapped.sort((a, b) => a.uploadedAt.localeCompare(b.uploadedAt));
}

export { ATTACHMENT_LIMIT_BYTES };
