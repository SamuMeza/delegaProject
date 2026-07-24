# Tasks: Landing + Formulario (Fuente de Clientes)

**Input**: Design documents from `/specs/003-fuente-clientes/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification. No test tasks are included in this feature spec (no TDD requested).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for the landing pages

- [X] T001 Create landing page directory structure in src/pages/ with Home.tsx, Services.tsx, Contact.tsx, DelegatePage.tsx, OrderTrackingPage.tsx
- [X] T002 Create landing page components directory in src/components/landing/ with ServiceSelector.tsx, DynamicFields.tsx, PriceEstimator.tsx, WhatsAppGenerator.tsx
- [X] T003 [P] Configure routing in src/App.tsx with public routes: `/`, `/servicios`, `/contacto`, `/delegar`, `/orden/:token`
- [X] T004 [P] Configure bunfig.toml for testing with preload files (happydom.ts, testing-library.ts) and @happy-dom/global-registrator
- [X] T005 Add testing dependencies as devDependencies: @happy-dom/global-registrator, @testing-library/react, @testing-library/jest-dom, @testing-library/dom, fake-indexeddb

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before any user story can be implemented

- [X] T006 Create src/hooks/useDelegaDB.ts with useLiveQuery wrappers for reactive DB access to config table
- [X] T007 [P] Create src/lib/pricing.ts with price calculation logic for all 6 service types ($3-$15 per-task ranges)
- [X] T008 [P] Create src/lib/types/index.ts with TypeScript interfaces for ServiceType, OrderRequest, TrackingToken, Config, FAQ, PaymentStatus, PagoMovilData
- [X] T009 Create src/components/ui/ base wrapper components used across landing pages (Button, Input, Label, Card, Accordion)
- [X] T010 Configure env variables (.env.example) with BUN_PUBLIC_WHATSAPP_NUMBER and BUN_PUBLIC_TRACKING_SALT keys

**Checkpoint**: Foundation ready â€” user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Descubrir el servicio y consultar tarifas (Priority: P1) ðŸŽ¯ MVP

**Goal**: A student can arrive at the landing page, understand the service, check base pricing, and navigate to the form. Public pages are fully functional and responsive.

**Independent Test**: A visitor loads the landing page on desktop or mobile, reads the hero section and pricing, navigates to `/servicios`, views the full services table with all 6 types and quarterly plans, and clicks CTA to `/delegar` â€” all without any backend calls.

### Implementation for User Story 1

- [X] T011 [US1] Create src/pages/Home.tsx with Hero banner, 3-step process description, $3-$15 pricing summary, and CTA button linking to `/delegar`
- [X] T012 [US1] Create src/pages/Services.tsx with table of 6 service types (ensayo, presentacion, investigacion, formato, diseno, video), their base prices, and quarterly plan offer (~$25)
- [X] T013 [US1] Apply responsive mobile-first styling to Home and Services pages using Tailwind CSS v4 with brand colors `--brand-operator-1: #3b82f6` and `--brand-operator-2: #10b981`
- [X] T014 [US1] Implement navigation header/footer with links to Inicio, Servicios, Contacto across all public landing pages

**Checkpoint**: User Story 1 complete â€” landing page is fully functional and testable independently

---

## Phase 4: User Story 2 - Completar solicitud y enviar por WhatsApp (Priority: P1) ðŸŽ¯ MVP

**Goal**: A student can select a service, fill in conditional fields, see real-time price estimation, and send a WhatsApp message with a pre-filled token for tracking.

**Independent Test**: Fill the form at `/delegar` with a presentation service, enter number of slides, press submit, verify a WhatsApp `wa.me/` link opens with properly structured URL-encoded message containing all form data and a Base64 tracking token with SHA-256 verification hash.

### Implementation for User Story 2

- [X] T016 [US2] Create src/lib/config/serviceTypes.ts with static configuration of all 6 ServiceType values (ensayo, presentacion, investigacion, formato, diseno, video) and their conditional fields: ensayo (wordCount, academicLevel, subjectArea, citationStyle), presentacion (slideCount, topic, audienceLevel), investigacion (topic, wordCount, sourceCount, academicLevel), formato (formatType: APA/MLA/Chicago, documentType, pageCount), diseno (designType: logo/infographic/banner, dimensions, colorScheme), video (duration, style: explainer/tutorial/promo, resolution)
- [X] T017 [US2] Create src/components/landing/DynamicFields.tsx â€” renders conditional form fields based on selected ServiceType using the config from src/lib/config/serviceTypes.ts (e.g., word count for ensayo, slide count for presentacion)
- [X] T018 [US2] Create src/components/landing/PriceEstimator.tsx â€” integrates pricing.ts to show real-time estimated price (<100ms update per SC-001) as user changes parameters
- [X] T019 [US2] Create src/components/landing/WhatsAppGenerator.tsx â€” builds wa.me URL with BUN_PUBLIC_WHATSAPP_NUMBER from env vars, URL-encoded message with all order data, and Base64 tracking token (format: Base64(JSON.stringify(data) + '.' + SHA256(data + salt)))
- [X] T020 [US2] Create src/pages/DelegatePage.tsx â€” integrates ServiceSelector, DynamicFields, PriceEstimator, and WhatsAppGenerator into a single interactive form at `/delegar` with real-time validation
- [X] T021 [US2] Implement form validation in DelegatePage.tsx â€” validate required fields per ServiceType, show inline error messages below each field, disable WhatsApp CTA until all fields are valid
- [X] T022 [US2] Add WhatsApp fallback UI â€” when WhatsApp doesn't open or is cancelled, show "Copiar mensaje al portapapeles" button and a direct wa.me link on the success screen at `/delegar` for edge case handling
- [X] T022b [US2] Verify SC-002 compliance â€” test that every service type + field combination generates a valid `wa.me` URL with correct Base64+SHA256 token and no URL encoding errors in message parameters

