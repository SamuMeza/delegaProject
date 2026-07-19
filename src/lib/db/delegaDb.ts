import Dexie, { type Table } from "dexie";
import type {
  ActivityLogEntry,
  Client,
  Config,
  MonthlyStats,
  Operator,
  Order,
  Subscription,
} from "@/lib/types";

// Base de datos local (IndexedDB vía Dexie). Manual técnico §2.1-§2.2.
// Fuente de verdad persistente del cliente. No hay backend.
export class DelegaDB extends Dexie {
  operators!: Table<Operator, string>;
  clients!: Table<Client, string>;
  subscriptions!: Table<Subscription, string>;
  orders!: Table<Order, string>;
  stats!: Table<MonthlyStats, string>;
  activity_log!: Table<ActivityLogEntry, string>;
  config!: Table<Config, string>;

  constructor() {
    super("delega_app");
    this.version(1).stores({
      operators: "id",
      clients: "phone",
      subscriptions: "id, clientPhone",
      orders: "id, clientPhone, operatorId, status, subscriptionId",
      stats: "id",
      activity_log: "id, operatorId, targetId",
      config: "id",
    });
  }
}

export const db = new DelegaDB();
