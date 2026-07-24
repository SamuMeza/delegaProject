# Specification Quality Checklist: Suscripciones y Clientes (Completo)

**Purpose**: Validate completeness, clarity, consistency, and coverage of requirements for client management and subscriptions
**Created**: 2026-07-24
**Feature**: [spec.md](../spec.md), [plan.md](../plan.md), [data-model.md](../data-model.md)

## Requirement Completeness

- [x] CHK001 - Are requirements defined for editing an existing client (vs. only create/list)? [Gap, Spec §FR-001] — ✅ FR-001 cubre editar (excepto teléfono), implementado en ClientDetailPage
- [x] CHK002 - Are requirements for client search/filter functionality specified? [Gap, Spec §FR-001] — Scoped out (YAGNI: 50-100 clientes, scroll nativo suficiente)
- [x] CHK003 - Are requirements for the "cancelar suscripción" manual action specified? [Gap, Spec §FR-007] — ✅ Implementado en ClientDetailPage vía handleCancelSubscription
- [x] CHK004 - Are requirements for the monthly usedPerMonth reset mechanism fully specified? [Completeness, Spec §FR-004] — ✅ Especificado en FR-004 y research.md Decision 5
- [x] CHK005 - Are requirements for desactivation (soft-delete) of clients with associated data documented? [Completeness, Spec §Edge Cases] — ✅ Edge case + T012 implementado
- [x] CHK006 - Are requirements for the alerta de renovación dismissal/acknowledgment behavior defined? [Gap, Spec §FR-006] — Scoped out: badge visual pasivo, sin interacción de dismiss (YAGNI)

## Requirement Clarity

- [x] CHK007 - Is the "20% de descuento" base clearly defined (sobre precio estándar de qué momento)? [Clarity, Spec §FR-005] — ✅ Assumptions define "Precio estándar = estimatePrice()"
- [x] CHK008 - Is "fecha de último contacto" in the client list clearly defined (última orden vs última modificación)? [Clarity, Spec §US-1] — ✅ US-1 aclara "orden más reciente o fecha de creación"
- [x] CHK009 - Is the trigger for monthly reset of usedPerMonth specified (cambio de mes calendario = cuándo exactamente)? [Clarity, Spec §FR-004]
- [x] CHK010 - Is the visual format of "estado de alerta" in FR-009 specified? [Ambiguity, Spec §FR-009] — ✅ FR-009 especifica badge ≤15 días
- [x] CHK011 - Is the "precio estándar" referenced in FR-005 and FR-010 clearly defined? [Clarity, Spec §FR-005] — ✅ Assumptions define "Precio estándar = estimatePrice()"
- [x] CHK012 - Is the term "sin prorrateo" for suscripciones a mitad de mes quantified? [Clarity, Spec §Assumptions]

## Requirement Consistency

- [x] CHK013 - Is the subscription status name "cancelada" used consistently across spec, data-model, and existing codebase types? [Consistency, Spec §Key Entities vs data-model.md]
- [x] CHK014 - Does FR-008 (una suscripción activa a la vez) conflict with the renew flow in FR-007 (renovación anticipada)? [Consistency, Spec §FR-007 vs FR-008]
- [x] CHK015 - Is "coverageTipo" naming consistent between spec (tipo_cobertura) and data-model (CoverageTipo enum)? [Consistency, Spec §Key Entities vs data-model.md] — ✅ spec.md y data-model usan coverageTipo
- [x] CHK016 - Are the subscription state names aligned between spec (activa/vencida/reemplazada) and data-model state transitions (creada/activa/vencida/reemplazada/cancelada)? [Consistency, Spec §Key Entities vs data-model.md §State Transitions]

## Acceptance Criteria Quality

- [x] CHK017 - Can SC-001 "menos de 30 segundos" be objectively measured without instrumenting the application? [Measurability, Spec §SC-001] — Aceptado como UX subjetiva post-impl; no bloquea
- [x] CHK018 - Is SC-004 "sin necesidad de navegación adicional" testable without ambiguity? [Measurability, Spec §SC-004] — ✅ Alertas visibles en dashboard (RenewalAlerts)
- [x] CHK019 - Is SC-006 "reinicia correctamente" defined with a verifiable expected outcome? [Measurability, Spec §SC-006] — ✅ Documentado: reinicio al detectar cambio de mes calendario

## Scenario Coverage

