import { supabase } from "@/lib/supabase";
import type { CoverageTipo } from "@/lib/types";

export interface CupoResult {
  coverageTipo: CoverageTipo;
  subscriptionId: string | null;
  used: number;
  quota: number;
}

export async function checkCoverage(clientPhone: string): Promise<CupoResult> {
  const today = new Date().toISOString().split("T")[0];

  const { data: activeSub } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("client_phone", clientPhone)
    .eq("status", "activa")
    .gt("end_date", today)
    .maybeSingle();

  if (!activeSub) {
    return { coverageTipo: "estandar", subscriptionId: null, used: 0, quota: 0 };
  }

  const key = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const usedPerMonth = activeSub.used_per_month || {};
  const used = usedPerMonth[key] ?? 0;

  if (used < activeSub.monthly_quota) {
    return { coverageTipo: "cubierta_por_suscripcion", subscriptionId: activeSub.id, used, quota: activeSub.monthly_quota };
  }

  return { coverageTipo: "suelta_con_descuento", subscriptionId: activeSub.id, used, quota: activeSub.monthly_quota };
}

export async function consumeCupo(clientPhone: string, subscriptionId: string): Promise<void> {
  const key = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("used_per_month")
    .eq("id", subscriptionId)
    .maybeSingle();

  if (!sub) return;

  const usedPerMonth = { ...(sub.used_per_month || {}) };
  usedPerMonth[key] = (usedPerMonth[key] ?? 0) + 1;

  await supabase
    .from("subscriptions")
    .update({ used_per_month: usedPerMonth })
    .eq("id", subscriptionId);

  const { data: client } = await supabase
    .from("clients")
    .select("subscription")
    .eq("phone", clientPhone)
    .maybeSingle();

  if (client?.subscription) {
    const embeddingUsed = { ...(client.subscription.usedPerMonth || {}) };
    embeddingUsed[key] = (embeddingUsed[key] ?? 0) + 1;
    await supabase
      .from("clients")
      .update({ subscription: { ...client.subscription, usedPerMonth: embeddingUsed } })
      .eq("phone", clientPhone);
  }
}
