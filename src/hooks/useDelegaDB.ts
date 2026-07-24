import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/delegaDb";
import type { Client, Config, Operator, Subscription } from "@/lib/types";

export function useOperators(): Operator[] | undefined {
  return useLiveQuery(() => db.operators.toArray(), []);
}

export function useOperator(username: string | undefined): Operator | undefined {
  return useLiveQuery(
    () => (username ? db.operators.where("username").equals(username).first() : undefined),
    [username],
  );
}

export function useConfig(): Config | undefined {
  return useLiveQuery(() => db.config.get("app"), []);
}

export function useClients(): Client[] | undefined {
  return useLiveQuery(() => db.clients.toArray(), []);
}

export function useClient(phone: string | undefined): Client | undefined {
  return useLiveQuery(
    () => (phone ? db.clients.get(phone) : undefined),
    [phone],
  );
}

export function useSubscriptions(): Subscription[] | undefined {
  return useLiveQuery(() => db.subscriptions.toArray(), []);
}

export function useClientSubscriptions(phone: string | undefined): Subscription[] | undefined {
  return useLiveQuery(
    () => (phone ? db.subscriptions.where("clientPhone").equals(phone).toArray() : undefined),
    [phone],
  );
}

export async function upsertOperator(op: Operator): Promise<void> {
  await db.operators.put(op);
}

export async function updateConfig(patch: Partial<Config>): Promise<void> {
  await db.config.update("app", { ...patch, updatedAt: Date.now() });
}

export function useDelegaDB() {
  return {
    db,
    useOperators,
    useOperator,
    useConfig,
    useClients,
    useClient,
    useSubscriptions,
    useClientSubscriptions,
    upsertOperator,
    updateConfig,
  };
}
