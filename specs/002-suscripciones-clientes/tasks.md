---

description: "Task list for suscripciones-clientes feature"

---

# Tasks: Suscripciones y Clientes

**Input**: Design documents from `specs/002-suscripciones-clientes/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No tests requested in spec — test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single SPA**: `src/`, `tests/` at repository root
- All paths are relative to repository root

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify project readiness — the SPA is already initialized with React 19, Dexie 4, Tailwind 4, and shadcn/ui. No new dependencies required.

- [x] T001 Verify that existing Dexie schema (v1) in `src/lib/db/delegaDb.ts` has all needed tables: clients, subscriptions, orders, config — confirm `orders` already has `subscriptionId` index

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Types, DB migration, and shared utilities that ALL user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 [P] Add `CoverageTipo` type and update `SubscriptionStatus` to include `"reemplazada"` in `src/lib/types/index.ts`
- [x] T003 [P] Add `coverageTipo` field to the `Order` interface in `src/lib/types/index.ts`
- [x] T004 Migrate Dexie schema v1→v2 in `src/lib/db/delegaDb.ts`: add `name` index to `clients`, `status` index to `subscriptions`, `coverageTipo` index to `orders`
- [x] T005 [P] Create ID generation utility in `src/lib/id-gen.ts`: function `generateSubscriptionId()` that reads `Config.subscriptionCounter`, increments it, and returns `SUB-###` format
- [x] T006 [P] Add `useClients()` and `useClient(phone)` hooks in `src/hooks/useDelegaDB.ts`
- [x] T007 [P] Add `useSubscriptions()` and `useClientSubscriptions(phone)` hooks in `src/hooks/useDelegaDB.ts`

**Checkpoint**: Foundation ready — types are complete, DB has new indexes, ID generation works, hooks expose reactive data.

---

## Phase 3: User Story 1 — Registrar un cliente recurrente (Priority: P1) 🎯 MVP

**Goal**: Operadores pueden crear, listar, ver detalle y editar clientes.

**Independent Test**: Abrir `/admin/clientes`, crear cliente "María Pérez" con teléfono "0412-1234567", verlo en la lista, hacer clic para ver detalle con historial vacío.

### Implementation for User Story 1

- [x] T008 [P] [US1] Implement `ClientsListPage` in `src/pages/admin/ClientsListPage.tsx`: query all clients via `db.clients.toArray()`, display table with columns: nombre, teléfono, suscripción activa, órdenes del mes, y badge de alerta (≤15 días restantes); add link to `/admin/clientes/:phone`
- [x] T009 [P] [US1] Implement `ClientDetailPage` in `src/pages/admin/ClientDetailPage.tsx`: fetch client by `phone` from route param `useParams()`, display name/phone/email/notes, show subscription status if exists
- [x] T010 [US1] Add inline create/edit client form in `ClientDetailPage.tsx`: fields for name, phone, email, notes; on submit call `db.clients.put()`; show success/error feedback
- [x] T011 [US1] Add order history section in `ClientDetailPage.tsx`: query `db.orders.where("clientPhone").equals(phone).toArray()`, display as table (id, service, status, price, date), show "Sin órdenes registradas" when empty
- [x] T012 [US1] Add client deactivation (soft-delete) in `ClientDetailPage.tsx`: confirm dialog, rename as "[desactivado] name", hide from default list query; prevent deactivation if client has active subscription

**Checkpoint**: US1 fully functional — operators can manage clients and see order history.

---

## Phase 4: User Story 2 — Crear una suscripción trimestral (Priority: P1)

**Goal**: Operadores pueden crear suscripciones trimestrales vinculadas a un cliente, con cupo configurable y fecha de fin calculada automáticamente.

**Independent Test**: Desde detalle de un cliente, crear suscripción básica con cupo 5, verificar ID `SUB-001`, fechas correctas, y que aparece como activa en el detalle.

### Implementation for User Story 2

