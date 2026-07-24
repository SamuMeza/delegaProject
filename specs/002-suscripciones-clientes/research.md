# Research: Suscripciones y Clientes

**Date**: 2026-07-24 | **Feature**: Suscripciones y Clientes

## Existing Infrastructure (foundational)

Tras inspeccionar el codebase, se descubrió que la fundación (001-app-foundation) ya anticipó este feature:

| Componente | Estado | Detalle |
|-----------|--------|---------|
| `Client` interface | ✅ Existe | `phone` (PK), `name`, `totalOrders`, `totalSpent`, `subscription` (embedded), `history` |
| `Subscription` interface | ✅ Existe | `id`, `clientPhone`, `type`, `startDate`, `endDate`, `price`, `status`, `monthlyQuota`, `usedPerMonth` |
| `SubscriptionEmbedded` | ✅ Existe | Subset usado dentro de `Client.subscription` |
| `SubscriptionType` | ✅ Existe | `"basico" | "pro" | "creativo" | "full"` |
| `SubscriptionStatus` | ✅ Existe | `"activa" | "vencida" | "cancelada"` — sin `"reemplazada"` (añadir) |
| `Order.subscriptionId` | ✅ Existe | `string | null` — falta `coverage_tipo` |
| `Config.subscriptionCounter` | ✅ Existe | Para IDs `SUB-###` |
| DB store `clients` | ✅ Existe | Keyed by `phone` |
| DB store `subscriptions` | ✅ Existe | Keyed by `id`, indexed by `clientPhone` |
| Rutas `/admin/clientes/*` | ✅ Existen | `ClientsListPage`, `ClientDetailPage`, `SubscriptionsPage` (stubs) |
| Nav link "Clientes" | ✅ Existe | En `AdminLayout.tsx` |
| `ActionType` | ✅ Existe | Ya incluye `create_subscription`, `cancel_subscription` |
| Dexie version | ⚠️ v1 | Necesita migrar a v2 con nuevos índices para `clients` y filtros de suscripciones |

## Key Decisions

- **Decision**: Subscription IDs siguen patrón `SUB-###` usando `Config.subscriptionCounter`.
  - **Rationale**: Ya existe el contador en Config y es el mismo patrón que `ORD-###`.
  - **Alternatives considered**: UUID (innecesario para 2 operadores, menos legible).

- **Decision**: `SubscriptionEmbedded` dentro de `Client` se actualiza al crear/modificar suscripción.
  - **Rationale**: Evita joins frecuentes en el listado de clientes.
  - **Alternatives considered**: Calcular desde tabla `subscriptions` (más queries, datos desactualizados sin sincronización forzada).

- **Decision**: Se añade `coverage_tipo: "estandar" | "cubierta_por_suscripcion" | "suelta_con_descuento"` a `Order`.
  - **Rationale**: Permite rastrear cómo se cobró cada orden sin depender de joins.
  - **Alternatives considered**: Calcular al vuelo en UI (riesgo de inconsistencia visual).

- **Decision**: `usedPerMonth` sigue siendo `Record<string, number>` (key = mes "YYYY-MM").
  - **Rationale**: Ya implementado así en la interfaz. Permite histórico mensual sin migración.
  - **Alternatives considered**: Campo único `usedThisMonth: number` (pierde histórico, requiere reinicio manual).

- **Decision**: Reinicio mensual automático vía validación al crear orden.
  - **Rationale**: Si `usedPerMonth` no tiene key para el mes actual, se inicializa en 0. No requiere cron.
  - **Alternatives considered**: Timer/interval (innecesario en SPA sin backend).

- **Decision**: No se crean componentes nuevos en `src/components/admin/`.
  - **Rationale**: Las páginas existentes y stubs son livianos (< 100 líneas). Se implementa inline.
  - **Alternatives considered**: Componentes separados (sobreingeniería para el tamaño actual).

- **Decision**: Alerta de renovación se implementa como sección en `DashboardPage.tsx`.
  - **Rationale**: El dashboard ya existe y es el primer lugar que ve el operador al entrar.
  - **Alternatives considered**: Modal al login (molesto si no hay action requerida).

## Dexie Migration Strategy

- **Current version**: 1
- **Target version**: 2 (añadir índices para queries de suscripciones activas por cliente)
- **New store def**: `clients: "phone, name"` (añadir name como índice para búsqueda)
- **No data migration needed**: Solo añadir índices, Dexie maneja la migración automática.

## Spec Compliance

- ✅ FR-001 a FR-010 cubiertos por extensión de tipos existentes + lógica en páginas stub
- ✅ Los Acceptance Scenarios de las 4 User Stories son verificables
- ✅ Edge cases documentados en spec ya consideran el modelo existente
- ⚠️ `SubscriptionStatus` no incluye `"reemplazada"` — necesario para FR-008. Se añade.

## Risks

- **Bajo**: Los stubs existentes pueden tener código incompatible con la nueva lógica. Se reemplazan completamente.
- **Bajo**: La relación entre `Client.subscription` (embedded) y `Subscription` (tabla separada) puede desincronizarse. Se actualiza embedded al crear/modificar.
- **Ninguno**: Sin backend, sin costos, sin dependencias externas nuevas.