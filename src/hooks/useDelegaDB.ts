import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/delegaDb";
import type { Config, Operator, Order, OrderAttachment, OrderStatus } from "@/lib/types";

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

export function useOrders(filter?: {
  status?: OrderStatus;
  q?: string;
}): Order[] | undefined {
  return useLiveQuery(async () => {
    let orders = await db.orders.toArray();
    if (filter?.status) orders = orders.filter((o) => o.status === filter.status);
    if (filter?.q) {
      const q = filter.q.toLowerCase();
      orders = orders.filter(
        (o) =>
          o.clientName.toLowerCase().includes(q) ||
          o.clientPhone.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q),
      );
    }
    return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [filter?.status, filter?.q]);
}

export function useOrder(id: string | undefined): Order | undefined {
  return useLiveQuery(
    () => (id ? db.orders.get(id) : undefined),
    [id],
  );
}

export function useAttachments(orderId: string | undefined): OrderAttachment[] | undefined {
  return useLiveQuery(
    () =>
      orderId
        ? db.order_attachments.where("orderId").equals(orderId).toArray()
        : [],
    [orderId],
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
    useOrders,
    useOrder,
    useAttachments,
    upsertOperator,
    updateConfig,
  };
}
