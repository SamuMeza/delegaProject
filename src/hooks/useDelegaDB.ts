import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/delegaDb";
import type { Config, Operator } from "@/lib/types";

// Abstracción reactiva sobre Dexie (spec §FR-3, research.md §R6).
// Las pantallas usan estos helpers en lugar de tocar Dexie directamente.

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
    upsertOperator,
    updateConfig,
  };
}