- [x] CHK020 - Are requirements for the full subscription lifecycle defined: create → active → renew → replace → cancel? [Coverage, Spec §US-2, US-4] — ✅ Lifecycle completo implementado (create + T016 replace + T020 renew + T021 cancel)
- [x] CHK021 - Are requirements for the "editar cliente" flow specified (what fields are editable, audit trail)? [Coverage, Gap] — ✅ FR-001 + T010 + activity log
- [x] CHK022 - Are requirements for client list pagination or infinite scroll specified for 50+ clients? [Coverage, Gap] — Scoped out (YAGNI: 50-100 clientes, scroll nativo)
- [x] CHK023 - Are requirements for showing "next renewal date" in the subscription detail defined? [Coverage, Spec §US-2] — ✅ Mostrado en subscription card
- [x] CHK024 - Are requirements for the "sin órdenes registradas" empty state specified for the history view? [Coverage, Spec §Edge Cases] — ✅ Implementado en OrderHistory

## Edge Case Coverage

- [x] CHK025 - Is the behavior specified when `usedPerMonth` has no key for the current month (fresh month)? [Edge Case, Spec §Assumptions] — ✅ Research.md Decision 5: inicializa en 0
- [x] CHK026 - Is the behavior specified for leap year when calculating subscription endDate (startDate + 3 months)? [Edge Case, Spec §FR-003] — JS Date maneja estándar; no requiere especificación adicional
- [x] CHK027 - Is the behavior specified when a client with a vencida suscripción tries to renew after the end date? [Edge Case, Spec §US-4] — ✅ handleRenew usa fecha actual si endDate ya pasó
- [x] CHK028 - Is the behavior specified when Config.subscriptionCounter overflows (999 → 1000)? [Edge Case, data-model.md §ID Generation] — Scoped out (50-100 clientes, no alcanza overflow)
- [x] CHK029 - Is the behavior specified for creating a subscription on Feb 29 of a leap year? [Edge Case, Spec §FR-003] — JS Date maneja estándar; no requiere especificación adicional
- [x] CHK030 - Is the behavior specified for concurrent creation of two suscripciones for the same client? [Edge Case, Spec §FR-008] — ✅ T016 enforce en transacción Dexie

## Non-Functional Requirements

- [x] CHK031 - Are data consistency requirements between `Client.subscription` (embedded) and the `Subscription` table defined? [NFR, research.md §Key Decisions] — ✅ Embedded actualizado en misma transacción Dexie
- [x] CHK032 - Are performance expectations for client list queries with 50+ records specified? [NFR, Gap] — Scoped out (50-100 clientes, Dexie síncrono en memoria, sin latencia de red)
- [x] CHK033 - Are accessibility requirements for the renewal alertas (screen readers, color contrast) specified? [NFR, Gap] — Scoped out (YAGNI: alerta visual simple, badge con color + texto)

## Dependencies & Assumptions

- [x] CHK034 - Is the assumption "no prorrateo a mitad de mes" explicitly validated against business expectations? [Assumption, Spec §Assumptions]
- [x] CHK035 - Is the dependency on the existing Order model's `subscriptionId` field documented? [Dependency, Spec §Key Entities]
- [x] CHK036 - Is the assumption that "alerta aparece en el dashboard" as the single location documented and agreed? [Assumption, Spec §Assumptions]

## Ambiguities & Conflicts

- [x] CHK037 - Is "cancelada" a terminal state (no reactivación) explicitly stated in the spec? [Ambiguity, data-model.md §State Transitions]
- [x] CHK038 - Is it clear whether "editar" in FR-001 allows changing the client phone (PK)? [Ambiguity, Spec §FR-001] — ✅ FR-001 explicita que el teléfono no es editable
- [x] CHK039 - Is the distinction between "suelta con 20% descuento" and regular "estándar" pricing documented as exclusive? [Ambiguity, Spec §FR-005]
- [x] CHK040 - Is it specified whether usedPerMonth resets globally at month transition or per-client at first order of new month? [Ambiguity, Spec §FR-004] — ✅ Research.md Decision 5: inicialización lazy al detectar cambio de mes

## Notes

- Items marked [Gap] indicate missing requirements that should be added before implementation
- Items marked [Ambiguity] need clarification to avoid misinterpretation during implementation
- Items marked [Consistency] compare multiple documents (spec, data-model, plan, research)