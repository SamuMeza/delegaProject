# Contracts: Gestión de Órdenes

**Feature**: `specs/002-gestion-ordenes`
**Date**: 2026-07-19

Aplicación SPA local (sin backend). Los "contracts" son los contratos de interfaz
interna: rutas del panel, forma de los datos de entrada/salida de la capa de
servicio de órdenes, y el contrato de permisos. No hay API pública externa.

---

## C1 — Rutas del panel (admin)

| Ruta | Componente | Contrato |
|---|---|---|
| `/admin/ordenes` | `OrdersListPage` | Lista **todas** las órdenes (propias y ajenas), columnas: `id`, cliente, `serviceType`, `status`, operador asignado, `urgent`/vencida, creado. Filtros por estado y búsqueda por cliente. Acción "Nueva orden". |
| `/admin/ordenes/nueva` | `OrderCreatePage` (o modal en lista) | Formulario: cliente (nombre/teléfono), `serviceType` (obligatorio), `details` por tipo, `dueDate`, `urgent`, `price`. Al guardar → asigna operador vía `serviceOperatorMap`, genera `ORD-###`, estado `nueva`. |
| `/admin/ordenes/:id` | `OrderDetailPage` | Detalle completo + historial de estados + notas + adjuntos. Controles de cambio de estado solo si `canChangeStatus`. Formulario de nota siempre habilitado. Subir/descargar/borrar adjunto con `canDeleteAttachment`. |
| `/admin` (dashboard) | `DashboardPage` | Contadores del mes: total, por estado, urgentes/vencidas, ingresos Pago Móvil (`totalPaid`). |

---

## C2 — Capa de servicio `src/lib/orders/` (contrato de funciones)

Todas devuelven `Promise` y operan sobre Dexie. La UI nunca toca `db` directo para
órdenes; usa estos helpers (reutiliza `useDelegaDB`).

```ts
// Crear
createOrder(input: OrderCreateInput, operatorId: string): Promise<string>
  // input: { clientName, clientPhone, serviceType, details, dueDate?, urgent?, price }
  // efecto: asigna operatorId desde Config.serviceOperatorMap[serviceType],
  //         genera ORD-### desde config.orderCounter, estado "nueva",
  //         registra activity_log create_order.

// Transición de estado
transitionOrder(orderId: string, to: OrderStatus, operatorId: string): Promise<void>
  // valida ALLOWED_TRANSITIONS; rechaza si inválido;
  // empuja StatusTransition; si to==="completada" setea completedAt;
  // registra activity_log change_status.

// Notas
addNote(orderId: string, text: string, author: string): Promise<void>
  // agrega OrderNote {id, text, author, at}; registra activity_log add_note.

// Adjuntos
uploadAttachment(orderId: string, file: File, author: string): Promise<void>
  // guarda OrderAttachment en tabla order_attachments; activity_log upload_file.
deleteAttachment(attachmentId: string): Promise<void>

// Lectura
listOrders(filter?: { status?: OrderStatus; q?: string }): Promise<Order[]>
getOrder(id: string): Promise<Order | undefined>
listAttachments(orderId: string): Promise<OrderAttachment[]>
```

---

## C3 — Contrato de permisos `useOrderPermissions`

```ts
type OrderPermissions = {
  canView: true;            // todos ven todo (FR-007)
  canEdit: boolean;         // session.operatorId === order.operatorId
  canChangeStatus: boolean; // igual que canEdit
  canAddNote: true;         // cualquiera puede comentar (FR-008)
  canDeleteAttachment: boolean; // igual que canEdit
};
useOrderPermissions(order: Order, session: Session): OrderPermissions
```

La UI deshabilita/oculta controles de escritura cuando `canEdit`/`canChangeStatus`
son `false` y muestra un indicador "solo lectura".

---

## C4 — Formulario de creación (campos obligatorios/opcionales)

| Campo | Obligatorio | Validación |
|---|---|---|
| `clientName` | sí | no vacío |
| `clientPhone` | sí | formato teléfono VE básico |
| `serviceType` | **sí** | uno de los 6; define asignación (R1) |
| `details` | sí | por tipo de servicio (ya tipado) |
| `price` | sí | rango `$3–$15` sugerido (Principio IV) |
| `dueDate` | no | fecha futura |
| `urgent` | no | boolean |
| `paymentRef` | no | texto libre (Pago Móvil) |

---

## C5 — Derivación de pago (Principio IV)

`derivePaymentStatus(order): "unpaid" | "partial" | "paid"`:
- `totalPaid <= 0` → `unpaid`
- `0 < totalPaid < price` → `partial`
- `totalPaid >= price` → `paid`

El dashboard y el detalle muestran `paymentStatus` por orden.
