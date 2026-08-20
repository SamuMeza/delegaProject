# Research: Reportes, Auditoría y Pulido

**Feature**: `004-reportes-auditoria-pulido`  
**Date**: 2026-07-25

## Technical Decisions

### 1. Activity Log Implementation

**Decision**: Use existing `ActivityLogEntry` type in `src/lib/types/index.ts` and Dexie table `activityLog` in `src/lib/db/delegaDb.ts`.

**Rationale**: 
- Entity already exists with required fields (timestamp, operatorId, action, targetId, details)
- Dexie table already defined and used for logging
- No schema changes needed

**Alternatives Considered**:
- Create new dedicated logging table → Rejected: unnecessary complexity, existing table sufficient
- Use console.log + external tool → Rejected: violates local-first principle

### 2. Filtering & Pagination Strategy

**Decision**: Client-side filtering with Dexie queries + in-memory pagination (50 items per page).

**Rationale**:
- Data volumes are small (hundreds to low thousands of entries)
- Dexie supports compound queries efficiently
- No need for server-side pagination
- Keeps implementation simple (YAGNI principle)

**Alternatives Considered**:
- Server-side pagination → Rejected: no server exists
- Virtual scrolling for 10k+ records → Considered for future if performance issues arise

### 3. Statistics Calculation

**Decision**: Real-time calculation from IndexedDB data, no caching.

**Rationale**:
- Data is local and small-scale
- Real-time calculation ensures accuracy
- No performance concerns with current data volumes
- Follows "simple, no backend" principle

**Alternatives Considered**:
- Pre-calculate and store → Rejected: adds complexity, data is small enough

### 4. Notification System

**Decision**: Use Web Notifications API + custom audio element + document title modification.

**Rationale**:
- Web Notifications API is standard in modern browsers
- Custom audio for distinctive sound (not system sounds)
- Title modification works when tab is in background
- All client-side, no server needed

**Alternatives Considered**:
- Server-sent events → Rejected: requires backend
- Service Worker notifications → Overkill for this use case

### 5. Data Export Implementation

**Decision**: Use Dexie's `toArray()` method + JSON serialization + Blob download.

**Rationale**:
- Dexie provides easy access to all tables
- JSON.stringify handles serialization
- Blob + URL.createObjectURL triggers download
- Simple, no dependencies

**Alternatives Considered**:
- CSV export → Rejected: JSON preserves data types better
- IndexedDB export library → Rejected: overkill, custom solution is simple

### 6. Responsive Design Approach

**Decision**: Mobile-first with Tailwind CSS responsive utilities (sm:, md:, lg:).

**Rationale**:
- Tailwind v4 has excellent responsive support
- Mobile-first ensures good experience on small screens
- Consistent with existing codebase patterns
- No additional dependencies needed

**Alternatives Considered**:
- CSS media queries only → Rejected: Tailwind utilities are cleaner
- Responsive framework → Rejected: adds unnecessary weight

### 7. Accessibility Implementation

**Decision**: Follow WCAG 2.1 AA guidelines with focus management and ARIA attributes.

**Rationale**:
- WCAG 2.1 AA is industry standard
- Focus management for keyboard navigation
- ARIA labels for screen readers
- Color contrast ratios (4.5:1 normal, 3:1 large text)

**Alternatives Considered**:
- WCAG AAA → Rejected: too strict for this application
- Minimal accessibility → Rejected: violates constitution principles

## Best Practices Identified

### Activity Log Patterns
- Chronological descending order (newest first)
- Combinable filters (operator + action type + date range)
- Pagination with 50 items per page
- Empty state messaging

### Statistics Dashboard Patterns
- Summary cards with key metrics
- Visual distribution (charts/graphs)
- Time-based filtering (monthly view)
- Operator comparison

### Notification Patterns
- Non-intrusive (toast/banner)
- Auto-dismiss after timeout
- Sound alerts (distinctive, configurable)
- Background tab indication

### Export Patterns
- Single-click download
- Progress indication for large datasets
- File naming convention (backup-YYYY-MM-DD.json)
- Data validation on export

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Performance with 10k+ activity entries | Low | Medium | Implement pagination early, consider virtual scrolling if needed |
| Browser notification permission denied | Medium | Low | Graceful fallback to title indicator + sound only |
| Large export file size | Low | Low | No size limits specified, but data volumes are small |
| Mobile viewport constraints | Medium | Medium | Test on 320px+ viewports, ensure no horizontal scroll |

## Dependencies

### Internal Dependencies
- `ActivityLogEntry` type (already exists)
- `db.activityLog` Dexie table (already exists)
- `useDelegaDB` hooks (already exist)
- shadcn/ui components (already available)

### External Dependencies
- Web Notifications API (browser native)
- Audio API (browser native)
- JSON serialization (native JavaScript)

## Success Criteria Validation

| Criterion | How to Validate |
|-----------|-----------------|
| SC-001: Find action in <10s | Manual testing with filters |
| SC-002: 10k+ records performance | Load testing with synthetic data |
| SC-003: Statistics accuracy | Compare with manual calculations |
| SC-004: Export <1s for 10MB | Performance testing with large dataset |
| SC-005: Notification <2s | Timing measurement from data save to alert |
| SC-006: 100% keyboard navigation | Manual keyboard testing |
| SC-007: Responsive at 320/768/1024px | Visual testing at breakpoints |

## Open Questions

None - all technical decisions have been resolved based on existing codebase patterns and constitution requirements.