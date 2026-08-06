import { supabase } from "@/lib/supabase";
import type { ActionType } from "@/lib/types";

// Registra una entrada en activity_log (research R10, spec §FR todas).
// Centraliza el audit trail de acciones de orden y sesión.

export async function logActivity(params: {
  operatorId: string;
  action: ActionType;
  targetId: string;
  details: string;
}): Promise<void> {
  const { error } = await supabase.from("activity_log").insert({
    id: crypto.randomUUID(),
    operator_id: params.operatorId,
    action: params.action,
    target_id: params.targetId,
    details: params.details.slice(0, 200),
    timestamp: new Date().toISOString(),
  });

  if (error) {
    console.error("Error logActivity:", error);
  }
}
