import Dexie, { type Table } from "dexie";
import type {
  ActivityLogEntry,
  Client,
  Config,
  MonthlyStats,
  Operator,
  Order,
  OrderAttachment,
  Subscription,
} from "@/lib/types";

export class DelegaDB extends Dexie {
  operators!: Table<Operator, string>;
  clients!: Table<Client, string>;
  subscriptions!: Table<Subscription, string>;
  orders!: Table<Order, string>;
  order_attachments!: Table<OrderAttachment, string>;
  stats!: Table<MonthlyStats, string>;
  activity_log!: Table<ActivityLogEntry, string>;
  config!: Table<Config, string>;

  constructor() {
    super("delega_app");
    this.version(1).stores({
      operators: "id, username",
      clients: "phone",
      subscriptions: "id, clientPhone",
      orders: "id, clientPhone, operatorId, status, subscriptionId",
      order_attachments: "id, orderId, name",
      stats: "id",
      activity_log: "id, operatorId, targetId",
      config: "id",
    });
    this.version(2).stores({
      clients: "phone, name",
      subscriptions: "id, clientPhone, status",
      orders: "id, clientPhone, operatorId, status, subscriptionId, coverageTipo",
      operators: "id, username",
      stats: "id",
      activity_log: "id, operatorId, targetId",
      config: "id",
    });
  }
}

export const db = new DelegaDB();
