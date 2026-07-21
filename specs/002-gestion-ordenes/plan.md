# Implementation Plan: Gestión de Órdenes

**Branch**: `002-gestion-ordenes` | **Date**: 2026-07-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-gestion-ordenes/spec.md`

## Summary

Implementar el core del negocio: registro y seguimiento de órdenes de apoyo escolar
de principio a fin en el panel privado. Cubre CRUD manual de órdenes, asignación
automática del operador responsable según `serviceType`, permisos de escritura
(solo lo propio; notas en cualquiera), pipeline de estados enumerado, notas internas
con autor/timestamp, adjuntos binarios en IndexedDB y un dashboard resumen. Todo
local-first (IndexedDB/Dexie), sin backend, alineado con la constitución.

El enfoque técnico (de `research.md`): mapeo serviceType→operador dirigido por
`Config`, tabla `order_attachments` separada para blobs, historial de estados
embebido, y un hook `useOrderPermissions` único que aplica la regla de escritura.

## Technical Context

**Language/Version**: TypeScript (strict) sobre React 19.2.7 (ya en fundación)

**Primary Dependencies**: Dexie 4.4.4, dexie-react-hooks 4.4.0, react-router-dom 7.18.1, zustand 5.0.14, Tailwind CSS 4.3.3, lucide-react, shadcn/ui (Radix) — todas ya fijadas en fundación

**Storage**: IndexedDB vía Dexie (fuente de verdad). Nueva tabla `order_attachments` para blobs. `Config` extiende con `serviceOperatorMap`

**Testing**: `bun x tsc --noEmit` (tipos) + `bun run build` (build) + validación manual en navegador vía `quickstart.md` (no hay framework de test automatizado definido aún)

**Target Platform**: SPA web en navegador de escritorio/móvil (dos operadores, una máquina cada uno), desplegada estática en Vercel

**Project Type**: web-application (panel admin SPA, local-first)

**Performance Goals**: listado de órdenes y dashboard responden de inmediato (datos locales); sin latencia de red

**Constraints**: sin backend ni nube (Principio I); offline-capable; sin coste fijo; blobs limitados a un tope razonable (~25 MB) para no saturar IndexedDB

**Scale/Scope**: 2 operadores, volumen bajo de órdenes (decenas/mes); 6 service types; pipeline de 6 estados + cancelada

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación | Resultado |
|---|---|---|
| I. No-Backend, Local-First | Todo en IndexedDB; adjuntos como blobs en Dexie; sin servidor | ✅ PASS |
| II. WhatsApp-First / Coordinación | Notas mutuas, visibilidad mutua de órdenes, asignación clara | ✅ PASS |
| III. Structured Order Tracking | Pipeline enumerado, historial, urgencia/vencimiento, dashboard | ✅ PASS |
| IV. Venezuela Pricing / Pago Móvil | `paymentStatus` por orden; `paymentRef`/`totalPaid` registrados | ✅ PASS |
| V. Simplicidad / Reuse | Sin roles nuevos, sin backend, mapa en Config, reusa `useDelegaDB`/`activity_log` | ✅ PASS |

**Post-Phase-1 re-check**: sin cambios de diseño que violen la constitución. Sin entradas en `Complexity Tracking`.

## Project Structure

### Documentation (this feature)

```text
specs/002-gestion-ordenes/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── order-contracts.md
└── tasks.md             # Phase 2 output (/speckit.tasks - NOT created here)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── types/index.ts          # + serviceOperatorMap en Config; + urgent/paymentStatus/
│   │                           #   statusHistory en Order; + id en OrderNote; nuevo
│   │                           #   OrderAttachment, StatusTransition
│   ├── db/delegaDb.ts          # + tabla order_attachments
│   ├── db/seed.ts              # + serviceOperatorMap en defaultConfig
│   ├── orders/                 # NUEVO: capa de servicio (C2)
│   │   ├── service.ts          # createOrder, transitionOrder, addNote, upload/deleteAttachment
│   │   ├── permissions.ts      # useOrderPermissions / canEdit helpers
│   │   └── stateMachine.ts     # ALLOWED_TRANSITIONS, derivePaymentStatus
│   └── config/env.ts           # sin cambios
├── hooks/
│   ├── useAuth.ts              # sin cambios (proveé session.operatorId)
│   └── useDelegaDB.ts          # + helpers de órdenes/adjuntos (useOrders, useOrder, useAttachments)
└── pages/admin/
    ├── OrdersListPage.tsx      # implementar lista + filtros + "Nueva"
    ├── OrderDetailPage.tsx     # implementar detalle + estado + notas + adjuntos + permisos
    ├── OrderCreatePage.tsx     # NUEVO: formulario de creación
    └── DashboardPage.tsx       # ampliar con contadores del mes + urgentes
```

**Structure Decision**: Aplicación web SPA única (Opción 1 del template). Se añade
una capa de servicio `src/lib/orders/` para encapsular reglas de negocio de órdenes
(creación, transiciones, permisos, pago) y se reutilizan los hooks reactivos
`useDelegaDB`. Las páginas admin consumen esa capa, no Dexie directo.

## Complexity Tracking

> Sin violaciones de constitución → no aplica.
