# Data Model: Gestión de Órdenes

**Feature**: `specs/002-gestion-ordenes`
**Date**: 2026-07-19
**Source**: `spec.md`, `research.md` (R1–R10)

Modelo de datos sobre IndexedDB (Dexie). No hay backend (Constitución I). Los
cambios se aplican sobre los tipos ya existentes en `src/lib/types/index.ts` y el
esquema de `src/lib/db/delegaDb.ts`.

---

## Entidades y cambios

### Config (ya existe — se extiende)

Fuente de parámetros del negocio. Se agrega el mapa de asignación.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `"app"` | clave fija |
| `sessionTimeoutHours` | `number` | ya existe |
| `orderCounter` | `number` | ya existe (se usa para `ORD-###`) |
| `subscriptionCounter` | `number` | ya existe |
| `priceRanges` | `Record<ServiceType, {min,max}>` | ya existe |
| **`serviceOperatorMap`** | `Record<ServiceType, string>` | **NUEVO** — `ServiceType` → `"op_001" | "op_002"` |

Valor por defecto sembrado (R1):
`{ ensayo: op_001, presentacion: op_001, investigacion: op_001, formato: op_002, diseno: op_002, video: op_002 }`

### Order (ya existe — se ajusta)

| Campo | Tipo | Cambio |
|---|---|---|
| `id` | `string` | `ORD-###` (R8) |
| `clientPhone` / `clientName` | `string` | sin cambio |
| `serviceType` | `ServiceType` | sin cambio; usado para asignación (R1) |
| `operatorId` | `string` | asignado automáticamente vía `serviceOperatorMap` |
| `details` | `OrderDetails` | sin cambio |
| `hasMaterial` | `boolean \| null` | sin cambio |
| `price` / `paidAmount` / `totalPaid` / `paymentRef` | `number`/`string` | sin cambio |
| **`paymentStatus`** | `"unpaid" \| "partial" \| "paid"` | **NUEVO** (R9), derivado de `totalPaid` vs `price` |
| `status` | `OrderStatus` | sin cambio; ver máquina de estados |
| **`urgent`** | `boolean` | **NUEVO** (R7) |
| `createdAt` / `dueDate` / `completedAt` | `string \| null` | sin cambio |
| `notes` | `OrderNote[]` | se enriquece con `id` (R4) |
| `subscriptionId` | `string \| null` | sin cambio |
| **`statusHistory`** | `StatusTransition[]` | **NUEVO** (R3) |
| `files` | — | **ELIMINADO** de `Order`; pasa a tabla `order_attachments` (R2) |

### OrderNote (se enriquece)

| Campo | Tipo | Notas |
|---|---|---|
| **`id`** | `string` | **NUEVO** (R4) |
| `text` | `string` | sin cambio |
| `author` | `string` | operador (`operatorId`) |
| `at` | `string` | ISO timestamp |

### OrderAttachment (NUEVO — tabla propia, R2)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `string` | `ATT-###` o uuid |
| `orderId` | `string` | índice hacia `Order.id` |
| `name` | `string` | nombre de archivo |
| `mime` | `string` | tipo MIME |
| `size` | `number` | bytes |
| `blob` | `Blob` | contenido binario (IndexedDB) |
| `author` | `string` | operador que subió |
| `uploadedAt` | `string` | ISO timestamp |

### StatusTransition (NUEVO — embebido en Order, R3)

| Campo | Tipo |
|---|---|
| `from` | `OrderStatus` |
| `to` | `OrderStatus` |
| `by` | `string` (operatorId) |
| `at` | `number` (epoch ms) |

---

## Relaciones

- `Order.operatorId` → `Operator.id` (asignado automático, R1)
- `Order.serviceType` → `Config.serviceOperatorMap` (resuelve operador)
- `OrderAttachment.orderId` → `Order.id` (1 orden, N adjuntos)
- `Order.notes[]` → muchas notas (autor = operador)
- `Order.statusHistory[]` → historial de transiciones
- `ActivityLogEntry.targetId` = `Order.id` en acciones de orden (R10)

---

## Máquina de estados (R6)

```
nueva ─▶ pendiente_pago ─▶ en_progreso ─▶ revision ─▶ pendiente_final ─▶ completada
                                  │              │            │
                                  └─▶ cancelada  └─▶ cancelada └─▶ (terminal)
pendiente_pago ─▶ cancelada
completada, cancelada → terminales
```

`ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]>`:
- `nueva`: [`pendiente_pago`]
- `pendiente_pago`: [`en_progreso`, `cancelada`]
- `en_progreso`: [`revision`, `cancelada`]
- `revision`: [`pendiente_final`, `en_progreso`]
- `pendiente_final`: [`completada`]
- `completada`: []
- `cancelada`: []

---

## Reglas de validación (de los requisitos)

- `serviceType` es **obligatorio** al crear (R1); sin él no hay asignación.
- Asignación: `operatorId = serviceOperatorMap[serviceType] ?? "op_001"` (fallback
  por defecto + advertencia en `activity_log`, CHK011). No se rechaza la creación.
- "Vencida" solo para estados activos (`dueDate` pasado y `status` no en
  `completada`/`cancelada`); `urgent` es flag manual independiente, ambos se
  resaltan pero distinguidos (CHK034/CHK035).
- El ID `ORD-###` se genera atómicamente desde `config.orderCounter` (R8).
- Toda transición de estado debe estar en `ALLOWED_TRANSITIONS` (FR-005).
- `canEdit`/`canChangeStatus` solo para `session.operatorId === order.operatorId`
  (FR-007); `canAddNote` siempre `true`.
- `paymentStatus` derivado: `totalPaid>=price` → `paid`; `0<totalPaid<price` →
  `partial`; `totalPaid<=0` → `unpaid` (R9).
- Tamaño de adjunto: advertir/limitar a un tope razonable (p.ej. 25 MB) para no
  saturar IndexedDB (edge case de spec).

---

## Esquema Dexie (cambios en `delegaDb.ts`)

```ts
// se agrega:
order_attachments: "id, orderId, name",
// orders: se mantiene índice; se elimina la necesidad de leer blobs desde aquí.
// config: se agrega serviceOperatorMap al tipo (no cambia índices).
```

---

## Seeding (R1)

`seed.ts` → `defaultConfig()` agrega `serviceOperatorMap` con el valor por defecto
arriba. Idempotente (ya existe la guarda `configCount === 0`).
