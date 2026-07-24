# DB Contract: Suscripciones y Clientes

**Date**: 2026-07-24 | **Feature**: Suscripciones y Clientes

## Dexie Store Definition

Versión actual: **1** → Versión destino: **2**

```typescript
// src/lib/db/delegaDb.ts — schema v2
export class DelegaDB extends Dexie {
  // (tablas existentes sin cambios)
  operators!: Table<Operator, string>;
  orders!: Table<Order, string>;
  stats!: Table<MonthlyStats, string>;
  activity_log!: Table<ActivityLogEntry, string>;
  config!: Table<Config, string>;

  // tablas de este feature
  clients!: Table<Client, string>;
  subscriptions!: Table<Subscription, string>;

  constructor() {
    super("delega_app");
    this.version(1).stores({
      operators: "id, username",
      clients: "phone",
      subscriptions: "id, clientPhone",
      orders: "id, clientPhone, operatorId, status, subscriptionId",
      stats: "id",
      activity_log: "id, operatorId, targetId",
      config: "id",
    });
    // v2: añade índice name a clients para búsqueda
    this.version(2).stores({
      clients: "phone, name",           // + índice name
      subscriptions: "id, clientPhone, status", // + índice status
      orders: "id, clientPhone, operatorId, status, subscriptionId, coverageTipo", // + índice coverageTipo
      // las demás tablas sin cambios
      operators: "id, username",
      stats: "id",
      activity_log: "id, operatorId, targetId",
      config: "id",
    });
  }
}
```

## Query Contract

### Lecturas

| Operación | Dexie Query | Retorna |
|-----------|-------------|---------|
| Listar clientes | `db.clients.toArray()` | `Client[]` |
| Buscar cliente por teléfono | `db.clients.get(phone)` | `Client \| undefined` |
| Buscar cliente por nombre | `db.clients.where("name").equals(name).toArray()` | `Client[]` |
| Suscripciones de un cliente | `db.subscriptions.where("clientPhone").equals(phone).toArray()` | `Subscription[]` |
| Suscripciones activas | `db.subscriptions.where("status").equals("activa").toArray()` | `Subscription[]` |
| Órdenes de un cliente | `db.orders.where("clientPhone").equals(phone).toArray()` | `Order[]` |
| Órdenes cubiertas por suscripción | `db.orders.where("subscriptionId").equals(subId).toArray()` | `Order[]` |
| Próximas a vencer (≤15 días) | `db.subscriptions.where("status").equals("activa").filter(s => diasRestantes(s.endDate) <= 15).toArray()` | `Subscription[]` |

### Escrituras

| Operación | Dexie Transaction | Efecto |
|-----------|-------------------|--------|
| Crear cliente | `db.clients.add(client)` | Inserta, actualiza `Client.subscription = null` |
| Actualizar cliente | `db.clients.put(client)` | Reemplaza por `phone` |
| Desactivar cliente | `db.clients.update(phone, { name: "[desactivado] " + name })` | Marca visual, no borra |
| Crear suscripción | `db.transaction("rw", db.subscriptions, db.clients, db.config, async () => { ... })` | Incrementa `subscriptionCounter`, asigna `SUB-###`, actualiza `Client.subscription` |
| Renovar suscripción | `db.transaction("rw", db.subscriptions, db.clients, async () => { ... })` | Marca anterior como `reemplazada`, crea nueva |
| Cancelar suscripción | `db.subscriptions.update(id, { status: "cancelada" })` | Cambia estado, no borra |
| Crear orden (con verificación) | `db.transaction("rw", db.orders, db.subscriptions, async () => { ... })` | Verifica cupo, asigna `coverageTipo`, actualiza `usedPerMonth` |

## TypeScript Interface Contract

### Nuevos tipos a añadir en `src/lib/types/index.ts`

```typescript
// Añadir al union SubscriptionStatus
type SubscriptionStatus = "activa" | "vencida" | "cancelada" | "reemplazada";

// Nuevo tipo
type CoverageTipo = "estandar" | "cubierta_por_suscripcion" | "suelta_con_descuento";

// Añadir a Order
interface Order {
  // ... campos existentes ...
  subscriptionId: string | null;
  coverageTipo: CoverageTipo;  // NUEVO
}
```

### Sin cambios

- `Client` — la interfaz ya existe y es correcta
- `Subscription` — la interfaz ya existe y es correcta (excepto añadir `"reemplazada"` al enum)
- `SubscriptionEmbedded` — la interfaz ya existe para el campo embebido en Client
- `Config` — ya tiene `subscriptionCounter`

## Activity Log Contract

| Action | targetId | details |
|--------|----------|---------|
| `create_client` | `client.phone` | `"Cliente {name} creado"` |
| `update_client` | `client.phone` | `"Cliente {name} actualizado"` |
| `create_subscription` | `sub.id` | `"Suscripción {id} para {clientName}"` |
| `cancel_subscription` | `sub.id` | `"Suscripción {id} cancelada"` |
| `renew_subscription` | `sub.id` | `"Suscripción {id} renovada hasta {endDate}"` |