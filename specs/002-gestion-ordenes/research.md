# Research: Gestión de Órdenes

**Feature**: `specs/002-gestion-ordenes`
**Date**: 2026-07-19
**Branch**: `002-gestion-ordenes`

Este documento resuelve las decisiones técnicas (NEEDS CLARIFICATION) y valida el
enfoque frente a la constitución. Cada ítem sigue el formato:
Decisión / Rationale / Alternativas consideradas.

---

## R1 — Mapeo serviceType → operador (asignación automática)

**Contexto**: La constitución (Principio II / Operating Model) dice "dos operadores,
dos service types", pero el modelo de datos actual (`src/lib/types/index.ts`) define
**6** `ServiceType` (`ensayo`, `presentacion`, `investigacion`, `formato`, `diseno`,
`video`). El input del usuario (2.2) pide asignar op_001/op_002 "según serviceType".

- **Decisión**: Mapeo **dirigido por configuración**, no hardcodeado. Se agrega
  `serviceOperatorMap: Record<ServiceType, string>` a `Config`, sembrado con un
  valor por defecto (ensayo/presentacion/investigacion → `op_001`;
  formato/diseno/video → `op_002`). Al crear una orden, el operador responsable se
  resuelve leyendo ese mapa. **Fallback (CHK011)**: si un `serviceType` no tiene
  entrada en el mapa, se asigna `op_001` por defecto y se registra una advertencia
  en `activity_log`; la creación no se rechaza.
- **Rationale**: Mantiene la regla de negocio editable por los dueños sin tocar
  código (Principio V: simplicidad/reutilización). Encaja con el patrón existente de
  `Config` como fuente de parámetros (ya tiene `priceRanges`).
- **Alternativas consideradas**:
  - Hardcodear `if serviceType in [...]` en el hook → rechazado: rompe Principio V y
    obliga a recompilar para reasignar trabajo.
  - Tabla `service_assignments` en Dexie → sobre-ingeniería para 6 valores fijos;
    el mapa en `Config` es suficiente.

## R2 — Almacenamiento de adjuntos (blobs)

**Contexto**: FR-010/2.6 pide subir/descargar archivos en IndexedDB. El tipo actual
`OrderFile` embebe `blob` dentro de `Order.files[]`.

- **Decisión**: Tabla Dexie **separada** `order_attachments`
  (`id`, `orderId`, `name`, `mime`, `size`, `blob`, `author`, `uploadedAt`),
  referenciada por `orderId`. El `Order` deja de incrustar blobs; conserva solo un
  conteo/referencia si es necesario (se consulta por `orderId`).
- **Rationale**: Los blobs pueden ser grandes; incrustarlos en el registro `Order`
  infla cada lectura del listado y dificulta borrar/descargar un archivo individual.
  Una tabla aparte mantiene el listado ligero y da operaciones granulares
  (Principio I: solo IndexedDB, sin nube).
- **Alternativas consideradas**:
  - Seguir embebiendo en `Order.files` → rechazado por peso de registro y falta de
    borrado granular.
  - IndexedDB `File` handle / OPFS → no compatible de forma universal y fuera de
    alcance; `Blob` en Dexie es suficiente.

## R3 — Historial de transiciones de estado

**Contexto**: FR-011 exige registrar de→a, autor y timestamp de cada cambio.

- **Decisión**: Agregar `statusHistory: StatusTransition[]` **embebido** en `Order`
  (`StatusTransition = { from: OrderStatus; to: OrderStatus; by: string; at: number }`).
- **Rationale**: Las transiciones son acotadas (≤6 por orden) y siempre se leen junto
  al detalle; no justifica tabla aparte (Principio V).
- **Alternativas consideradas**: Tabla `status_transitions` aparte → descartada por
  complejidad innecesaria.

## R4 — Identidad de notas y adjuntos

- **Decisión**: Agregar `id: string` a `OrderNote` y a `OrderAttachment`. Las notas
  actuales ya traen `author` y `at`; se conservan y se añade `id`. Los adjuntos
  nuevos llevan `author` (ausente antes) además de `uploadedAt`.
- **Rationale**: Permite edición/borrado individual y evita ambigüedad al renderizar
  listas reactivas (claves estables).

## R5 — Modelo de permisos (escritura)

**Contexto**: FR-007/2.3 — ver todo, editar solo lo propio, notas en cualquiera.

- **Decisión**: Nuevo hook `useOrderPermissions(order, session)` →
  `{ canView: true, canEdit: boolean, canChangeStatus: boolean, canAddNote: true,
  canDeleteAttachment: boolean }`. `canEdit`/`canChangeStatus`/`canDeleteAttachment`
  son `true` solo si `session.operatorId === order.operatorId`. La UI deshabilita
  controles de escritura cuando `false` y muestra estado solo-lectura.
