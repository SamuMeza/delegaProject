# Research: Landing + Formulario (Fuente de Clientes)

**Feature Branch**: `003-fuente-clientes`
**Date**: 2026-07-22
**Spec**: `specs/003-fuente-clientes/spec.md`

---

## Testing Framework: Bun Native Test Runner (not Vitest)

### Decision
Use `bun test` (Bun's built-in test runner) for all testing.

### Rationale
1. **Native Bun integration**: This project uses Bun as its runtime (not Node/Vite). `bun test` is zero-dependency and has native TypeScript + JSX support without additional transforms.
2. **Vitest compatibility issues on Bun**: Vitest 4.x has known module mocking bugs on Bun (`vi.mock()` loads real module instead of mock), watch-mode hangs due to `tinypool` issues, and broken `bun:` prefix rewriting. These are documented unresolved issues.
3. **`bun test` advantages**: Uses `bunfig.toml` for config (already existing), Jest-compatible API, native coverage via `--coverage`, and works with `mock.module()` for module stubbing.
4. **React Testing Library compatible**: Works with `@testing-library/react` and `@testing-library/jest-dom` via `happy-dom` preload setup.

### Setup Pattern
- **Preload files** in `bunfig.toml`: `happydom.ts` (global DOM registry) + `testing-library.ts` (RTL matchers + cleanup)
- **`@happy-dom/global-registrator`** + **`@testing-library/react`** + **`@testing-library/jest-dom`** as dev dependencies
- **`fake-indexeddb`** for integration tests touching Dexie/IndexedDB
- **`mock.module()`** for mocking Dexie in unit tests
- **Zustand stores**: Test via `store.getState()` and reset via `beforeEach`

### Testing Architecture
- Unit tests: Zustand store logic (mock Dexie)
- Integration tests: DB operations (fake-indexeddb + mock.module("dexie"))
- Component tests: happy-dom + RTL (no real DB, mock store hooks)

---

## React 19 Patterns & Bun SPA Architecture

### Decision
Follow React 19 best practices combined with Bun's SPA pattern as documented in `AGENTS.md`.

### Key Patterns

**React 19 features applicable to Delega:**
- `useActionState` + `useFormStatus` for form handling (replaces manual `isPending` state)
- `use` hook for promise reading in render (conditional, unlike `useState`)
- `'use client'` boundaries for interactive components

**React Router v7 structure:**
- Public routes: `/`, `/delegar`, `/servicios`, `/contacto`, `/orden/:token`
- Protected admin routes: `/admin/*` with `React.lazy` + `Suspense`
- Layout routes for shared admin UI without URL segments (`<Route element={<AdminLayout />}>` with no `path`)
- Type-safe routing via `useParams<'id'>()` generics (library mode has no auto-generated types)

**Zustand state management:**
- Global stores via `create()` without provider (singleton pattern)
- `useSyncExternalStore` internally (React 19 compatible)
- No context provider needed for single-instance stores
- Provider pattern only for multi-tab or dependency injection scenarios

**TypeScript strict mode** (already configured in `tsconfig.json`):
- `strict: true`, `noFallthroughCasesInSwitch`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `verbatimModuleSyntax`
- Route params: `useParams() as { id: string }` or `useParams<'id'>()` in library mode

---

## Dexie.js (IndexedDB) Best Practices

### Decision
Follow established Dexie v4 patterns with improvements in schema typing, compound indexes, and migrations.

### Schema Design
- Use `EntityTable<Entity, PrimaryKey>` instead of bare `Table` for better type inference (Dexie 4+)
- PK strategy per entity:
  - `operators`: `string` (username) — small fixed set
  - `clients`: `string` (phone) — natural lookup key
  - `orders`: `string` (ORD-###) — counter from config
  - `subscriptions`: `string` (SUB-###) — counter from config
  - `activity_log`: `string` (auto-generated)
  - `config`: `string` ("app") — single-row table
  - `stats`: `string` (month key "YYYY-MM")
- Compound indexes on `orders`: `[operatorId+status]`, `[clientPhone+createdAt]` for common filter patterns

### Migration Strategy
- Use `db.version(N).stores({...}).upgrade(tx => ...)` chain
- Never modify existing versions — add new version for changes
- Plan `version(2)` for future schema additions (e.g., `paymentStatus`, `urgent`, `statusHistory` fields)
- Run upgrades sequentially in a single transaction; rollback on any failure

### Performance & Transactions
- Only index properties used in `where()` queries (Dexie best practice)
- Wrap multi-operation writes in `db.transaction("rw", db.orders, db.activity_log, ...)` for atomicity
- Use `bulkAdd`/`bulkPut` for seed data and migrations
- Iterate with `each()` or `limit()`+`offset()` instead of `toArray()` on large collections
- `db.transaction` also handles error propagation — rethrow errors you don't handle

### Error Handling
- Catch at the boundary (component or calling function), not inside store helpers
- Use Dexie error types: `Dexie.ConstraintError`, `Dexie.TransactionInactiveError`, `Dexie.QuotaExceededError`
- Handle `QuotaExceededError` gracefully (inform user, clean old activity_log)
- Use `Dexie.waitFor()` for async calls inside transactions (e.g., `crypto.subtle.digest`)

### Reactive Data with dexie-react-hooks
- `useLiveQuery(queryFn, deps?)` — nullable result (`undefined` initially)
- Compose complex queries inside `useLiveQuery` with `Promise.all` for reference resolution
- Keep hook layer thin — expose named hooks from `useDelegaDB.ts`
- `useOrderPermissions` is correctly non-reactive (permissions are derived computation, not DB query)

---

## Accessibility (WCAG 2.1 AA) for Educational Service in Venezuela

### Key Requirements

**Color Contrast (SC 1.4.3 AA, SC 1.4.11 AA):**
- Text must be ≥ 4.5:1 against background
- Brand colors (#3b82f6 blue, #10b981 green) only meet 3:1 — acceptable for UI components only (not text)
- Use `--color-foreground: #1a1a2e` (≈15:1), `--color-muted-foreground: #52525b` (≈5.5:1)
- Status colors must also meet contrast (green/red for success/error)
- Never use color alone to convey information — always pair with icon/text/pattern

**Keyboard Navigation (SC 2.1.1, 2.1.2, 2.4.3, 2.4.7):**
- All interactive elements focusable and operable by keyboard
- Logical focus order in forms and tables
- Visible focus indicator (ring) on all interactive elements
- Skip link: `<a href="#main-content" className="sr-only focus:not-sr-only">`
- Tables: `<th scope="col">`, `<caption>` (screen reader only)
- Interactive table rows: `tabIndex={0}` with `aria-label`

**ARIA Patterns (SC 1.3.1, 4.1.2, 4.1.3):**
- Status indicators: `role="status"` + `aria-live="polite"`
- Progress bar: `role="progressbar"` with `aria-valuenow/min/max`
- Alert messages: `role="alert"` with `aria-live="assertive"`
- Modal confirmations: `role="dialog"` + `aria-modal="true"`
- Sidebar nav: `aria-current="page"` on active `NavLink`
- Form fields: `<Label htmlFor={id}>` associated with `<Input id={id}>`
- Fieldset/legend for grouped controls (service selector)

**Mobile Patterns (SC 1.3.4, 1.4.10, 1.4.13, 2.5.5):**
- Touch targets ≥ 44×44px (`min-h-[44px] min-w-[44px]`)
- No orientation locking
- Hover-only interactions must have focus/tap equivalent
- Responsive sidebar (collapsible on mobile)
- `@media (hover: none)` for touch-specific adjustments

**Spanish-Language Clarity (adapted WCAG 3.1.5):**
- Write content at ≤ secondary education reading level
- Short sentences (≤ 15 words), everyday vocabulary
- Clear form labels with contextual help text
- Example: "Número de WhatsApp (con código de país, ejemplo: 584121234567)"
- Error messages must identify the specific problem AND how to fix it

### Priority Actions
1. **High**: `styles/globals.css` with `@theme` using contrast-verified colors
2. **High**: Skip link + `aria-current` on admin sidebar
3. **High**: `min-h-[44px]` on all touch targets
4. **Medium**: `role="progressbar"` in order tracking
5. **Medium**: `role="status"`/`aria-live` on order status indicators
6. **Medium**: `<fieldset>` + `<legend>` on grouped form controls
7. **Low**: Mobile-responsive sidebar in `AdminLayout`
8. **Low**: `@media (forced-colors: active)` for Windows High Contrast Mode

---

## Vercel Static Hosting Best Practices

### Decision
Deploy as a static SPA on Vercel (free tier) with SPA rewrite configuration.

### Key Configuration
- **`vercel.json`**: Single rewrite rule to handle client-side routing — all paths rewrite to `/index.html`
- **Static export**: `bun run build.ts` produces `dist/` with all assets
- **Environment variables**: `BUN_PUBLIC_*` prefix for client-visible vars (WhatsApp number, tracking salt, operator pass hashes)
- **Free tier**: Vercel Hobby plan is sufficient for this low-traffic SPA
- **No server functions needed**: Entire app is client-rendered; no Edge Functions or serverless required
- **CDN**: Vercel automatically serves static assets from CDN edge locations

### CI/CD Pattern
- Push to `main` branch triggers automatic build and deploy
- Preview deployments for feature branches (like `003-fuente-clientes`, `002-gestion-ordenes`)
- No build step in `package.json` — `bun run build.ts` handles everything