**Checkpoint**: User Story 2 complete â€” form generates valid WhatsApp links with signed tracking tokens

---

## Phase 5: User Story 3 - Visualizar el estado de una orden sin backend (Priority: P2)

**Goal**: A student with a tracking link can view their order status, details, and progress without any server calls. Token integrity is verified via SHA-256 hash.

**Independent Test**: Load `/orden/TOKEN` with a valid tracking token â€” verify the page decodes the Base64 payload, verifies the SHA-256 hash, and displays order status, ID, date, price, and a timeline â€” all without any network calls. Load with a tampered token â€” verify the integrity check rejects it and shows an error message.

### Implementation for User Story 3

- [X] T023 [US3] Create src/pages/OrderTrackingPage.tsx â€” decodes Base64 token at `/orden/:token`, splits payload from signature, recomputes SHA-256 for verification, and renders order details or integrity error. Ensure decoding completes in <150ms (SC-003) with no blank-screen flash during render.
- [X] T024 [US3] Implement order status timeline UI in OrderTrackingPage.tsx with visual progress indicator showing states: nueva â†’ pendiente_pago â†’ en_progreso â†’ revision â†’ pendiente_final â†’ completada. Add `cancelada` as an error state displayed as a crossed-out exit on the timeline.
- [X] T025 [US3] Implement token tampering detection in OrderTrackingPage.tsx â€” on hash mismatch, display "Enlace no vÃ¡lido" error page with clean styling matching the public landing theme

**Checkpoint**: User Story 3 complete â€” tracking page works offline and validates token integrity

---

## Phase 6: User Story 4 - Resolver dudas y consultar Pago MÃ³vil (Priority: P3)

**Goal**: A student can navigate to `/contacto`, read FAQs, and find Pago MÃ³vil bank details from the IndexedDB config store.

**Independent Test**: Navigate to `/contacto`, expand FAQ accordion items, and verify Pago MÃ³vil data (Banco, RIF, TelÃ©fono) is displayed clearly and legibly. The Pago MÃ³vil data loads dynamically from IndexedDB `config` store.

### Implementation for User Story 4

- [X] T026 [US4] Create src/pages/ContactPage.tsx with FAQ accordion section, Pago MÃ³vil data display section, and legal/academic disclaimers
- [X] T027 [US4] Connect ContactPage.tsx FAQ and Pago MÃ³vil data to the `config` IndexedDB table via useDelegaDB hook â€” loading bank, RIF, phone, FAQs, and disclaimers dynamically from the `config` store
- [X] T028 [US4] Add responsive styling to ContactPage.tsx ensuring mobile readability of FAQ content and Pago MÃ³vil banking details

**Checkpoint**: User Story 4 complete â€” Contact page dynamically loads Pago MÃ³vil data from IndexedDB

---

## Phase 7: Admin Integration â€” Tracking Link Generation (FR-010)

**Purpose**: Enable operators to generate and send updated tracking links from the admin panel, so clients receive signed URLs with current order state.

- [X] T035 Create admin tracking link generator function in src/lib/tracking.ts â€” reuses the same Base64+SHA256 token format from WhatsAppGenerator to build `/orden/:token` URLs with current order data (id, status, price, dueDate, paymentStatus) signed with BUN_PUBLIC_TRACKING_SALT
- [X] T036 Add "Generar Enlace de Seguimiento" button to src/pages/admin/OrderDetail.tsx â€” calls tracking.ts to generate a signed URL and displays it in a copyable input field, with a "Copiar enlace" clipboard button for the operator to paste into WhatsApp

**Checkpoint**: Admin panel can generate signed tracking links on demand

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, performance, and quality improvements across all landing pages

