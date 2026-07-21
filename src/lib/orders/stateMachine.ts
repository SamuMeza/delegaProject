import type { OrderStatus } from "@/lib/types";

// Máquina de estados de la orden (research R6, spec §FR-005).
// Pipeline: nueva → pendiente_pago → en_progreso → revision → pendiente_final → completada.
// cancelada es terminal desde cualquier estado activo.

export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  nueva: ["pendiente_pago"],
  pendiente_pago: ["en_progreso", "cancelada"],
  en_progreso: ["revision", "cancelada"],
  revision: ["pendiente_final", "en_progreso"],
  pendiente_final: ["completada"],
  completada: [],
  cancelada: [],
};

export const TERMINAL_STATUSES: OrderStatus[] = ["completada", "cancelada"];

export function isTransitionValid(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function canTransitionFrom(from: OrderStatus): OrderStatus[] {
  return ALLOWED_TRANSITIONS[from] ?? [];
}

// Estados desde los cuales se puede cancelar (cualquier estado activo).
export function canCancel(from: OrderStatus): boolean {
  return from !== "completada" && from !== "cancelada";
}
