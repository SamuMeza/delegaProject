# Implementation Plan: [FEATURE]

**Branch**: `003-fuente-clientes` | **Date**: 2026-07-22 | **Spec**: specs/003-fuente-clientes/spec.md

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implementar la landing page y formulario interactivo para el servicio Delega en Venezuela. La landing consta de 3 páginas públicas (Home, Servicios, Contacto) + 2 páginas de conversión (Formulario interactivo `/delegar`, Página de seguimiento `/orden/:token`). El sistema funciona 100% client-side con IndexedDB (Dexie) como almacén de configuración, sin backend. Los estudiantes envían solicitudes por WhatsApp con un token de seguimiento firmado SHA-256 que permite al operador importar y dar seguimiento a las órdenes en el panel privado.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript with Bun runtime

**Primary Dependencies**: React 19.2.7, react-dom 19.2.7, react-router-dom 7.18.1, Zustand 5.0.14, Dexie 4.4.4, dexie-react-hooks 4.4.0, Tailwind CSS 4.3.3, tw-animate-css 1.4.0, lucide-react 1.25.0, class-variance-authority 0.7.1, tailwind-merge 3.6.0, clsx 2.1.1, bun-plugin-tailwind 0.1.2, shadcn/ui (Radix)

**Storage**: IndexedDB (via Dexie wrapper) for all persistence

**Testing**: Bun native test runner (`bun test`) with `bunfig.toml` preload configuration

**Target Platform**: Web browser (single-page application)

**Project Type**: Web application (frontend-only, no backend)

**Performance Goals**: Responsive design with fast initial load (<3s on 3G), instant UI feedback (<100ms for form interactions)

**Constraints**: 
- No-backend, local-first persistence (Constitution Principle I)
- Must use IndexedDB as only datastore (Dexie as permitted wrapper)
- WhatsApp-first intake (Constitution Principle II)
- Structured order tracking with enumerated states (Constitution Principle III)
- Venezuela-native pricing and Pago Móvil tracking (Constitution Principle IV)
- Simplicity and reuse (Constitution Principle V)
- Deploy as static site (Vercel or similar)
- No fixed infrastructure costs

**Scale/Scope**: 
- Two human operators managing all orders
- Expected low-to-moderate order volume (dozens per week)
- Simple data volume
- Single-page application with public landing + private admin panel

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Gates** (all must pass before proceeding):

| Principle | Gate Criteria | Status |
|-----------|--------------|--------|
| I. No-Backend, Local-First (NON-NEGOTIABLE) | Feature uses IndexedDB via Dexie only; no server backend or cloud DB | ✅ |
| II. WhatsApp-First Intake | Landing generates `wa.me` links; operator registers orders manually | ✅ |
| III. Structured Order Tracking (NON-NEGOTIABLE) | All 7 enumerated states used; panel shows state transitions and who owes what | ✅ |
| IV. Venezuela-Native Pricing & Pago Móvil (NON-NEGOTIABLE) | Prices $3-$15 per task, ~$25 quarterly; payment tracked per order against Pago Móvil | ✅ |
| V. Simplicity, Reuse & Productized Workflow | YAGNI applied; reusable templates and repeatable workflows | ✅ |

**Tech & Persistence Constraints**: React SPA with IndexedDB, offline-capable, static hosting on free tier only.

Post-design re-evaluation: **PASS** — no new violations introduced by the design.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this project. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
frontend/
├── src/
│   ├── components/         # ui/ (shadcn) + ServiceSelector, DynamicFields, PriceEstimator, WhatsAppGenerator
│   │   └── ui/             # shadcn/ui components
│   ├── pages/              # landing: Home, Services, Delegate, Contact, OrderTracking
│   ├── pages/admin/        # Dashboard, Orders, Clients, Subscriptions, ActivityLog, Statistics, Login
│   ├── hooks/              # useAuth, useOrderPermissions, useDelegaDB
│   ├── lib/
│   │   ├── db/delegaDb.ts  # instancia Dexie (stores §2.2)
│   │   ├── types/index.ts  # interfaces TS estrictas (Order, Client, Subscription, Operator, ActivityLogEntry, Config)
│   │   ├── auth/           # sesión localStorage (§3)
│   │   └── pricing.ts      # cálculo de precios (§9.2)
│   ├── App.tsx             # rutas (públicas + /admin/* protegida)
│   ├── frontend.tsx        # entrypoint React
│   └── index.html          # título "Delega", lang="es"
├── styles/                 # Tailwind CSS and custom styles
│   └── globals.css         # Tailwind v4 + tokens de marca
├── tests/                  # Test directory
│   ├── unit/
│   └── integration/
└── ...                     # config files (vercel.json, .env.example, etc.)

**Structure Decision**: Option 2 (Web application) adapted for frontend-only SPA.
No backend/ directory exists as per Constitution Principle I (No-Backend).
All application code resides in frontend/src/ following the structure outlined
in AGENTS.md.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No Constitution Check violations. No complexity tracking entries needed.