- [X] T029 [P] Apply WCAG 2.1 AA accessibility to all landing pages â€” add skip link, `aria-current` on active nav, `min-h-[44px]` touch targets on all buttons, `aria-label` on icon-only elements, `role="progressbar"` on OrderTrackingPage timeline
- [X] T030 [P] Verify color contrast â‰¥ 4.5:1 for all text across landing pages using Tailwind v4 `@theme` tokens with `--color-foreground: #1a1a2e` and `--color-muted-foreground: #52525b`
- [X] T031 [P] Add `lang="es"` attribute to index.html and ensure all UI text is in Spanish with clear, simple language (â‰¤ secondary education reading level)
- [X] T032 [P] Add `@media (prefers-reduced-motion: reduce)` styles to globals.css to disable animations for users with vestibular disorders
- [X] T033 Run `bun run build.ts` to verify static build succeeds and all landing pages render correctly in the `dist/` output
- [X] T034 Run quickstart.md validation steps manually to confirm all user stories work end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies â€” can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion â€” BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US1 and US2 can run in parallel (different pages/components) once Foundational is done
  - US3 depends on US2 (uses the same token generation logic from DelegatePage)
  - US4 depends on Foundational phase only (uses useDelegaDB hook and config store)
- **Admin Integration (Phase 7)**: Depends on US2 (token format) and Foundational (types/pricing); can run in parallel with US3 and US4
- **Polish (Final Phase)**: Depends on all user stories and admin integration being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational (Phase 2) â€” no dependencies on other stories
- **US2 (P1)**: Can start after Foundational (Phase 2) â€” no dependencies on other stories; provides the token format used by US3
- **US3 (P2)**: Depends on US2 completing (uses the token format and SHA-256 verification logic from the WhatsApp generator)
- **US4 (P3)**: Can start after Foundational (Phase 2) â€” independent of other stories, uses config store from T006

### Within Each User Story

- Models/types before components in the same story
- Components before pages in the same story
- Core implementation before styling/accessibility
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, US1 and US2 can start in parallel (different feature areas)
- US4 can start in parallel with US1/US2 (independent â€” only uses config store)
- US3 must wait for US2 (token format dependency)
- Phase 7 (Admin Integration) can start after US2 (token format); can run in parallel with US3 and US4
- All polish tasks marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL â€” blocks all stories)
3. Complete Phase 3: User Story 1 (Home + Services pages)
4. Complete Phase 4: User Story 2 (Interactive form + WhatsApp)
5. **STOP and VALIDATE**: Test MVP independently â€” verify landing pages render, form generates valid WhatsApp links with signed tokens
6. Deploy/demo MVP to vercel preview

### Incremental Delivery

1. Setup + Foundational â†’ Foundation ready
2. Add US1 (Home + Services) â†’ Test independently â†’ Deploy/Demo (v0.1)
3. Add US2 (Form + WhatsApp) â†’ Test independently â†’ Deploy/Demo (v0.2 â€” core feature)
4. Add US3 (Tracking page) â†’ Test independently â†’ Deploy/Demo (v0.3 â€” tracking)
5. Add US4 (Contact + FAQ) â†’ Test independently â†’ Deploy/Demo (v0.4 â€” landing complete)
6. Add Admin Integration (Phase 7 â€” FR-010) â†’ Test independently â†’ Deploy/Demo (v0.5 â€” operator tracking links)
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Home + Services)
   - Developer B: User Story 2 (Form + WhatsApp)
   - Developer C: User Story 4 (Contact + FAQ) â€” this is independent of A and B
3. Developer D (or same as B after US2): User Story 3 (Tracking) â€” depends on token format from US2
4. Developer E (or same as C after US4): Admin Integration Phase 7 â€” can start after US2 (token format); may run in parallel with US3/US4
5. All stories and admin integration complete and integrate independently
6. Parallel polish phase across all stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (not applicable â€” no test tasks in this spec)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All file paths follow AGENTS.md conventions (`src/pages/`, `src/components/`, `src/hooks/`, `src/lib/`)

---

## Phase 8: Convergence

**Purpose**: Close gaps between specification intent and current implementation

- [X] T037 Add `faqs`, `pagoMovil`, and `disclaimers` fields to `Config` interface in `src/lib/types/index.ts` and populate them in `src/lib/db/seed.ts` defaultConfig() per FR-003 and data-model.md Config entity (missing)
- [X] T038 Pass real estimated price from `pricing.ts` into WhatsApp message and tracking token in `src/pages/DelegatePage.tsx` — replace hardcoded `estimatedPrice: 0` and `price: 0` with actual computed price per FR-005, FR-006, US2/AC3 (partial)
- [X] T039 Make `estimatePrice()` in `src/lib/pricing.ts` compute from form parameters and wire parameters through `PriceEstimator` so price updates in real-time when fields change per FR-005, SC-001, US2/AC2 (partial)
- [X] T040 Update admin `src/pages/admin/OrderDetailPage.tsx` to fetch real order data from IndexedDB by `:id` param and use actual client name, service type, description, price for tracking link generation per FR-010 (partial)
- [X] T041 Create `tests/unit/` and `tests/integration/` subdirectories under `tests/` per plan.md project structure (missing)