- **Rationale**: Reutiliza `session.operatorId` de `useAuth` (ya implementado).
  Regla declarada en un único sitio, aplicada en lista y detalle.
- **Alternativas consideradas**: Roles adicionales → rechazado; el negocio es de 2
  operadores pares, no jerárquico.

## R6 — Máquina de estados del pipeline

- **Decisión**: Transiciones permitidas (mapa `ALLOWED_TRANSITIONS`):
  - `nueva` → `pendiente_pago`
  - `pendiente_pago` → `en_progreso` | `cancelada`
  - `en_progreso` → `revision` | `cancelada`
  - `revision` → `pendiente_final` | `en_progreso`
  - `pendiente_final` → `completada`
  - `completada` → (terminal)
  - `cancelada` → (terminal)
  Cualquier salto no listado se rechaza en UI y en la capa de servicio.
- **Rationale**: FR-005 y Principio III (estados enumerados de primera clase).
  `cancelada` es terminal y conserva trazabilidad (no borrado físico, ver R9).
- **Alternativas consideradas**: Transiciones libres → rechazadas; violan FR-005.

## R7 — Urgencia y vencimiento

- **Decisión**: Agregar `urgent: boolean` a `Order` (flag manual del operador).
  "Vencida" se calcula en runtime: `dueDate != null && dueDate < now && status not in
  (completada, cancelada)`. El dashboard y listado resaltan `urgent || vencida`, **distinguidas visualmente** (ej. "Urgente" vs "Vencida") para no confundirlas (CHK035). Una orden en estado terminal con `dueDate` pasado NO se cuenta como vencida (CHK034). "Mes" del dashboard = mes calendario actual, abarcando órdenes de ambos operadores (CHK045).
- **Rationale**: FR-013 y Principio III (ver a simple vista qué está vencido).
- **Alternativas consideradas**: Reglas automáticas de urgencia por tipo → fuera de
  alcance; se mantiene flag manual + vencimiento por fecha.

## R8 — Generación de ID `ORD-###`

- **Decisión**: Reutilizar `config.orderCounter` (ya existe). En la creación de orden,
  dentro de una transacción Dexie `config` + `orders`, incrementar el contador y
  componer `ORD-${String(n).padStart(3,"0")}`. FR-002 satisfecho.
- **Rationale**: El contador ya está en el modelo y sembrado en 0; solo falta usarlo.

## R9 — Pago y cancelación (Principio IV)

- **Contexto**: Principio IV exige registrar estado de pago Pago Móvil por orden.
  El `Order` ya tiene `price`, `paidAmount`, `totalPaid`, `paymentRef` pero no un
  estado de pago explícito.

- **Decisión**: Agregar `paymentStatus: "unpaid" | "partial" | "paid"` derivado de
  `totalPaid` vs `price` (helper `derivePaymentStatus`), y permitir registrar
  `paymentRef`/`paidAmount`. `cancelada` es estado terminal que conserva el registro
  (no borrado físico) para trazabilidad financiera.
- **Rationale**: Cumple Principio IV sin introducir cobro automático (el operador
  registra el Pago Móvil). Evita pérdida de histórico.

## R10 — Bitácora de actividad

- **Decisión**: Reutilizar la tabla `activity_log` y `ActionType` existentes
  (`create_order`, `update_order`, `change_status`, `add_note`, `upload_file`).
  Cada acción de escritura registra una entrada con `operatorId`, `targetId`,
  `details`, `timestamp`. No se crea nuevo mecanismo.
- **Rationale**: Ya presente en fundación; coherencia y sin duplicación (Principio V).

---

## Resumen de cambios de modelo (data-model.md detalla)

- `Config`: + `serviceOperatorMap: Record<ServiceType, string>`.
- `Order`: + `urgent: boolean`; + `paymentStatus`; + `statusHistory:
  StatusTransition[]`; se **elimina** `files: OrderFile[]` embebido (pasa a tabla
  `order_attachments`).
- `OrderNote`: + `id: string` (conserva `text`, `author`, `at`).
- Nuevo `OrderAttachment` (tabla propia) y `StatusTransition`.
- Nuevas tablas Dexie: `order_attachments`.
- Nuevo hook: `useOrderPermissions`.
- Nueva capa de servicio: `src/lib/orders/` (crear, transicionar, agregar nota,
  subir/borrar adjunto, permisos) — reutiliza `db` y `useDelegaDB`.

## Constitución — chequeo rápido

- Principio I (local-first): ✅ todo en IndexedDB, blobs incluidos.
- Principio II (WhatsApp-first / coordinación): ✅ notas mutuas, visibilidad mutua.
- Principio III (tracking estructurado): ✅ pipeline + urgencia + historial.
- Principio IV (precio Pago Móvil VE): ✅ `paymentStatus` por orden.
- Principio V (simplicidad): ✅ sin roles nuevos, sin backend, mapa en Config.

**Sin violaciones** → no se requiere `Complexity Tracking`.
