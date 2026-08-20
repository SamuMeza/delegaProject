# Interface Contracts: Reportes, Auditoría y Pulido

**Feature**: `004-reportes-auditoria-pulido`  
**Date**: 2026-07-25

## Overview

This document defines the interfaces between UI components and the data layer for the reporting, auditing, and polishing features. Since this is a client-side application, these are React component interfaces and Dexie query patterns.

## 1. Activity Log Interfaces

### useActivityLog Hook

**Purpose**: Provides filtered and paginated activity log entries.

**Interface**:
```typescript
interface UseActivityLogOptions {
  operatorId?: string;    // Filter by operator
  action?: ActionType;    // Filter by action type
  startDate?: string;     // Filter from date (ISO 8601)
  endDate?: string;       // Filter to date (ISO 8601)
  page?: number;          // Page number (1-based)
  pageSize?: number;      // Items per page (default: 50)
}

interface UseActivityLogResult {
  entries: ActivityLogEntry[];
  totalCount: number;
  totalPages: number;
  isLoading: boolean;
  error: Error | null;
}

function useActivityLog(options?: UseActivityLogOptions): UseActivityLogResult;
```

**Usage**:
```typescript
const { entries, totalCount, isLoading } = useActivityLog({
  operatorId: 'op_001',
  action: 'create_order',
  page: 1,
  pageSize: 50
});
```

### ActivityLogEntry Component

**Props**:
```typescript
interface ActivityLogEntryProps {
  entry: ActivityLogEntry;
  operatorName?: string;  // Resolved operator name
  onClick?: (entry: ActivityLogEntry) => void;
}
```

## 2. Statistics Interfaces

### useStatistics Hook

**Purpose**: Calculates real-time business statistics for the current month.

**Interface**:
```typescript
interface MonthlyStats {
  totalOrders: number;
  ordersByStatus: Record<OrderStatus, number>;
  ordersByOperator: Record<string, number>;
  estimatedRevenue: number;
  completedOrders: number;
  pendingOrders: number;
}

interface UseStatisticsResult {
  stats: MonthlyStats | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

function useStatistics(): UseStatisticsResult;
```

**Usage**:
```typescript
const { stats, isLoading } = useStatistics();
if (stats) {
  console.log(`Total orders: ${stats.totalOrders}`);
  console.log(`Revenue: $${stats.estimatedRevenue}`);
}
```

### StatsCard Component

**Props**:
```typescript
interface StatsCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}
```

## 3. Notification Interfaces

### useNotifications Hook

**Purpose**: Manages order notifications with visual and audio alerts.

**Interface**:
```typescript
interface UseNotificationsOptions {
  enabled?: boolean;      // Enable/disable notifications
  soundEnabled?: boolean; // Enable/disable sound
  soundVolume?: number;   // Volume 0-1 (default: 0.7)
}

interface UseNotificationsResult {
  permission: NotificationPermission;
  requestPermission: () => Promise<NotificationPermission>;
  playNotificationSound: () => void;
  showNotification: (title: string, body: string) => void;
  updateTitleIndicator: (count: number) => void;
  clearTitleIndicator: () => void;
}

function useNotifications(options?: UseNotificationsOptions): UseNotificationsResult;
```

**Usage**:
```typescript
const { 
  permission, 
  requestPermission, 
  showNotification,
  playNotificationSound 
} = useNotifications({ soundEnabled: true });

// When new order arrives
showNotification('Nueva orden recibida', `Cliente: ${clientName}`);
playNotificationSound();
```

### NotificationToast Component

**Props**:
```typescript
interface NotificationToastProps {
  title: string;
  body?: string;
  duration?: number;      // Auto-dismiss in ms (default: 5000)
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

## 4. Export Interfaces

### useExport Hook

**Purpose**: Handles data export to JSON format.

**Interface**:
```typescript
interface ExportOptions {
  includeOrders?: boolean;    // Default: true
  includeClients?: boolean;   // Default: true
  includeSubscriptions?: boolean; // Default: true
  includeActivity?: boolean;  // Default: true
  includeConfig?: boolean;    // Default: true
}

interface UseExportResult {
  exportData: (options?: ExportOptions) => Promise<Blob>;
  downloadExport: (options?: ExportOptions) => Promise<void>;
  isExporting: boolean;
  progress: number;           // 0-100
  error: Error | null;
}

function useExport(): UseExportResult;
```

**Usage**:
```typescript
const { downloadExport, isExporting } = useExport();

// Export all data
await downloadExport();

// Export only orders and clients
await downloadExport({ 
  includeOrders: true, 
  includeClients: true,
  includeSubscriptions: false,
  includeActivity: false,
  includeConfig: false
});
```

### ExportButton Component

**Props**:
```typescript
interface ExportButtonProps {
  onExport?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}
