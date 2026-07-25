# Tasks: Reportes, Auditoría y Pulido

**Input**: Design documents from `/specs/004-reportes-auditoria-pulido/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Not explicitly requested in feature specification - test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root
- **Components**: `src/components/`
- **Hooks**: `src/hooks/`
- **Pages**: `src/pages/admin/`
- **Lib**: `src/lib/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Verify Dexie database schema includes activityLog table with required indexes in `src/lib/db/delegaDb.ts`
- [x] T002 Verify ActivityLogEntry type exists with required fields (id, operatorId, action, targetId, descripción, timestamp) in `src/lib/types/index.ts`
- [x] T003 [P] Add ActionType enum values if missing (login, logout, create_order, update_order, delete_order, add_note, upload_file, change_status, create_client, update_client, create_subscription, cancel_subscription, renew_subscription) in `src/lib/types/index.ts`
- [x] T004 [P] Verify shadcn/ui components available (Card, Button, Badge, Tabs, Select, Input, Toast, Skeleton) in `src/components/ui/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create useActivityLog hook with filtering, pagination (default 50 items/page per FR-003), and error handling in `src/hooks/useActivityLog.ts`
- [x] T006 [P] Create useStatistics hook with real-time monthly calculation in `src/hooks/useStatistics.ts`
- [x] T007 [P] Create useNotifications hook with Web Notifications API, sound, and title indicator in `src/hooks/useNotifications.ts`
- [x] T008 [P] Create useExport hook with JSON Blob download in `src/hooks/useExport.ts`
- [x] T009 [P] Create useBreakpoint hook for responsive detection (breakpoints: 320px, 375px, 768px, 1024px, 1920px) in `src/hooks/useBreakpoint.ts`
- [x] T010 [P] Create useKeyboardNavigation hook for focus management in `src/hooks/useKeyboardNavigation.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Activity Log del operador (Priority: P1) 🎯 MVP

**Goal**: Un operador quiere ver un registro cronológico de todas las acciones realizadas en el panel para saber quién hizo qué y cuándo, y poder filtrar por operador, fecha o tipo de acción para investigar un evento específico.

**Independent Test**: Puede probarse abriendo el panel de actividad, realizando varias acciones (crear orden, cambiar estado, actualizar cliente), y verificando que cada una aparece en el log con operador, fecha y tipo de acción. Los filtros deben reducir correctamente los resultados.

### Implementation for User Story 1

- [x] T011 [P] [US1] Create ActivityLogEntry component with timestamp, operator, action type, and details display in `src/components/ActivityLogEntry.tsx`
- [x] T012 [P] [US1] Create ActivityLogFilters component with operator, action type, and date range selectors in `src/components/ActivityLogFilters.tsx`
- [x] T013 [P] [US1] Create ActivityLogPagination component with page navigation and total count display in `src/components/ActivityLogPagination.tsx`
- [x] T014 [US1] Create ActivityLogPage component that composes filters, entry list, and pagination in `src/pages/admin/ActivityLogPage.tsx`
- [x] T015 [US1] Add Activity Log route to admin router in `src/App.tsx`
- [x] T016 [US1] Integrate useActivityLog hook with ActivityLogPage for data fetching and filtering
- [x] T017 [US1] Add empty state messaging for no activity data in `src/pages/admin/ActivityLogPage.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Estadísticas mensuales del negocio (Priority: P1)

**Goal**: Un operador quiere ver un resumen visual del mes actual con indicadores de ingresos estimados, órdenes por estado y distribución por operador, para tomar decisiones informadas sobre capacidad y precios.

**Independent Test**: Puede probarse abriendo la sección de estadísticas después de tener varias órdenes en distintos estados. Deben mostrarse totales correctos y distribución por operador coincidiendo con los datos reales.

### Implementation for User Story 2

- [x] T018 [P] [US2] Create StatsCard component with title, value, description, icon, and trend indicator in `src/components/StatsCard.tsx`
- [x] T019 [P] [US2] Create OrderStatusChart component for status distribution visualization in `src/components/OrderStatusChart.tsx`
- [x] T020 [P] [US2] Create OperatorDistributionChart component for operator breakdown in `src/components/OperatorDistributionChart.tsx`
- [x] T021 [US2] Create StatisticsPage component that composes stats cards and charts in `src/pages/admin/StatisticsPage.tsx`
- [x] T022 [US2] Add Statistics route to admin router in `src/App.tsx`
- [x] T023 [US2] Integrate useStatistics hook with StatisticsPage for real-time data
- [x] T024 [US2] Add empty state messaging for no statistics data in `src/pages/admin/StatisticsPage.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Exportación manual de datos (Priority: P2)

