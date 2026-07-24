import { db } from "@/lib/db/delegaDb";
import type { CoverageTipo } from "@/lib/types";

export interface CupoResult {
  coverageTipo: CoverageTipo;
  subscriptionId: string | null;
  used: number;
  quota: number;
}

export async function checkCoverage(clientPhone: string): Promise<CupoResult> {
  const activeSub = await db.subscriptions
    .where("clientPhone")
    .equals(clientPhone)
    .filter((s) => s.status === "activa" && s.endDate > new Date().toISOString().split("T")[0])
    .first();

  if (!activeSub) {
    return { coverageTipo: "estandar", subscriptionId: null, used: 0, quota: 0 };
  }

  const key = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const used = activeSub.usedPerMonth[key] ?? 0;

  if (used < activeSub.monthlyQuota) {
    return { coverageTipo: "cubierta_por_suscripcion", subscriptionId: activeSub.id, used, quota: activeSub.monthlyQuota };
  }

  return { coverageTipo: "suelta_con_descuento", subscriptionId: activeSub.id, used, quota: activeSub.monthlyQuota };
}

export async function consumeCupo(clientPhone: string, subscriptionId: string): Promise<void> {
  const key = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

  await db.transaction("rw", db.subscriptions, async () => {
    const sub = await db.subscriptions.get(subscriptionId);
    if (!sub) return;
    const usedPerMonth = { ...sub.usedPerMonth };
    usedPerMonth[key] = (usedPerMonth[key] ?? 0) + 1;
    await db.subscriptions.update(subscriptionId, { usedPerMonth });

    const subEmbedding = await db.clients.get(clientPhone).then((c) => c?.subscription);
    if (subEmbedding) {
      const embeddingUsed = { ...subEmbedding.usedPerMonth };
      embeddingUsed[key] = (embeddingUsed[key] ?? 0) + 1;
      await db.clients.update(clientPhone, { subscription: { ...subEmbedding, usedPerMonth: embeddingUsed } });
    }
  });
}