import { db } from "@/lib/db/delegaDb";
import type { ActionType } from "@/lib/types";

// Registra una entrada en activity_log (research R10, spec §FR todas).
// Centraliza el audit trail de acciones de orden y sesión.

export async function logActivity(params: {
  operatorId: string;
  action: ActionType;
  targetId: string;
  details: string;
}): Promise<void> {
  await db.activity_log.add({
    id: crypto.randomUUID(),
    operatorId: params.operatorId,
    action: params.action,
    targetId: params.targetId,
    details: params.details.slice(0, 200),
    timestamp: new Date().toISOString(),
  });
}
