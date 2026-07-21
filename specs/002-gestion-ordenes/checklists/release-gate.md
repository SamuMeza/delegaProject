# Release-Gate Checklist: Gestión de Órdenes

**Purpose**: Validación formal (release gate) de la calidad de los requisitos de la feature Gestión de Órdenes. Enfoque general con peso mayor en UX del panel y en permisos/estado. Es una "prueba unitaria para el inglés": evalúa que los requisitos estén completos, claros, consistentes, medibles y cubran escenarios — no que el código funcione.

**Created**: 2026-07-19 · **Updated**: 2026-07-19 (cierre de gaps tras corrección de spec/plan)
**Feature**: [spec.md](../spec.md) · [plan.md](../plan.md) · [data-model.md](../data-model.md) · [contracts](../contracts/order-contracts.md)

**Depth**: Formal (release gate) · **Audience**: Revisor de PR / release
**Focus weight**: UX del panel (alto) · Permisos y estado (alto) · Resto general
**Estado**: Los ítems marcados `[x]` fueron resueltos en spec.md/plan.md/research.md/data-model.md.

---

## Requirement Completeness

- [x] CHK001 Are requirements defined for the exact set of write operations restricted to the order owner (edit fields, change status, delete attachment, delete note)? [Completeness, Spec §FR-007, plan R5]
- [x] CHK002 Are the UI affordances per order status (which controls show/disable) specified for list and detail? [Gap, UX, Spec §FR-005, Spec §Controles por estado] — *Resuelto: tabla de controles por estado añadida en spec.*
- [x] CHK003 Is the behavior for a non-owner attempting a write specified (disabled controls AND a visible read-only indicator/message)? [Completeness, Spec §FR-007, contracts C3, Edge Cases]
- [x] CHK004 Are zero-state requirements defined (panel with no orders yet)? [Coverage, Gap, UX, Spec §FR-017] — *Resuelto: zero-state con CTA "Nueva orden" en FR-017.*
- [x] CHK005 Are requirements for all 6 `ServiceType` values present in the default `serviceOperatorMap`? [Completeness, research R1, data-model]
- [x] CHK006 Are activity-log requirements defined for every write action (create, update, change_status, add_note, upload_file)? [Completeness, research R10, FR-015]
- [x] CHK007 Are note edit/delete requirements specified, or is append-only the intended rule? [Gap, Spec §FR-008] — *Resuelto: notas append-only, sin edición/borrado.*
- [x] CHK008 Are confirmation requirements defined for irreversible actions (cancel order, delete attachment)? [Gap, Edge Case, Spec §FR-015]

## Requirement Clarity

- [x] CHK009 Is the term "solo tocar órdenes propias" unambiguously scoped to exactly which fields/actions? [Clarity, Spec §FR-007, Edge Cases]
- [x] CHK010 Is the state-transition rule quantified for every status, including terminal `cancelada` and `completada`? [Clarity, Spec §FR-005, research R6]
- [x] CHK011 Is the assignment logic specified for when `serviceOperatorMap` lacks an entry for a given `serviceType`? [Clarity, Gap, research R1, data-model, Spec §FR-006] — *Resuelto: fallback a op_001 + advertencia.*
- [x] CHK012 Is the `paymentStatus` derivation rule (unpaid/partial/paid from `totalPaid` vs `price`) stated without ambiguity? [Clarity, research R9, contracts C5, Spec §FR-018] — *Resuelto: FR-018 añadido con regla explícita.*
- [x] CHK013 Is the order ID format and the counter-increment mechanism (collision/atomicity) specified deterministically? [Clarity, Spec §FR-002, research R8]
- [x] CHK014 Are form-validation messages specified for required fields (notably `serviceType` mandatory)? [Clarity, contracts C4, Edge Cases, Spec §FR-001]
- [x] CHK015 Is the attachment size threshold quantified (e.g., ~25 MB) rather than "razonable"? [Clarity, Edge Case, research R2, Edge Cases]

## Requirement Consistency

- [x] CHK016 Do permission requirements agree across Spec §FR-007, plan R5 and contracts C3 (`useOrderPermissions`)? [Consistency]
- [x] CHK017 Do Spec, plan (data-model) and contracts agree on the field set of `Order` (incl. removal of embedded `files`, addition of `urgent`/`paymentStatus`/`statusHistory`)? [Consistency]
- [x] CHK018 Are "urgente" (manual flag) and "vencida" (due date) definitions consistent between Spec §FR-013 and research R7? [Consistency]
- [x] CHK019 Is the dashboard metric definition consistent between Spec §FR-012/FR-013 and contracts C1 (counts, urgentes/vencidas, ingresos)? [Consistency]
- [x] CHK020 Does the state machine in research R6 match the pipeline listed in Spec §FR-005 exactly (same 6 states + cancelada)? [Consistency]

## Acceptance Criteria Quality