- [x] T013 [P] [US2] Add subscription creation form in `ClientDetailPage.tsx` (or as inline section): fields for type (select `SubscriptionType`), monthlyQuota (number input), price (number input, default $25); calculate endDate = startDate + 3 months
- [x] T014 [US2] Implement subscription save logic in `ClientDetailPage.tsx`: wrap in Dexie transaction — generate ID via `generateSubscriptionId()`, insert into `db.subscriptions`, update `Client.subscription` embedded field, log activity via `db.activity_log.add()`
- [x] T015 [P] [US2] Add `SubscriptionCard` inline component showing subscription status, monthlyQuota, usedPerMonth, startDate, endDate, next renewal date in `ClientDetailPage.tsx`
- [x] T016 [US2] Enforce FR-008 (one active subscription per client): before creating new subscription, check for existing active subscription, mark it as `"reemplazada"` in the same transaction

**Checkpoint**: US2 fully functional — subscriptions can be created, viewed, and replace previous ones.

---

## Phase 5: User Story 3 — Control de cupo al crear orden (Priority: P2)

**Goal**: Al crear una orden para un cliente con suscripción activa, el sistema verifica `usedPerMonth` vs `monthlyQuota` y asigna `coverageTipo` automáticamente.

**Independent Test**: Crear cliente con suscripción (cupo 3), crear 3 órdenes (cubiertas), crear 4ta orden (suelta con 20% descuento), verificar `coverageTipo` en cada orden.

### Implementation for User Story 3

- [x] T017 [P] [US3] Create cupo verification utility in `src/lib/cupo.ts`: function `checkCoverage(clientPhone)` that fetches active subscription, checks `usedPerMonth` for current month `YYYY-MM`, returns coverage type and available quota
- [ ] T018 [US3] Integrate cupo verification into order creation flow — **BLOCKED**: order creation UI is a separate feature (`src/pages/admin/OrdersListPage.tsx` and `OrderDetailPage.tsx` are stubs)
- [ ] T019 [US3] Apply 20% discount logic — **BLOCKED**: requires order creation UI (T018)

**Checkpoint**: US3 fully functional — cupo verification and discount are automatic when creating orders.

---

## Phase 6: User Story 4 — Renovación y vencimiento (Priority: P3)

**Goal**: Operadores pueden renovar suscripciones próximas a vencer. El dashboard muestra alertas para suscripciones ≤15 días del vencimiento.

**Independent Test**: Crear suscripción con endDate en 10 días, ver alerta en dashboard, renovar, ver nuevo período. Crear orden con suscripción vencida, verificar precio estándar.

### Implementation for User Story 4

- [x] T020 [P] [US4] Add renew subscription action in `ClientDetailPage.tsx`: button "Renovar" visible when status is `"activa"` and endDate is ≤30 days; on click, create new subscription with new period (startDate = current endDate + 1 day, endDate = startDate + 3 months), mark previous as `"reemplazada"`
- [x] T021 [US4] Add cancel subscription action in `ClientDetailPage.tsx`: confirm dialog, set status to `"cancelada"`, clear `Client.subscription` embedded field, log activity
- [x] T022 [US4] Create `RenewalAlerts` section in `DashboardPage.tsx`: query `db.subscriptions.where("status").equals("activa").filter(s => daysUntilEnd(s.endDate) <= 15).toArray()`, display as banner/list with client name, days remaining, link to client detail
- [x] T023 [US4] Implement FR-010 (vencida = no cupo check) in cupo verification: when fetching active subscription, filter by `status === "activa"` AND `endDate > today` — if none found, return `"estandar"` without cupo check

**Checkpoint**: US4 fully functional — subscriptions can be renewed/canceled, dashboard shows alerts, expired subs don't affect pricing.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Seed data, activity logging, and final validation.

- [x] T024 Add seed client data in `src/lib/db/seed.ts`: insert 2-3 demo clients into `db.clients` if table is empty (idempotent)
- [x] T025 [P] Add activity log entries for all new actions: `create_client`, `update_client`, `create_subscription`, `cancel_subscription`, `renew_subscription` — add to `ActionType` in `src/lib/types/index.ts` if missing
- [x] T026 Run build validation: `bun run build.ts` — verify no TS errors in modified files
- [x] T027 Run quickstart validation scenarios from `specs/002-suscripciones-clientes/quickstart.md`

---

## Phase 8: Convergence