**Goal**: Un operador quiere descargar un archivo JSON con todos los datos de la aplicación para tener un respaldo externo en caso de pérdida del navegador.

**Independent Test**: Puede probarse haciendo clic en el botón de exportación, verificando que se descarga un archivo JSON, y luego inspeccionando que el archivo contiene todas las tablas de datos (órdenes, clientes, suscripciones, operadores, actividad).

### Implementation for User Story 3

- [x] T025 [P] [US3] Create ExportButton component with loading state and download trigger in `src/components/ExportButton.tsx`
- [x] T026 [US3] Create ExportPage component with export options and button in `src/pages/admin/ExportPage.tsx`
- [x] T027 [US3] Add Export route to admin router in `src/App.tsx`
- [x] T028 [US3] Integrate useExport hook with ExportPage for data export functionality
- [x] T029 [US3] Add success/error feedback for export operation in `src/pages/admin/ExportPage.tsx`

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Notificación de nueva orden (Priority: P3)

**Goal**: Un operador quiere recibir una alerta visual y sonora cuando llega una nueva solicitud desde la landing page, para poder atenderla sin tener que recargar constantemente el panel.

**Independent Test**: Puede probarse simulando el registro de una nueva orden desde otra pestaña o herramienta, y verificando que el panel muestra una notificación y reproduce un sonido sin recarga manual.

### Implementation for User Story 4

- [x] T030 [P] [US4] Create NotificationToast component with title, body, auto-dismiss, and action button in `src/components/NotificationToast.tsx`
- [x] T031 [P] [US4] Create notification sound file or reference in `public/sounds/notification.mp3` (or similar)
- [x] T032 [US4] Integrate useNotifications hook with order creation flow to trigger notifications
- [x] T033 [US4] Add tab title indicator logic for background tabs in `src/hooks/useNotifications.ts`
- [x] T034 [US4] Add notification permission request flow in `src/hooks/useNotifications.ts`
- [x] T035 [US4] Integrate NotificationToast component with admin panel layout in `src/App.tsx` or layout component

**Checkpoint**: At this point, User Stories 1, 2, 3, AND 4 should all work independently

---

## Phase 7: User Story 5 - Experiencia móvil y accesible (Priority: P3)

**Goal**: Un operador quiere poder usar el panel desde un teléfono o tablet cuando no está frente a su computadora, y que los textos tengan suficiente contraste para leer sin esfuerzo.

**Independent Test**: Puede probarse abriendo el panel en un navegador móvil (o viewport de 375px) y verificando que todas las pantallas principales son navegables sin scroll horizontal y con texto legible.

### Implementation for User Story 5

