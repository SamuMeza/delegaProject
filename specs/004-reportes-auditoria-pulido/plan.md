# Implementation Plan: Reportes, Auditoría y Pulido

**Branch**: `004-reportes-auditoria-pulido` | **Date**: 2026-07-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-reportes-auditoria-pulido/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

This feature adds reporting, auditing, and polishing capabilities to the Delega admin panel. Key components include:
- **Activity Log**: Chronological record of operator actions with filtering capabilities
- **Monthly Statistics**: Visual summary of business metrics (orders, revenue, operator distribution)
- **Notifications**: Visual and audio alerts for new orders
- **Data Export**: JSON backup of all IndexedDB data
- **Responsive & Accessibility**: Mobile-first design with WCAG compliance

The implementation follows the Delega constitution: local-first persistence via IndexedDB, no backend, static deployment.

## Technical Context

**Language/Version**: TypeScript (React 19.2.7, react-dom 19.2.7)

**Primary Dependencies**: 
- React 19.2.7 + react-router-dom 7.18.1 (routing)
- Dexie 4.4.4 (IndexedDB wrapper) + dexie-react-hooks 4.4.0
- Zustand 5.0.14 (state management)
- Tailwind CSS 4.3.3 + tw-animate-css 1.4.0 (styling)
- lucide-react 1.25.0 (icons)
- class-variance-authority 0.7.1 + tailwind-merge 3.6.0 + clsx 2.1.1 (utility)

**Storage**: IndexedDB (via Dexie wrapper) - all data persisted locally in browser

**Testing**: Vitest + React Testing Library + fake-indexeddb (for IndexedDB mocking)

**Target Platform**: Modern web browsers (Chrome, Edge, Firefox) - SPA deployed to Vercel static hosting

**Project Type**: Single-page web application (SPA)

**Performance Goals**:
- Activity Log: Filter response < 500ms, 60fps scrolling with 10k+ records
- Data Export: < 1 second for up to 10MB data
- Notifications: < 2 seconds from data persistence to alert
- Responsive: Functional in viewports from 320px to 1920px

**Constraints**:
- Offline-capable by design (local-first)
- No backend/server/API - purely client-side
- No fixed infrastructure costs (free tier hosting)
- Two operators with mutual visibility

**Scale/Scope**: Small business tool (2 operators), not a consumer product. Expected data volumes: hundreds to low thousands of orders, clients, and activity entries.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. No-Backend, Local-First Persistence | ✅ PASS | All data persists in IndexedDB via Dexie. No server components introduced. |
| II. WhatsApp-First Intake & Human Coordination | ✅ PASS | Feature enhances operator coordination (activity log, notifications). WhatsApp remains intake channel. |
| III. Structured Order Tracking | ✅ PASS | Feature builds on existing order tracking, doesn't modify lifecycle. |
| IV. Venezuela-Native Pricing & Pago Móvil | ✅ PASS | No pricing changes. Statistics use existing price data. |
| V. Simplicity, Reuse & Productized Workflow | ✅ PASS | Reuses existing components (shadcn/ui, Tailwind). Adds focused value without unnecessary complexity. |

**Constitution Check Result**: ✅ **PASS** - No violations detected. All core principles respected.

## Project Structure

### Documentation (this feature)

```text
specs/004-reportes-auditoria-pulido/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/          # UI components (shadcn/ui base + custom)
│   └── ui/             # shadcn/ui components (Button, Card, etc.)
├── hooks/              # Custom React hooks (useAuth, useDelegaDB, etc.)
├── lib/                # Business logic and utilities
│   ├── auth/           # Authentication (hash, session)
│   ├── config/         # Configuration (env, serviceTypes)
│   ├── db/             # Database (Dexie setup, seed data)
│   ├── orders/         # Order logic (state machine, permissions, UI helpers)
│   ├── types/          # TypeScript interfaces (Order, Client, etc.)
│   ├── pricing.ts      # Price calculation logic
│   ├── tracking.ts     # Order tracking utilities
│   └── utils.ts        # General utilities (cn, etc.)
├── pages/              # Page components (routed)
│   └── admin/          # Admin panel pages (Dashboard, Orders, Clients, etc.)
├── App.tsx             # Router configuration
├── frontend.tsx        # Entry point
├── index.html          # HTML template
└── index.css           # Global styles (Tailwind v4)
```

**Structure Decision**: Single-page web application (SPA) with React frontend. All code in `src/` directory with clear separation: `components/` for UI, `hooks/` for state management, `lib/` for business logic, and `pages/` for routed views. Uses shadcn/ui component library with Tailwind CSS for styling. Dexie.js wraps IndexedDB for local persistence.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
