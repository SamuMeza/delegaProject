# Data Model: Reportes, Auditoría y Pulido

**Feature**: `004-reportes-auditoria-pulido`  
**Date**: 2026-07-25

## Overview

This feature uses existing entities from the Delega data model. No new entities are required - the feature focuses on presenting and exporting existing data.

## Existing Entities

### 1. ActivityLogEntry (already exists)

**Purpose**: Records every operator action for auditing and traceability.

**Location**: `src/lib/types/index.ts`

**Fields**:
```typescript
interface ActivityLogEntry {
  id: string;           // Unique identifier (format: "LOG-###")
  operatorId: string;   // Reference to operator (op_001 or op_002)
  action: ActionType;   // Type of action performed
  targetId: string;     // ID of affected resource (order, client, etc.)
  details: string;      // Human-readable description
  timestamp: string;    // ISO 8601 timestamp
}
```

**ActionType enum**:
```typescript
type ActionType = 
  | "login"
  | "logout"
  | "create_order"
  | "update_order"
  | "delete_order"
  | "add_note"
  | "upload_file"
  | "change_status"
  | "create_client"
  | "update_client"
  | "create_subscription"
  | "cancel_subscription"
  | "renew_subscription";
```

**Dexie Table**: `activityLog` in `src/lib/db/delegaDb.ts`

**Relationships**:
- Many-to-one with Operator (via operatorId)
- References various entities (Order, Client, Subscription) via targetId

### 2. Order (already exists)

**Purpose**: Represents a tracked request from a student/client.

**Location**: `src/lib/types/index.ts`

**Key Fields for Statistics**:
```typescript
interface Order {
  id: string;              // "ORD-###"
  clientPhone: string;     // Client identifier
  serviceType: ServiceType; // ensayo, presentacion, investigacion, etc.
  operatorId: string;      // Assigned operator
  price: number;           // Quoted price
  status: OrderStatus;     // Current lifecycle state
  createdAt: string;       // ISO 8601 timestamp
  dueDate: string | null;  // Due date if set
  completedAt: string | null; // Completion timestamp
}
```

**OrderStatus enum**:
```typescript
type OrderStatus = 
  | "nueva"
  | "pendiente_pago"
  | "en_progreso"
  | "revision"
  | "pendiente_final"
  | "completada"
  | "cancelada";
```

**Dexie Table**: `orders`

### 3. Client (already exists)

**Purpose**: Represents a student/customer who has placed orders.

**Location**: `src/lib/types/index.ts`

**Key Fields**:
```typescript
interface Client {
  phone: string;           // Primary identifier
  name: string;            // Display name
  email?: string;          // Optional email
  totalOrders: number;     // Lifetime order count
  totalSpent: number;      // Lifetime spending
  subscription: SubscriptionEmbedded | null; // Current subscription
}
```

**Dexie Table**: `clients`

### 4. Subscription (already exists)

**Purpose**: Represents a recurring subscription plan.

**Location**: `src/lib/types/index.ts`

**Key Fields**:
```typescript
interface Subscription {
  id: string;              // "SUB-###"
  clientPhone: string;     // Client identifier
  type: SubscriptionType;  // basico, pro, creativo, full
  startDate: string;       // Subscription start
  endDate: string;         // Subscription end
  price: number;           // Subscription price
  status: SubscriptionStatus; // activa, vencida, cancelada, reemplazada
  monthlyQuota: number;    // Monthly service allowance
  usedPerMonth: Record<string, number>; // Usage by month
}
```

**Dexie Table**: `subscriptions`

### 5. Operator (already exists)

**Purpose**: Represents a system user (one of the two operators).

**Location**: `src/lib/types/index.ts`

**Key Fields**:
```typescript
interface Operator {
  id: string;              // "op_001" or "op_002"
  username: string;        // Login username
  displayName: string;     // Display name
  services: ServiceType[]; // Services this operator handles
  color: string;           // UI color identifier
  active: boolean;         // Whether operator is active
}
```

**Dexie Table**: `operators`

### 6. Config (already exists)

**Purpose**: Application configuration and settings.

**Location**: `src/lib/types/index.ts`

**Key Fields**:
```typescript
interface Config {
  id: string;              // "app"
  sessionTimeoutHours: number; // Session timeout
  orderCounter: number;    // Next order ID
  subscriptionCounter: number; // Next subscription ID
  notificationEnabled: boolean; // Notifications toggle
  // ... other config fields
}
```

**Dexie Table**: `config`

## Derived Data (Not Persisted)

### Dashboard Statistics

**Purpose**: Real-time summary of business metrics.

**Calculation**: Computed from existing entities on-the-fly.

**Fields**:
```typescript
interface DashboardStats {
  // Monthly summary
  totalOrders: number;
  ordersByStatus: Record<OrderStatus, number>;
  ordersByOperator: Record<string, number>;
  
  // Revenue
  estimatedRevenue: number; // Sum of order prices + subscription fees
  
  // Activity
  recentActivity: ActivityLogEntry[]; // Last N actions
  
  // Renewals
  upcomingRenewals: Subscription[]; // Subscriptions ending soon
}
```

**Source Data**:
- `totalOrders`: Count of orders where `createdAt` is in current month
- `ordersByStatus`: Group orders by `status` field
- `ordersByOperator`: Group orders by `operatorId` field
- `estimatedRevenue`: Sum of `price` field from orders + active subscription prices
- `recentActivity`: Latest entries from `activityLog` table
- `upcomingRenewals`: Subscriptions where `endDate` is within 15 days

## Validation Rules

### ActivityLogEntry
- `id`: Required, unique, format "LOG-###"
- `operatorId`: Required, must exist in operators table
- `action`: Required, must be valid ActionType
- `targetId`: Required, must reference existing resource
- `details`: Required, non-empty string
- `timestamp`: Required, valid ISO 8601 date

### Order Statistics
- `price`: Must be non-negative number
- `status`: Must be valid OrderStatus
- `createdAt`: Must be valid date for monthly filtering

### Subscription Statistics
- `price`: Must be non-negative number
- `status`: Must be "activa" to be included in revenue calculation
- `endDate`: Must be valid date for renewal filtering

## State Transitions

### Activity Log
- **Immutable**: Once created, activity log entries cannot be modified or deleted
- **Append-only**: New entries are added in chronological order

### Order Status (existing)
- As defined in `src/lib/orders/stateMachine.ts`
- Statistics reflect current status distribution

## Data Volume Assumptions

| Entity | Expected Volume | Growth Rate |
|--------|----------------|-------------|
| ActivityLogEntry | 100-10,000 entries | 10-50 entries/day |
| Order | 50-1,000 orders | 5-20 orders/month |
| Client | 20-500 clients | 2-10 clients/month |
| Subscription | 10-100 active | 2-5 new/month |
| Operator | 2 (fixed) | None |

## Indexes

### ActivityLogEntry
- Primary key: `id`
- Index: `timestamp` (for chronological ordering)
- Index: `operatorId` (for operator filtering)
- Index: `action` (for action type filtering)

### Order
- Primary key: `id`
- Index: `createdAt` (for monthly filtering)
- Index: `operatorId` (for operator statistics)
- Index: `status` (for status distribution)

### Subscription
- Primary key: `id`
- Index: `status` (for active subscription queries)
- Index: `endDate` (for renewal alerts)