```

## 5. Responsive Layout Interfaces

### useBreakpoint Hook

**Purpose**: Detects current viewport breakpoint for responsive behavior.

**Interface**:
```typescript
type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface UseBreakpointResult {
  breakpoint: Breakpoint;
  width: number;
  isMobile: boolean;    // width < 768px
  isTablet: boolean;    // 768px <= width < 1024px
  isDesktop: boolean;   // width >= 1024px
}

function useBreakpoint(): UseBreakpointResult;
```

**Usage**:
```typescript
const { isMobile, breakpoint } = useBreakpoint();

return (
  <div className={cn(
    "flex flex-col",
    isMobile ? "space-y-4" : "grid grid-cols-3 gap-6"
  )}>
    {/* Responsive content */}
  </div>
);
```

## 6. Keyboard Navigation Interfaces

### useKeyboardNavigation Hook

**Purpose**: Manages focus order and keyboard interactions.

**Interface**:
```typescript
interface UseKeyboardNavigationOptions {
  containerRef: React.RefObject<HTMLElement>;
  itemSelector?: string;    // CSS selector for focusable items
  loop?: boolean;           // Loop at boundaries (default: true)
}

interface UseKeyboardNavigationResult {
  focusNext: () => void;
  focusPrevious: () => void;
  focusFirst: () => void;
  focusLast: () => void;
  focusItem: (index: number) => void;
  currentIndex: number;
  totalItems: number;
}

function useKeyboardNavigation(
  options: UseKeyboardNavigationOptions
): UseKeyboardNavigationResult;
```

## 7. Dexie Query Patterns

### Activity Log Queries

```typescript
// Get all activity entries (newest first)
const entries = await db.activityLog
  .orderBy('timestamp')
  .reverse()
  .toArray();

// Filter by operator
const operatorEntries = await db.activityLog
  .where('operatorId')
  .equals('op_001')
  .toArray();

// Filter by action type
const orderEntries = await db.activityLog
  .where('action')
  .equals('create_order')
  .toArray();

// Combined filters
const filtered = await db.activityLog
  .where('operatorId')
  .equals('op_001')
  .and(entry => entry.action === 'create_order')
  .and(entry => entry.timestamp >= startDate && entry.timestamp <= endDate)
  .toArray();

// Paginated
const page = await db.activityLog
  .orderBy('timestamp')
  .reverse()
  .offset((pageNum - 1) * pageSize)
  .limit(pageSize)
  .toArray();
```

### Statistics Queries

```typescript
// Get current month's orders
const now = new Date();
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

const monthlyOrders = await db.orders
  .where('createdAt')
  .between(startOfMonth, endOfMonth, true, true)
  .toArray();

// Calculate revenue
const revenue = monthlyOrders.reduce((sum, order) => sum + order.price, 0);

// Group by operator
const byOperator = monthlyOrders.reduce((acc, order) => {
  acc[order.operatorId] = (acc[order.operatorId] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

// Get active subscriptions for revenue
const activeSubs = await db.subscriptions
  .where('status')
  .equals('activa')
  .toArray();
const subRevenue = activeSubs.reduce((sum, sub) => sum + sub.price, 0);
```

### Export Queries

```typescript
// Export all data
const exportData = {
  orders: await db.orders.toArray(),
  clients: await db.clients.toArray(),
  subscriptions: await db.subscriptions.toArray(),
  activityLog: await db.activityLog.toArray(),
  operators: await db.operators.toArray(),
  config: await db.config.toArray(),
  exportedAt: new Date().toISOString()
};

// Create download
const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `delega-backup-${new Date().toISOString().split('T')[0]}.json`;
a.click();
URL.revokeObjectURL(url);
```

## Error Handling

All hooks should handle errors gracefully:

```typescript
interface ErrorState {
  error: Error | null;
  isError: boolean;
  retry: () => void;
}

// Pattern for all data hooks
function useDataHook() {
  const [error, setError] = useState<Error | null>(null);
  
  const retry = useCallback(() => {
    setError(null);
    // Re-fetch data
  }, []);
  
  return { error, isError: error !== null, retry };
}
```

## Testing Patterns

### Unit Testing Hooks

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useActivityLog } from './useActivityLog';

test('useActivityLog returns paginated results', async () => {
  const { result } = renderHook(() => useActivityLog({ page: 1, pageSize: 10 }));
  
  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });
  
  expect(result.current.entries).toHaveLength(10);
  expect(result.current.totalPages).toBeGreaterThan(0);
});
```

### Integration Testing Components

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ActivityLogEntry } from './ActivityLogEntry';

test('ActivityLogEntry displays entry details', () => {
  const entry = {
    id: 'LOG-001',
    operatorId: 'op_001',
    action: 'create_order',
    targetId: 'ORD-001',
    details: 'Created order for John Doe',
    timestamp: '2026-07-25T10:30:00Z'
  };
  
  render(<ActivityLogEntry entry={entry} />);
  
  expect(screen.getByText('create_order')).toBeInTheDocument();
  expect(screen.getByText('Created order for John Doe')).toBeInTheDocument();
});
```