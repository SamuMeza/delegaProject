# Quickstart Validation Guide: Reportes, Auditoría y Pulido

**Feature**: `004-reportes-auditoria-pulido`  
**Date**: 2026-07-25

## Overview

This guide provides validation scenarios to verify the reporting, auditing, and polishing features work correctly end-to-end.

## Prerequisites

1. **Development Environment**:
   - Bun runtime installed
   - Node.js (for compatibility)
   - Git

2. **Setup Commands**:
   ```bash
   # Clone and setup
   git clone <repository-url>
   cd delegaProject
   bun install
   
   # Start development server
   bun dev
   ```

3. **Browser Requirements**:
   - Modern browser (Chrome 90+, Edge 90+, Firefox 88+)
   - Notifications permission granted (for notification testing)
   - Developer tools open (for debugging)

## Validation Scenarios

### Scenario 1: Activity Log Filtering

**Objective**: Verify operators can filter activity log entries.

**Steps**:
1. Navigate to admin panel → Activity Log
2. Create some test actions:
   - Create a new order
   - Update an order status
   - Add a note to an order
3. Verify actions appear in chronological order (newest first)
4. Test filtering:
   - Filter by operator (select "Operator 1")
   - Filter by action type (select "create_order")
   - Filter by date range (select today's date)
5. Verify filters combine correctly (intersection)
6. Test pagination (if >50 entries)

**Expected Results**:
- All actions logged with correct operator, type, and timestamp
- Filters reduce results correctly
- Combined filters show intersection of results
- Pagination works (50 items per page)
- Total count displayed accurately

**Pass Criteria**: ✅ All filters work correctly, pagination functions properly

---

### Scenario 2: Monthly Statistics Accuracy

**Objective**: Verify statistics calculate correctly from order data.

**Steps**:
1. Navigate to admin panel → Dashboard/Statistics
2. Create test data:
   - Create 5 orders for Operator 1 (various statuses)
   - Create 3 orders for Operator 2 (various statuses)
   - Set prices: $5, $10, $15, $8, $12 (total: $50)
3. Verify statistics display:
   - Total orders: 8
   - Orders by operator: Operator 1 = 5, Operator 2 = 3
   - Orders by status: count each status correctly
   - Estimated revenue: sum of all order prices
4. Create an active subscription ($25/month)
5. Verify revenue includes subscription fee

**Expected Results**:
- Order counts match created data
- Revenue calculation accurate (orders + subscriptions)
- Distribution by operator correct
- Status breakdown correct

**Pass Criteria**: ✅ All metrics match manual calculations

---

### Scenario 3: Data Export完整性

**Objective**: Verify JSON export contains all data.

**Steps**:
1. Navigate to admin panel → Export/Backup
2. Click "Exportar backup" button
3. Verify download starts (file: `delega-backup-YYYY-MM-DD.json`)
4. Open downloaded JSON file in text editor
5. Verify structure:
   ```json
   {
     "orders": [...],
     "clients": [...],
     "subscriptions": [...],
     "activityLog": [...],
     "operators": [...],
     "config": [...],
     "exportedAt": "2026-07-25T..."
   }
   ```
6. Verify each array contains expected data
7. Verify data types preserved (numbers as numbers, dates as strings)

**Expected Results**:
- File downloads successfully
- Valid JSON format
- All tables included
- Data integrity maintained
- Export timestamp recorded

**Pass Criteria**: ✅ Export file contains complete, valid data

---

### Scenario 4: Notification System

**Objective**: Verify notifications work for new orders.

**Steps**:
1. Open admin panel in Browser A
2. Grant notification permission when prompted
3. Open another tab/window with landing page
4. Submit a new order request
5. Verify in admin panel:
   - Toast notification appears ("Nueva orden recibida")
   - Notification sound plays
   - Tab title shows indicator ("(1) Nuevo pedido")
6. Click notification or wait for auto-dismiss
7. Verify title indicator clears

**Expected Results**:
- Visual notification appears within 2 seconds
- Sound plays (if enabled)
- Title indicator works in background
- Notification dismisses automatically
- No errors in console

**Pass Criteria**: ✅ All notification methods work correctly

---

### Scenario 5: Responsive Design

**Objective**: Verify panel works on mobile viewports.

**Steps**:
1. Open admin panel
2. Use browser dev tools to set viewport to 375px width (iPhone SE)
3. Navigate through all main screens:
   - Dashboard
   - Orders list
   - Order detail
   - Clients
   - Activity Log
4. Verify:
   - No horizontal scroll
   - All content visible
   - Buttons/links accessible
   - Text readable (no truncation)
5. Test at 768px (tablet) and 1024px (desktop)

**Expected Results**:
- All screens functional at 375px+
- No content cut off
- Navigation works
- Text contrast meets WCAG (4.5:1)

**Pass Criteria**: ✅ Panel usable at all breakpoints

---

### Scenario 6: Keyboard Navigation

**Objective**: Verify full keyboard accessibility.

**Steps**:
1. Open admin panel
2. Press Tab key repeatedly
3. Verify focus moves through all interactive elements:
   - Navigation links
   - Form inputs
   - Buttons
   - Table rows (if applicable)
4. Verify focus indicator visible (outline)
5. Test Enter/Space on buttons
6. Test Escape to close modals (if any)

**Expected Results**:
- All interactive elements receive focus
- Focus order logical (top→bottom, left→right)
- Focus indicator clearly visible
- Keyboard actions work

**Pass Criteria**: ✅ 100% keyboard navigable

---

### Scenario 7: Empty States

**Objective**: Verify graceful handling of no data.

**Steps**:
1. Clear all test data (or use fresh browser profile)
2. Navigate to Activity Log
3. Verify empty state message (e.g., "No hay acciones registradas")
4. Navigate to Statistics
5. Verify empty state (e.g., "No hay datos para este mes")
6. Try export with no data
7. Verify valid JSON with empty arrays

**Expected Results**:
- Informative empty state messages
- No error messages
- Export produces valid JSON
- UI remains functional

**Pass Criteria**: ✅ Empty states handled gracefully

---

### Scenario 8: Performance with Large Dataset

**Objective**: Verify performance with 10k+ activity entries.

**Steps**:
1. Generate synthetic data (10,000 activity entries)
2. Navigate to Activity Log
3. Verify:
   - Initial load < 2 seconds
   - Filtering response < 500ms
   - Scrolling smooth (60fps)
   - No UI lag
4. Test with 1,000 orders for statistics
5. Verify calculations complete quickly

**Expected Results**:
- Load times within thresholds
- Interactions responsive
- No memory leaks
- Smooth scrolling

**Pass Criteria**: ✅ Performance meets SC-002 requirements

---

## Troubleshooting

### Common Issues

1. **Notifications not working**:
   - Check browser notification permissions
   - Verify not in incognito mode (some browsers block)
   - Check console for errors

2. **Export not downloading**:
   - Verify Blob API supported
   - Check popup blocker
   - Try different browser

3. **Statistics incorrect**:
   - Verify date filtering (month boundaries)
   - Check for timezone issues
   - Clear cache and recalculate

4. **Performance issues**:
   - Check for memory leaks in React DevTools
   - Verify Dexie queries are indexed
   - Consider pagination for large lists

### Debug Commands

```javascript
// In browser console

// Check Dexie tables
await delegaDb.orders.count()
await delegaDb.activityLog.count()

// Manual statistics calculation
const orders = await delegaDb.orders.toArray()
const revenue = orders.reduce((sum, o) => sum + o.price, 0)
console.log('Revenue:', revenue)

// Test notification
new Notification('Test', { body: 'Hello!' })

// Check performance
console.time('filter')
await delegaDb.activityLog.where('operatorId').equals('op_001').toArray()
console.timeEnd('filter')
```

## Success Criteria Validation

| Criterion | Scenario | Expected | Actual | Status |
|-----------|----------|----------|--------|--------|
| SC-001: Find action <10s | Scenario 1 | <10s | ______ | ⬜ |
| SC-002: 10k+ records | Scenario 8 | No degradation | ______ | ⬜ |
| SC-003: Statistics accuracy | Scenario 2 | 100% accurate | ______ | ⬜ |
| SC-004: Export <1s | Scenario 3 | <1s | ______ | ⬜ |
| SC-005: Notification <2s | Scenario 4 | <2s | ______ | ⬜ |
| SC-006: 100% keyboard | Scenario 6 | Full navigation | ______ | ⬜ |
| SC-007: Responsive | Scenario 5 | 320px+ works | ______ | ⬜ |

## Sign-off

After completing all scenarios, document results:

- **Tester**: ________________
- **Date**: ________________
- **Browser**: ________________
- **Overall Status**: ⬜ Pass / ⬜ Fail
- **Notes**: ________________

**Recommendation**: ⬜ Proceed to production / ⬜ Fix issues first