## Phase 8: Convergence

Based on the spec/plan/tasks gap analysis, these convergence tasks close the remaining requirements:

- [X] T031 Add serviceOperatorMap fallback warning and paymentStatus derivation in createOrder (FR-006/FR-018, contracts C5)
- [X] T032 Apply useOrderPermissions in OrderDetailPage and OrdersListPage UI: disable controls when !canEdit, show 'solo lectura' indicator (FR-007)
- [X] T033 Confirm `addNote` records author + timestamp (FR-009)
- [X] T034 Add confirmation dialog before canceling order and deleting attachment (FR-015)
- [X] T035 Implement UI for adding notes (append-only, no edit/delete) with author/timestamp (FR-008/FR-009, CHK007)
- [X] T036 Implement UI for attaching files: upload (≤25MB, error handling), list, download, delete with confirmation (FR-010/FR-015, CHK031-032)
- [X] T037 Implement DashboardPage with monthly counters, by-status breakdown, urgent/vencida distinction, Pago Móvil tracking (FR-012/FR-013, CHK045)
- [X] T038 Apply accessibility in panel (list/detail/create): labels, keyboard navigation, visible focus, contrast ≥4.5:1 (FR-016/FR-017, CHK036-038)
- [X] T039 Ensure `activity_log` on ALL order actions (create_order, update_order, change_status, add_note, upload_file, delete_attachment) (research R10)
- [X] T040 Document `serviceOperatorMap` configurability + assignment logic in README/manual (FR-001)

### Additional missing from existing tasks.md:
- [X] T041: Implement `paymentStatus` derivation in `stateMachine.ts` and update Order type with proper field (FR-018)
- [X] T042: Add `canEdit`/`canChangeStatus`/`canDeleteAttachment` fields to `OrderPermissions` (FR-007, contracts C3)
- [X] T043: Add `urgent` field to Order UI (FR-013)
- [X] T044: Add dashboard urgent/vencida visual distinction (FR-013, CHK034/CHK035)
- [X] T045: Add dashboard month='calendar month' (FR-012)
- [X] T046: Add dashboard Pago Móvil tracking (FR-012)

**Note:** Tasks T031-T040 correspond to the gap analysis findings. Tasks T041-T046 are additional missing requirements identified during convergence assessment and should be prioritized according to severity (CRITICAL/FR-018 is for paymentStatus missing from Order type).