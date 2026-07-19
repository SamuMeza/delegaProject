---
description: "Task list for App Foundation (PRIORIDAD 1) - Delega"
---

# Tasks: App Foundation (Fundación de la App)

**Input**: Design documents from `/specs/001-app-foundation/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not requested in the feature specification. Validation is via `quickstart.md` manual scenarios (build, typecheck, persistence, login, route protection, deploy). No automated test tasks included.

**Organization**: Tasks are grouped by user story (the 5 foundation tasks 1.1–1.5 from spec.md) to enable independent implementation and testing.

**Focus**: Cobertura de los requisitos del spec (FR-1 a FR-5), alineación con la constitución (local-first, 2 operadores con cuentas separadas, sin backend) y validación vía quickstart.md.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1..US5)
- Include exact file paths in descriptions

## Path Conventions

- Single project (frontend-only SPA): `src/`, `styles/`, config files at repository root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for a static React + TS + Tailwind build deployable to Vercel.

- [ ] T001 Create/verify React 19 + TypeScript + Tailwind v4 project scaffold (src/frontend.tsx, src/App.tsx, src/index.html, styles/globals.css, build.ts)
- [ ] T002 Configure Vercel static deploy: create/verify vercel.json with SPA rewrite to index.html
- [ ] T003 [P] Add .env.example with BUN_PUBLIC_OPERATOR_1_PASS_HASH and BUN_PUBLIC_OPERATOR_2_PASS_HASH (owner-defined SHA-256 hashes)
- [ ] T004 [P] Verify bunfig.toml and package.json scripts (build, dev) use Bun and BUN_PUBLIC_* env prefix
- [ ] T005 [P] Confirm tsconfig.json has strict: true (no any; prefer unknown + type guards)

**Checkpoint**: Project builds statically and is ready to connect to Vercel.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

- [ ] T006 Implement Dexie database instance and stores in src/lib/db/delegaDb.ts (operators [key id, index username], config [key id], plus orders/clients/subscriptions/activityLog declared per manual §2.2)
- [ ] T007 [P] Define strict TypeScript entity types in src/lib/types/index.ts (Operator, Config, Session, OrderStatus, ServiceType, etc. per data-model.md)
- [ ] T008 Implement first-run seeding in src/lib/db/seed.ts: if config empty, insert default config with sessionTimeoutHours, orderCounter=0, subscriptionCounter=0, and priceRanges; insert two operators with separate accounts (username + passwordHash from env)
- [ ] T009 [P] Implement session module in src/lib/auth/session.ts: save/load/clear Session in localStorage with expiresAt; isExpired() check
- [ ] T010 [P] Implement password hashing util in src/lib/auth/hash.ts using Web Crypto SHA-256 (no plaintext storage)

**Checkpoint**: Foundation ready — Dexie stores, types, seeding, session and hashing utilities exist. User stories can now begin.

---

## Phase 3: User Story 1 - Setup de proyecto + Vercel (Priority: P1) 🎯 MVP

**Goal**: Repo conectado a Vercel, deploy automático, build exitoso (spec §FR-1).

**Independent Test**: `bun run build` produces dist/ without errors; connecting repo to Vercel yields an accessible URL serving the SPA. (quickstart.md Q1, Q6)

- [ ] T011 [US1] Connect repository to Vercel and verify automatic deploy on push (manual/vercel step)
- [ ] T012 [US1] Validate vercel.json SPA rewrite serves index.html for unknown routes so all client-side routes work after manual deploy from Vercel (src via build.ts → dist/)
- [ ] T013 [US1] Run `bun run build` and confirm exit 0 with dist/index.html generated

**Checkpoint**: Build is reproducible and deployable to static host.

---

## Phase 4: User Story 2 - Configuración de IndexedDB (Priority: P1)

**Goal**: Stores, índices y valores iniciales (operators, config) creados y persistentes (spec §FR-2).

**Independent Test**: On first app load with empty storage, operators (2) and config (1) exist in IndexedDB and survive reload (100% retention, SC-2). (quickstart.md Q3)

- [ ] T014 [US2] Wire seeding call into app bootstrap so stores populate on first run (src/frontend.tsx or src/lib/db)
- [ ] T015 [US2] Verify indices: operators indexed by username; config keyed by fixed id (src/lib/db/delegaDb.ts)
- [ ] T016 [US2] Confirm seeded data is queryable via Dexie and not duplicated on subsequent loads

**Checkpoint**: Local persistence and seeding verified in browser DevTools.

---

## Phase 5: User Story 3 - Hook de IndexedDB (Priority: P1)

**Goal**: Abstracción reactiva para leer/escribir en stores desde React (spec §FR-3).

**Independent Test**: A component using the hook reflects store changes live without manual reload (list/create/update). (contracts not required; verified via UI reactivity)

- [ ] T017 [US3] Implement useDelegaDB hook in src/hooks/useDelegaDB.ts wrapping dexie-react-hooks (useLiveQuery) for operators/config
- [ ] T018 [US3] Expose typed read/write helpers (getConfig, upsertOperator, etc.) hiding Dexie details from screens
- [ ] T019 [US3] Use the hook in at least one existing placeholder page to prove reactivity

**Checkpoint**: Screens can read/write local data reactively through the abstraction.

---

## Phase 6: User Story 4 - Sistema de autenticación (Priority: P1)

**Goal**: Login user/pass contra hashes, sesión en localStorage, expiración (spec §FR-4, contracts §C1).

**Independent Test**: Valid credentials → panel access + persisted session; invalid → rejected; after sessionTimeoutHours → auto logout/redirect. (quickstart.md Q4; SC-3, SC-5)

- [ ] T020 [US4] Implement useAuth hook in src/hooks/useAuth.ts: login(username, password) compares SHA-256 against operator.passwordHash; on success create Session
- [ ] T021 [US4] Enforce no-plaintext: only passwordHash stored; reject on mismatch with generic "Credenciales incorrectas"
- [ ] T022 [US4] Implement logout (cerrar sesión) clearing Session from localStorage and redirect to /admin/login
- [ ] T023 [US4] Implement expiration: on protected access, if now > expiresAt clear session and redirect to login
- [ ] T024 [US4] Protect session timeout value via config.sessionTimeoutHours (read from Config entity)

**Checkpoint**: Auth flow complete: login, logout, expiration, rejection of invalid creds.

---

## Phase 7: User Story 5 - Layout del panel admin (Priority: P1)

**Goal**: Sidebar, header, área de contenido, logout, protección de rutas (spec §FR-5, contracts §C2).

**Independent Test**: Authenticated user sees sidebar+header+content; logout works; any /admin/* without session redirects to login; 100% routes protected (SC-4). (quickstart.md Q5)

- [ ] T025 [US5] Implement route guard (AdminGuard) in src/App.tsx protecting /admin/* except /admin/login
- [ ] T026 [US5] Build AdminLayout in src/pages/admin/AdminLayout.tsx with sidebar (sections: Dashboard, Órdenes, Clientes, Suscripciones, Estadísticas, Log) + header showing operator identity
- [ ] T027 [US5] Add logout (cerrar sesión) button in header wired to useAuth.logout (src/pages/admin/AdminLayout.tsx)
- [ ] T028 [US5] Ensure each sidebar section renders a placeholder content area (no broken routes)

**Checkpoint**: Panel structure and route protection complete.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories; final validation.

- [ ] T029 [P] Run `bun x tsc --noEmit` and resolve all strict-type errors across src/
- [ ] T030 [P] Run quickstart.md end-to-end validation (Q1–Q6) and document results
- [ ] T031 [P] Address accessibility basics for login/panel (labels, focus, contrast) flagged in checklist CHK034 (AGENTS.md)
- [ ] T032 [P] Handle edge cases from checklist: corrupted/expired localStorage session (CHK026) and partial seeding (CHK027) in src/lib/auth/session.ts / src/lib/db/seed.ts
- [ ] T033 Documentation: note operator credential setup in README / .env.example

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories.
- **User Stories (Phase 3–7)**: All depend on Foundational (Phase 2). Can proceed sequentially (P1 order) or in parallel if staffed.
- **Polish (Phase 8)**: Depends on all desired user stories complete.

### User Story Dependencies

- **US1 (Setup/Vercel)**: after Phase 2. Independent of US2–US5 for build; deploy verifies whole app.
- **US2 (IndexedDB)**: after Phase 2 (needs T006–T008). Independent.
- **US3 (Hook)**: after US2 (needs stores). Independent of US4/US5.
- **US4 (Auth)**: after Phase 2 (needs T009, T010). Independent of US3/US5.
- **US5 (Layout)**: after US4 (needs useAuth) and Phase 2. Depends on US4.

### Within Each User Story

- Foundational utils before story features.
- Models/types (Phase 2) before hooks/services.
- Core implementation before integration with layout (US5 depends on US4).

### Parallel Opportunities

- Setup tasks T003, T004, T005 marked [P] run in parallel.
- Foundational T007, T009, T010 marked [P] run in parallel (within Phase 2).
- After Foundational: US2, US3, US4 can start in parallel (US5 waits for US4).
- Polish T029–T033 marked [P] can run in parallel.

---

## Parallel Example: User Story 4 (Auth)

```bash
# Launch independent auth pieces together:
Task: "Implement useAuth hook login flow in src/hooks/useAuth.ts"
Task: "Implement expiration check on protected access"
# (logout and timeout wiring depend on useAuth, run after)
```

---

## Implementation Strategy

### MVP First (User Story 1 + Foundation)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (build/deploy)
4. **STOP and VALIDATE**: run quickstart Q1/Q6 (build + deploy)
5. Demo if ready

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. US1 (build/deploy) → deployable SPA (MVP!)
3. US2 (IndexedDB) → persistence
4. US3 (Hook) → reactive data
5. US4 (Auth) → login/logout
6. US5 (Layout) → protected panel
7. Each story adds value; previous stories keep working

### Parallel Team Strategy

With multiple developers:
1. Team completes Setup + Foundational together
2. Once Foundational done:
   - Developer A: US2 + US3 (data)
   - Developer B: US4 (auth)
   - Then US5 (layout) after US4

---

## Notes

- [P] tasks = different files, no dependencies.
- [Story] label maps task to specific user story for traceability (US1–US5).
- Each user story is independently completable and testable per its Independent Test.
- Commit after each task or logical group.
- Stop at any checkpoint to validate the story independently.
- Avoid: vague tasks, same-file conflicts, cross-story dependencies that break independence (US5→US4 is the only intentional dependency).
