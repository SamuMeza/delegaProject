# Data Model: Landing + Formulario (Fuente de Clientes)

**Branch**: `003-fuente-clientes`
**Date**: 2026-07-22

---

## Entities

### OrderRequest (Solicitud de Orden)

Temporary in-memory structure created by the client before sending via WhatsApp.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `serviceType` | `ServiceType` | Yes | One of the 6 service types |
| `clientName` | `string` | Yes | Student's full name |
| `clientContact` | `string` | Yes | WhatsApp/Telegram/Email contact |
| `description` | `string` | Yes | Free-text description of the work |
| `parameters` | `Record<string, unknown>` | Yes | Dynamic fields specific to the `serviceType` (e.g., page count for essay, slide count for presentation) |
| `estimatedPrice` | `number` | Yes | Calculated by `pricing.ts` in real-time |
| `createdAt` | `string` (ISO 8601) | Yes | Timestamp of form creation |

**Validation Rules:**
- `serviceType` must be one of the 6 defined `ServiceType` values
- `clientContact` must be a non-empty string
- All required fields for the given `serviceType` must be present in `parameters`
- `estimatedPrice` must be a positive number within the configured range ($3–$15 per task)

**State Transitions:**
- This is a transient client-side structure; it has no lifecycle states.
- It is serialized into the WhatsApp message and optionally into the TrackingToken.

---

### TrackingToken (Token de Seguimiento)

A signed token used to verify the authenticity of tracking URLs shared with clients.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Order ID in `ORD-###` format |
| `clientName` | `string` | Yes | Client's name |
| `serviceType` | `ServiceType` | Yes | Type of service requested |
| `status` | `OrderStatus` | Yes | Current order status |
| `description` | `string` | Yes | Work description |
| `price` | `number` | Yes | Final price |
| `dueDate` | `string` (ISO 8601) | Yes | Expected delivery date |
| `paymentStatus` | `PaymentStatus` | Yes | One of: `unpaid`, `paid`, `partial` |
| `verificationHash` | `string` | Yes | SHA-256 hash of serialized data + `BUN_PUBLIC_TRACKING_SALT` |

**Token Format:**
```
Base64(JSON.stringify({id, clientName, serviceType, status, description, price, dueDate, paymentStatus}) + '.' + SHA256(serializedData + BUN_PUBLIC_TRACKING_SALT))
```

**Verification Process:**
1. Decode the Base64 token
2. Split on the last `.` to get payload and signature
3. Recompute SHA-256 of payload + salt
4. Compare signatures — if mismatch, reject as tampered

---

### ServiceType (Enumerado)

The 6 supported service types, defined statically in the form component code (`src/pages/DelegatePage.tsx` or equivalent).

| Value | Description | Example Conditional Fields |
|-------|-------------|---------------------------|
| `ensayo` | Essay writing service | Word count, academic level, topic area |
| `presentacion` | Presentation creation | Slide count, audience level, visual style |
| `investigacion` | Research service | Topic, sources required, length |
| `formato` | Formatting service | Document type, page count, formatting style |
| `diseno` | Design service | Design type, dimensions, deliverables |
| `video` | Video editing service | Duration, resolution, style |

**Conditional Fields:** Each `ServiceType` maps to a specific set of form fields defined in the `ServiceTypeConfig` in the frontend codebase.

---

### OrderStatus (Enumerado)

The lifecycle states an order can be in within the operator's system.

| Status | Description |
|--------|-------------|
| `nueva` | New order received via WhatsApp |
| `pendiente_pago` | Waiting for client payment (Pago Móvil) |
| `en_progreso` | Work has started |
| `revision` | Work completed, awaiting client review |
| `pendiente_final` | Awaiting final approval from client |
| `completada` | Order delivered and complete |
| `cancelada` | Order was cancelled |

---

### PaymentStatus (Enumerado)

Tracks payment collection state per order.

| Status | Description |
|--------|-------------|
| `unpaid` | No payment received yet |
| `paid` | Payment fully received |
| `partial` | Partial payment received |

---

### Config (Configuration Store)

Single-row configuration store loaded from IndexedDB for client-facing data.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Always `"app"` |
| `faqs` | `Array<{question: string, answer: string}>` | FAQ items displayed on Contact page |
| `pagoMovil` | `{bank: string, rif: string, phone: string}` | Pago Móvil account details |
| `whatsappNumber` | `string` | Business WhatsApp number (also in env var `BUN_PUBLIC_WHATSAPP_NUMBER`) |
| `pricing` | `PricingConfig` | Pricing ranges and rules |
| `disclaimers` | `string[]` | Legal/academic disclaimers |

---

### ActivityLogEntry (Audit Trail)

Records all actions taken on orders for traceability.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Auto-generated unique ID |
| `operatorId` | `string` | ID of the operator who took the action |
| `targetId` | `string` | ID of the order or subscription the action relates to |
| `action` | `string` | Action type (e.g., `create_order`, `update_order`, `change_status`, `add_note`, `upload_file`, `delete_attachment`) |
| `timestamp` | `string` (ISO 8601) | When the action occurred |
| `details` | `Record<string, unknown>` | Additional context about the action |

---

## Relationships

- `OrderRequest` → transient (client-side only, not persisted)
- `TrackingToken` → derived from `OrderRequest` data + signed hash
- `OrderStatus` → used by `Order` entity in the admin panel (separate from this feature's transient `OrderRequest`)
- `PaymentStatus` → used in both `OrderRequest` (estimated) and `Order` (actual)
- `Config` → single-row lookup, used by Contact page for dynamic content
- `ActivityLogEntry` → references `Order` via `targetId`