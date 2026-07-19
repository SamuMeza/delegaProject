# Implementation Plan: App Foundation (Fundación de la App)

**Branch**: `001-app-foundation` | **Date**: 2026-07-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-app-foundation/spec.md`

## Summary

Base operativa de Delega: app web React construible y despliegue estático en
Vercel, almacenamiento local persistente en IndexedDB (vía Dexie) con valores
iniciales (`operators`, `config`), capa de acceso a datos reactiva para React,
autenticación de los dos operadores (login/logout con expiración de sesión) y
layout protegido del panel administrativo. Toda la lógica es client-side; no hay
backend.

## Technical Context

**Language/Version**: TypeScript 5.x sobre React 19.2.x (SPA)

**Primary Dependencies**: react 19.2.7, react-dom 19.2.7, react-router-dom 7.18.1,
zustand 5.0.14, dexie 4.4.4, dexie-react-hooks 4.4.0, tailwindcss 4.3.3 (CSS-first),
lucide-react 1.25.0, class-variance-authority, tailwind-merge, clsx.

**Storage**: IndexedDB mediante Dexie 4 (wrapper permitido por constitución I).
Única fuente de verdad persistente; Zustand cachea en memoria.

**Testing**: Verificación manual en navegador + `bun x tsc --noEmit` (typecheck) y
`bun run build` (build estático). No hay framework de tests automatizados en esta fase.

**Target Platform**: Navegador web (SPA estática), hosting Vercel (free tier).

**Project Type**: web-service → aplicación web estática (frontend-only).

**Performance Goals**: Carga de la URL de producción en <5s (SC-1); login→uso→logout
<1 min (SC-3).

**Constraints**: Sin backend/servidor (constitución I); offline-capable por diseño;
sin costos fijos (free tier); datos solo en el navegador del operador (sin sync
cross-device).

**Scale/Scope**: 2 operadores; panel privado; ~6 secciones de navegación iniciales.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación | Resultado |
|---|---|---|
| I. No-Backend, Local-First | IndexedDB/Dexie como único store; build estático Vercel; sin servidor. | PASS |
| II. WhatsApp-First & Coordinación | Login solo para 2 operadores (sin registro público); panel privado. | PASS |
| III. Structured Order Tracking | Stores/modelo prevén seguimiento; esta fase deja el esqueleto listo. | PASS (parcial, base) |
| IV. Venezuela Pricing & Pago Móvil | `config` sembrará rangos/precios y parámetros de negocio. | PASS |
| V. Simplicity, Reuse, YAGNI | Alcance limitado a fundación; sin features de negocio extra. | PASS |

**Constitution Check post-design (Phase 1)**: Sin cambios — el diseño mantiene
local-first, 2 operadores (cuentas separadas) y sin backend. Sin violaciones que
justificar. Este Constitution Check se genera revisando automáticamente cada
Functional Requirement (FR-1 a FR-5) contra los cinco principios de la
constitución; cualquier violación debe documentarse en Complexity Tracking con
justificación.

## Project Structure

### Documentation (this feature)

```text
specs/001-app-foundation/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (UI/auth contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── frontend.tsx                 # entrypoint React
├── App.tsx                      # rutas públicas + /admin/* protegida
├── index.html                   # título "Delega", lang="es"
├── pages/                       # landing (existentes placeholder)
├── pages/admin/                 # AdminLayout + Login + placeholders
├── components/                  # ui/ + ServiceSelector, etc.
├── hooks/
│   ├── useAuth.ts               # login/logout/sesión/expiración
│   ├── useOrderPermissions.ts
│   └── useDelegaDB.ts           # abstracción reactiva Dexie
├── lib/
│   ├── db/delegaDb.ts           # instancia Dexie + stores + seeding
│   ├── types/index.ts           # tipos estrictos
│   ├── auth/                    # sesión (hashing SHA-256, localStorage)
│   └── pricing.ts
├── lib/config/seed.ts           # valores iniciales operators/config
styles/globals.css               # Tailwind v4 + tokens marca
build.ts                         # build estático → dist/
vercel.json                      # rewrite SPA
.env.example                     # BUN_PUBLIC_* (hashes de operadores)
```

**Structure Decision**: Aplicación de proyecto único (frontend-only SPA). Sin
backend; el código de acceso a datos vive en `src/lib/db` y `src/hooks`.

## Complexity Tracking

Sin violaciones de la constitución. No se requiere justificación.

## Phase 0: Research

No hay NEEDS CLARIFICATION en el spec; todas las decisiones de arquitectura ya
están fijadas por la constitución y el stack del AGENTS.md. Hallazgos consolidados
en `research.md`:

- **Almacenamiento**: Dexie 4 sobre IndexedDB es el wrapper permitido (constitución I).
- **Auth sin backend**: validación de hash SHA-256 de la contraseña contra el hash
  almacenado en el registro del operador (aclaración del spec). Sesión en
  `localStorage` con timestamp de expiración (`session_timeout_hours` en `config`).
- **Seeding**: al primer arranque, si el store está vacío, se puebla `operators`
  (dos operadores con cuentas separadas y sus hashes) y `config` (con
  `sessionTimeoutHours`, `orderCounter=0`, `subscriptionCounter=0` y `priceRanges`)
  con valores por defecto definidos por los dueños (aclaración del spec).
- **Despliegue**: build estático con `bun run build` → `dist/`; `vercel.json`
  reescribe SPA a `index.html` (todas las rutas caen a `index.html` para
  enrutado client-side). El despliegue se hace manualmente desde Vercel tras
  subir el repo a GitHub.

Ver `research.md` para detalle de decisiones y alternativas.

## Phase 1: Design & Contracts

- `data-model.md`: entidades `Operator`, `Config`, `Session` con campos y reglas.
- `contracts/`: contrato de UI de login y de protección de rutas del panel.
- `quickstart.md`: escenarios de validación end-to-end (deploy, persistencia,
  login/logout, layout protegido).

Ver artifacts generados en esta misma carpeta.