- [x] T036 [P] [US5] Audit and update all page components for responsive layout (mobile-first) in `src/pages/admin/`
- [x] T037 [P] [US5] Add focus-visible styles for keyboard navigation across all interactive elements in `src/index.css` or Tailwind config
- [x] T038 [P] [US5] Verify color contrast ratios meet WCAG 2.1 AA (4.5:1 normal, 3:1 large) for all text elements
- [x] T039 [US5] Add skip navigation links for keyboard users in `src/App.tsx` or layout component
- [x] T040 [US5] Add ARIA landmark roles (main, nav, aside) to page structure in `src/App.tsx`
- [x] T041 [US5] Test and fix horizontal scroll issues at 320px, 375px, 768px, 1024px viewports
- [x] T042 [US5] Verify all form fields have associated labels for screen readers in `src/pages/admin/`
- [x] T043 [US5] Add aria-live regions for dynamic content updates (notifications, statistics) in `src/components/`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T044 [P] Add quick access buttons for Activity Log, Statistics, and Export to Dashboard in `src/pages/admin/DashboardPage.tsx`
- [x] T045 [P] Verify all components follow shadcn/ui patterns and Tailwind v4 conventions
- [x] T046 [P] Run quickstart.md validation scenarios to verify end-to-end functionality
- [x] T047 Code cleanup and refactoring across all new components
- [x] T048 Performance optimization for Activity Log with 10k+ records
- [x] T049 Documentation updates for new features in `docs/` if needed
- [x] T050 [US1] Measure and verify Activity Log filter response time meets <10s threshold using 10k+ records in `src/hooks/useActivityLog.ts`
- [x] T051 [US3] Measure and verify export download time meets <1s threshold for up to 10MB data in `src/hooks/useExport.ts`
- [x] T052 [US4] Measure and verify notification delivery time meets <2s threshold from IndexedDB persistence to toast visible in `src/hooks/useNotifications.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P1 → P2 → P3 → P3)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (Activity Log, P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (Statistics, P1)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (Export, P2)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable
- **User Story 4 (Notifications, P3)**: Can start after Foundational (Phase 2) - Requires order creation flow integration
- **User Story 5 (Responsive/Accessibility, P3)**: Can start after Foundational (Phase 2) - Affects all existing components

### Within Each User Story

- Components before page composition
- Hooks before component integration
- Core implementation before edge cases
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All components within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all components for User Story 1 together:
Task: "Create ActivityLogEntry component in src/components/ActivityLogEntry.tsx"
Task: "Create ActivityLogFilters component in src/components/ActivityLogFilters.tsx"
Task: "Create ActivityLogPagination component in src/components/ActivityLogPagination.tsx"

# Then compose the page:
Task: "Create ActivityLogPage in src/pages/admin/ActivityLogPage.tsx"
```

---

## Parallel Example: User Story 2

```bash
# Launch all chart components for User Story 2 together:
Task: "Create StatsCard component in src/components/StatsCard.tsx"
Task: "Create OrderStatusChart component in src/components/OrderStatusChart.tsx"
Task: "Create OperatorDistributionChart component in src/components/OperatorDistributionChart.tsx"

# Then compose the page:
Task: "Create StatisticsPage in src/pages/admin/StatisticsPage.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Activity Log)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Activity Log) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (Statistics) → Test independently → Deploy/Demo
4. Add User Story 3 (Export) → Test independently → Deploy/Demo
5. Add User Story 4 (Notifications) → Test independently → Deploy/Demo
6. Add User Story 5 (Responsive/Accessibility) → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Activity Log)
   - Developer B: User Story 2 (Statistics)
   - Developer C: User Story 3 (Export)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All tasks use existing entities (ActivityLogEntry, Order, Client, Subscription, Operator, Config) - no new data models required
- Performance targets: Activity Log filter <500ms, Export <1s, Notifications <2s
- Responsive targets: 320px to 1920px viewport range
- Accessibility targets: WCAG 2.1 AA (4.5:1 contrast, keyboard navigation)

---

## Phase 9: Convergence

**Purpose**: Close gaps between spec/plan/tasks and actual implementation

- [x] T053 Create notification sound file at `public/sounds/notification.mp3` (or remove sound requirement from useNotifications) per T031/FR-006 (missing)
- [x] T054 Integrate notification trigger into order creation flow in `src/lib/orders/service.ts` — call `notify()` when new order is persisted per T032/FR-006 (missing)
- [x] T055 Add aria-live regions to NotificationToast and StatisticsPage for dynamic content updates per T043/FR-009 (missing)
- [x] T056 Remove duplicate `logActivity` from `src/hooks/useActivityLog.ts` or refactor to use single implementation per `src/lib/db/activity.ts` (partial)
- [x] T057 Verify color contrast ratios (4.5:1) and horizontal scroll at 320px/375px/768px/1024px viewports per T038/T041/FR-010/FR-008 (partial)