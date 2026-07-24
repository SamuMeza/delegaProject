# Implementation Plan: Suscripciones y Clientes

**Branch**: `subs-clientes` | **Date**: 2026-07-24 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-suscripciones-clientes/spec.md`

## Summary

Gestionar clientes recurrentes y sus planes trimestrales. Se añaden dos entidades (Client, Subscription) a la base IndexedDB existente, CRUD desde el panel admin, verificación de cupo mensual al crear órdenes, cálculo automático de descuento 20% en excesos, y alertas visuales de renovación a 15 días del vencimiento.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)

**Runtime**: Bun 1.x

**UI Framework**: React 19.2.7

**Storage**: IndexedDB via Dexie 4.4.4 (wrapper existente en `src/lib/db/delegaDb.ts`)

**State Management**: Zustand 5.0.14 (cache en memoria sobre Dexie)

**Styling**: Tailwind CSS 4.3.3 + shadcn/ui (Radix primitives)

**Testing**: Bun test + happy-dom (setup en `tests/happydom.ts`)

**Target Platform**: Navegador moderno (Chrome/Firefox/Edge, desktop-first, mobile-responsive)

**Project Type**: SPA (Single Page Application) — frontend estático hosteado en Vercel

**Performance Goals**: No crítico para 2 operadores. Respuestas de UI < 200ms en operaciones CRUD locales.

**Constraints**: Sin backend (solo IndexedDB), offline-capable, sin costos fijos de infraestructura.

**Scale/Scope**: 2 operadores, ~50-100 clientes, ~200 órdenes/mes, ~20 suscripciones activas.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Estado | Justificación |
|-----------|--------|-------------|
| **I. No-Backend, Local-First** | ✅ Pasa | Clientes y suscripciones se almacenan en IndexedDB vía Dexie. No se requiere servidor. |
| **II. WhatsApp-First** | ✅ Pasa | Los clientes se crean desde el panel (no nuevo canal de intake). Las órdenes existentes ya llegan por WhatsApp. |
| **III. Structured Order Tracking** | ✅ Pasa | Las órdenes amplían su modelo con `subscription_id` y `coverageTipo` para mantener trazabilidad. |
| **IV. Venezuela Pricing** | ✅ Pasa | Suscripciones trimestrales ~$25 (desde constitución). Descuento 20% es un ajuste del precio estándar, no un nuevo rail de pago. |
| **V. Simplicity, YAGNI** | ✅ Pasa | Solo CRUD + verificación cupo + alertas. No se construye billing, sync, ni dashboard financiero. |

## Project Structure

### Documentation (this feature)

```text
specs/002-suscripciones-clientes/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── checklists/
│   └── requirements.md  # Spec quality checklist
├── contracts/
│   └── db-contract.md   # Dexie store contract
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── db/
│   │   ├── delegaDb.ts      # + stores Client, Subscription
│   │   └── seed.ts          # + seed de clientes demo
│   ├── types/
│   │   └── index.ts         # + interfaces Client, Subscription, ampliación Order
│   └── id-gen.ts            # nuevo: generación de IDs SUB-###
├── hooks/
│   └── useDelegaDB.ts       # + hooks useClients, useSubscriptions
├── pages/admin/
│   ├── ClientsListPage.tsx   # reemplazado: listado CRUD de clientes (inline)
│   ├── ClientDetailPage.tsx  # reemplazado: detalle + historial + suscripciones + formularios inline
│   └── DashboardPage.tsx     # modificado: + banner alertas renovación
├── App.tsx                  # + rutas /admin/clientes, /admin/clientes/:phone
└── frontend.tsx             # sin cambios
```

## Complexity Tracking

No se requieren violaciones a la constitución. Todos los cambios son extensiones directas del stack existente (nuevas stores Dexie, nuevas páginas admin, ampliación de tipos).

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |