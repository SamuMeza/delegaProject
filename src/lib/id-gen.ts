import { db } from "@/lib/db/delegaDb";

export async function generateSubscriptionId(): Promise<string> {
  return db.transaction("rw", db.config, async () => {
    const config = await db.config.get("app");
    if (!config) throw new Error("Config not found");
    const next = config.subscriptionCounter + 1;
    await db.config.update("app", { subscriptionCounter: next });
    return `SUB-${String(next).padStart(3, "0")}`;
  });
}