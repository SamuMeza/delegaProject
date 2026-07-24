# Data Model: Suscripciones y Clientes

**Date**: 2026-07-24 | **Feature**: Suscripciones y Clientes

## Entities

### Client (existente, con ampliaciones)

Representa un estudiante/padre que solicita servicios de forma recurrente.

| Campo | Tipo | Descripción | Validación |
|-------|------|-------------|-----------|
| `phone` | `string` (PK) | Número de teléfono (ID único) | Formato venezolano 04XX-XXXXXXX |
| `name` | `string` | Nombre completo | No vacío, máximo 100 caracteres |
| `totalOrders` | `number` | Total de órdenes creadas | ≥ 0, auto-incremento |
| `totalSpent` | `number` | Total gastado en Bs/USD | ≥ 0 |
| `subscription` | `SubscriptionEmbedding \| null` | Suscripción activa embebida (copia) | null si no tiene |
| `history` | `string[]` | IDs de órdenes del cliente | Orden cronológico descendente |

**Relaciones**:
- 1 cliente → N órdenes (vía `Order.clientPhone`)
- 1 cliente → N suscripciones (vía `Subscription.clientPhone`)
- 0..1 suscripción activa por cliente (FR-008)

**Índices Dexie**: `phone` (PK), `name`

---

### Subscription (existente, con ampliaciones)

Plan trimestral que otorga un cupo mensual de órdenes.

| Campo | Tipo | Descripción | Validación |
|-------|------|-------------|-----------|
| `id` | `string` (PK) | ID único `SUB-###` | Formato `SUB-\d{3}` |
| `clientPhone` | `string` | Teléfono del cliente vinculado | Debe existir en clients |
| `type` | `SubscriptionType` | Tipo de suscripción (`basico`, `pro`, `creativo`, `full`) | Enum |
| `startDate` | `string` (ISO) | Fecha de inicio | Formato YYYY-MM-DD |
| `endDate` | `string` (ISO) | Fecha de fin (inicio + 3 meses) | Calculado automáticamente |
| `price` | `number` | Precio pagado (~$25 USD) | ≥ 0 |
| `status` | `SubscriptionStatus` | Estado actual | `activa`, `vencida`, `cancelada`, `reemplazada` |
| `monthlyQuota` | `number` | Cupo de órdenes por mes | ≥ 1 |
| `usedPerMonth` | `Record<string, number>` | Órdenes consumidas por mes (key `YYYY-MM`) | Reinicio automático |

**Relaciones**:
- N suscripciones → 1 cliente (vía `clientPhone`)
- 1 suscripción → N órdenes (vía `Order.subscriptionId`)

**Índices Dexie**: `id` (PK), `clientPhone`, `status`

---

### Order (existente — ampliación)

| Campo Nuevo | Tipo | Descripción | Validación |
|-------------|------|-------------|-----------|
| `subscriptionId` | `string \| null` | Suscripción que cubre esta orden (existente) | null si orden suelta |
| `coverageTipo` | `CoverageTipo` | Tipo de cobertura | `estandar`, `cubierta_por_suscripcion`, `suelta_con_descuento` |

**Nuevo tipo**:
```typescript
type CoverageTipo = "estandar" | "cubierta_por_suscripcion" | "suelta_con_descuento";
```

---

### Config (existente — ampliación de contador)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `subscriptionCounter` | `number` | Contador para IDs `SUB-###` (ya existe) |

No requiere cambios. El contador ya está definido y seedeado en 0.

---

## State Transitions

### Subscription

```
creada → activa
activa → vencida (por fecha)
activa → reemplazada (por nueva suscripción)
vencida → activa (por renovación)
cualquiera → cancelada (por operador)
```

### Reglas de transición

- **creada → activa**: Al guardar, si `startDate <= today` y `endDate > today`.
- **activa → vencida**: Automático cuando `today > endDate`. Se verifica al crear orden o al cargar la UI.
- **activa → reemplazada**: Cuando se crea una nueva suscripción para el mismo cliente (solo una activa a la vez).
- **renovación**: No cambia de estado la suscripción existente; se crea una nueva con nuevo período. La anterior se marca `reemplazada`.
- **cancelada**: Acción manual del operador. No se puede reactivar.

---

## Validation Rules

| Regla | Descripción |
|-------|-------------|
| VR-001 | Client.phone es único y no vacío |
| VR-002 | Subscription.clientPhone debe referenciar un Client existente |
| VR-003 | Subscription.endDate = startDate + 3 meses (sin prorrateo) |
| VR-004 | Un cliente solo puede tener 1 suscripción activa a la vez |
| VR-005 | Al crear orden, si subscription activa tiene cupo → coverageTipo = "cubierta_por_suscripcion" |
| VR-006 | Al crear orden, si subscription activa excede cupo → coverageTipo = "suelta_con_descuento" |
| VR-007 | Al crear orden, si no hay suscripción activa → coverageTipo = "estandar" |
| VR-008 | usedPerMonth[key] ≤ monthlyQuota para órdenes cubiertas |
| VR-009 | No se permite eliminar Client con órdenes o suscripciones asociadas |

---

## ID Generation

```
formato: SUB-###
patrón: SUB-001, SUB-002, ...
fuente: Config.subscriptionCounter (incremento atómico vía db.transaction)
```

Mismo patrón que `ORD-###` existente.