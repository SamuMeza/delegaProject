// Permisos por orden (manual §4).
// Un operador solo edita sus propias órdenes; puede ver y comentar las ajenas.

export interface OrderPermissions {
  canRead: boolean;
  canWrite: boolean;
  canAddNote: boolean;
}

export function useOrderPermissions(
  orderOperatorId: string,
  currentOperatorId: string | null,
): OrderPermissions {
  if (!currentOperatorId) {
    return { canRead: false, canWrite: false, canAddNote: false };
  }
  const isOwn = orderOperatorId === currentOperatorId;
  return {
    canRead: true,
    canWrite: isOwn,
    canAddNote: true,
  };
}
