import type { Order, PaymentStatus, Session } from "@/lib/types";
import { canCancel } from "@/lib/orders/stateMachine";

// Contrato de permisos de orden (contracts §C3, spec §FR-007/FR-008).
// canView siempre true (todos ven todas las órdenes).
// canEdit/canChangeStatus/canDeleteAttachment solo para el operador asignado.
// canAddNote siempre true (cualquier operador puede comentar).

export interface OrderPermissions {
  canView: true;
  canEdit: boolean;
  canChangeStatus: boolean;
  canAddNote: true;
  canDeleteAttachment: boolean;
  canCancel: boolean;
}

export function useOrderPermissions(
  order: Order | undefined,
  session: Session | null,
): OrderPermissions {
  const isOwner = !!order && !!session && session.operatorId === order.operatorId;
  return {
    canView: true,
    canEdit: isOwner,
    canChangeStatus: isOwner,
    canAddNote: true,
    canDeleteAttachment: isOwner,
    canCancel: isOwner && !!order && canCancel(order.status),
  };
}

// Derivación de estado de pago (contracts §C5, research R9, spec §FR-018).
export function derivePaymentStatus(order: {
  totalPaid: number;
  price: number;
}): PaymentStatus {
  if (order.totalPaid >= order.price) return "paid";
  if (order.totalPaid > 0) return "partial";
  return "unpaid";
}