- [x] CHK021 Are the success criteria (SC-001..SC-007) measurable without referencing implementation? [Measurability, Spec §Success Criteria]
- [x] CHK022 Can "el 100% de transiciones siguen el pipeline" (SC-002) be objectively verified from requirements? [Measurability, Spec §SC-002]
- [x] CHK023 Can "dashboard refleja conteos coherentes" (SC-006) be verified with a defined acceptance test from the spec? [Measurability, Spec §SC-006]
- [x] CHK024 Does each FR (FR-001..FR-017) have a corresponding, unambiguous acceptance scenario? [Acceptance Criteria, Spec §User Scenarios]

## Scenario Coverage

- [x] CHK025 Are Primary-flow requirements complete for create → assign → transition → complete? [Coverage, Spec User Story 1]
- [x] CHK026 Are Alternate-flow requirements defined (e.g., operator creates order of the *other* operator's type)? [Coverage, Spec User Story 2]
- [x] CHK027 Are Exception-flow requirements defined for invalid state jumps and blocked edits? [Coverage, Exception, Spec §Edge Cases]
- [x] CHK028 Are Recovery-flow requirements defined for failed attachment upload or corrupted blob? [Coverage, Gap, research R2, Edge Cases]
- [x] CHK029 Are concurrent-edit requirements addressed given no cross-device sync (last-write-wins stated)? [Coverage, Spec §Edge Cases]
- [x] CHK030 Are requirements defined for viewing an order after its owner logs out / session expires? [Coverage, Gap, Spec §FR-014]

## Edge Case Coverage (UX & State weighted)

- [x] CHK031 Are requirements specified for upload failure and for exceeding the blob size limit (user-facing message)? [Edge Case, UX, research R2, Edge Cases]
- [x] CHK032 Is the empty/error state of the attachments section specified (no files, load error)? [Edge Case, Gap, UX, FR-017]
- [x] CHK033 Is the behavior specified when an order is cancelled — are its notes/attachments/history retained and visible? [Edge Case, Spec §Edge Cases, research R9]
- [x] CHK034 Are requirements defined for an order with `dueDate` in the past but status `completada` (should it show as vencida)? [Edge Case, Gap, research R7, Spec §FR-013]
- [x] CHK035 Is the display of overdue vs manually-urgent distinguished in the UI requirements? [Edge Case, UX, Spec §FR-013]

## Non-Functional Requirements

- [x] CHK036 Are keyboard-navigation and focus-management requirements specified for the panel (list, detail, forms, modals)? [Coverage, a11y, Spec §FR-016]
- [x] CHK037 Are label/contrast requirements specified for status badges and urgent markers (WCAG 4.5:1)? [a11y, UX, Spec §FR-016]
- [x] CHK038 Are responsive/mobile requirements for the admin panel specified (the two operators may use mobile)? [Gap, NFR, Spec §FR-017]
- [x] CHK039 Are loading/empty states for asynchronous Dexie queries specified (no permanent blank panel)? [Gap, NFR, Spec §FR-017]
- [x] CHK040 Are performance expectations for list/dashboard (local data, instant) quantified as acceptance? [NFR, Spec §SC implicit, quickstart.md §Non-Functional] — *Resuelto: umbral <100ms percepción en quickstart.*

## Dependencies & Assumptions

- [x] CHK041 Is the assumption "2 operadores / 2 service types" reconciled with the actual 6 `ServiceType` values in the data model? [Assumption, research R1, Spec §Assumptions]
- [x] CHK042 Is the IndexedDB blob storage limit assumption documented as a constraint? [Assumption, research R2, Edge Cases]
- [x] CHK043 Is the dependency on `Config.serviceOperatorMap` being seeded (idempotent) validated against seed.ts? [Dependency, research R1, seed.ts]
- [x] CHK044 Is the assumption of no cross-device sync (Principio I) explicitly carried into this feature's scope? [Assumption, Spec §Assumptions]

## Ambiguities & Conflicts

- [x] CHK045 Is there any conflict between "ver todo" (Spec §FR-007) and the dashboard "contadores del mes" scope (whose month — calendar vs operator)? [Ambiguity, Spec §FR-012] — *Resuelto: mes calendario, ambos operadores.*
- [x] CHK046 Is "órdenes urgentes" defined as a stored flag, a computed overdue, or both — and is that reflected consistently? [Ambiguity, Spec §FR-013, research R7] — *Resuelto: ambos, distinguidos.*

---

## Notes

- Checklist generado por `/speckit.checklist` como release gate formal; actualizado tras corrección de spec/plan.
- Peso mayor en UX del panel y permisos/estado.
- **Pendientes abiertos**: ninguno. Los antes abiertos (CHK002, CHK004, CHK012, CHK040) fueron resueltos en spec/plan/tasks/quickstart tras la ronda de remediación.
- Trazabilidad: ≥80% de ítems referencian Spec/plan/research/data-model/contracts o usan `[Gap]`/`[Ambiguity]`/`[Conflict]`/`[Assumption]`.