**Purpose**: Close gaps found between spec and implementation after initial implement pass.

- [x] T028 Add `email` and `notes` fields to `Client` interface in `src/lib/types/index.ts`, and update create/edit handlers in `ClientsListPage.tsx` and `ClientDetailPage.tsx` to persist them per FR-001 (missing)
- [x] T029 Add "Último contacto" column to client table in `ClientsListPage.tsx` showing the most recent order date (or client creation date if no orders) per US1/AC1 (missing)

---

## Phase 9: Convergence

**Purpose**: Close remaining implementation gaps identified after second implement pass.

- [x] T030 Add configurable "fecha de inicio" (date input) to the subscription creation form in `ClientDetailPage.tsx`; calculate endDate from the chosen startDate per US2/AC1 (partial)
- [x] T031 Add active-subscription check before deactivation in `handleDeactivate` in `ClientDetailPage.tsx`; block with alert if client has active subscription per T012/FR-001 edge case (partial)
- [x] T032 Enrich `RenewalAlerts` in `DashboardPage.tsx` to fetch and display client name (via `db.clients.get(sub.clientPhone)`) instead of just the phone number per T022/US2/AC3 (partial)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — project is already initialized
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational completion
  - US1 (P1) → US2 (P1) → US3 (P2) → US4 (P3) must be sequential
  - US1 is prerequisite for US2 (need client before subscription)
  - US2 is prerequisite for US3 (need subscription before cupo check)
  - US3 is prerequisite for US4 (cupo logic shared with renewal)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — No dependencies on other stories
- **US2 (P1)**: Depends on US1 (needs client data)
- **US3 (P2)**: Depends on US2 (needs subscription data)
- **US4 (P3)**: Depends on US2 and US3 (needs subscription + cupo logic)

### Within Each User Story

- Types/models before logic
- Logic before UI integration
- Core implementation before edge cases

### Parallel Opportunities

- T002, T003 in Phase 2 can run in parallel (different types)
- T005, T006, T007 in Phase 2 can run in parallel (different files)
- T008, T009 in Phase 3 can run in parallel (list + detail pages)
- T013, T015 in Phase 4 can run in parallel (form + card)
- T017 in Phase 5 is independent (utility function)
- T020, T021 in Phase 6 can run in parallel (renew + cancel)
- T024, T025 in Phase 7 can run in parallel (seed + log types)

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Launch all Phase 2 tasks together:
Task: "T002 Add CoverageTipo type in src/lib/types/index.ts"
Task: "T003 Add coverageTipo to Order in src/lib/types/index.ts"
Task: "T004 Migrate Dexie v1->v2 in src/lib/db/delegaDb.ts"
Task: "T005 Create generateSubscriptionId in src/lib/id-gen.ts"
Task: "T006 Add useClients/useClient hooks in src/hooks/useDelegaDB.ts"
Task: "T007 Add useSubscriptions hooks in src/hooks/useDelegaDB.ts"
```

## Parallel Example: User Story 1

```bash
# Launch list + detail pages together:
Task: "T008 Implement ClientsListPage in src/pages/admin/ClientsListPage.tsx"
Task: "T009 Implement ClientDetailPage in src/pages/admin/ClientDetailPage.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (types + DB + ID gen + hooks)
2. Complete Phase 3: User Story 1 — CRUD clientes
3. **STOP and VALIDATE**: Test client CRUD independently
4. Deploy/demo if ready

### Incremental Delivery

1. Phase 2 → Phase 3 → Foundation + Client CRUD ready
2. Add Phase 4 (subscriptions) → Test independently → Demo
3. Add Phase 5 (cupo control) → Test independently → Demo
4. Add Phase 6 (renewal + alerts) → Test independently → Demo

### Parallel Team Strategy

No aplica — proyecto de 2 operadores, implementación secuencial.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each phase or logical group
- Stop at any checkpoint to validate story independently
- No new npm/bun dependencies required — all feature work is in existing stack (Dexie, React, Zustand)
- Existing page stubs `ClientsListPage.tsx`, `ClientDetailPage.tsx`, `SubscriptionsPage.tsx` are replaced entirely