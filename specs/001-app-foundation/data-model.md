# Data Model: App Foundation (Fundación de la App)

**Feature**: 001-app-foundation
**Date**: 2026-07-19
**Spec**: [spec.md](./spec.md) · **Research**: [research.md](./research.md)

Modelo de datos local (IndexedDB vía Dexie). Todas las entidades viven en el
navegador del operador; no hay servidor.

## Entity: Operator (Operador)

Persona autorizada a usar el panel privado. Identificada por `username`.

| Campo | Tipo | Regla / Nota |
|---|---|---|
| `id` | string | Identificador único del operador. |
| `username` | string | Único; usado en el login. Indexado. |
| `displayName` | string | Nombre visible en el header del panel. |
| `passwordHash` | string | Hash SHA-256 de la contraseña (nunca texto plano). |
| `role` | "operator" | Rol dentro del negocio de dos personas. |
| `createdAt` | number (epoch ms) | Auditoría. |

**Uniqueness**: `username` único (índice). Dos operadores en total.

**Estado**: estático tras seeding (esta fase no cubre alta/edición de operadores;
queda para fases posteriores).

## Entity: Config (Configuración)

Parámetros globales del negocio y fuente de valores iniciales.

| Campo | Tipo | Regla / Nota |
|---|---|---|
| `id` | string | Clave fija (ej. `"app"`). |
| `sessionTimeoutHours` | number | Horas hasta expirar la sesión (FR-4). |
| `orderCounter` | number | Contador para generar IDs `ORD-###`. |
| `subscriptionCounter` | number | Contador para generar IDs `SUB-###`. |
| `priceRanges` | object | Rangos de precios por servicio (principio IV). |
| `createdAt` / `updatedAt` | number | Auditoría. |

**Uniqueness**: un único registro de configuración (id fijo).

## Entity: Session (Sesión)

Estado de acceso del operador en su dispositivo (no es store persistente de
negocio, vive en `localStorage`).

| Campo | Tipo | Regla / Nota |
|---|---|---|
| `operatorId` | string | Referencia al Operator autenticado. |
| `username` | string | Para mostrar en header. |
| `loginAt` | number (epoch ms) | Inicio de sesión. |
| `expiresAt` | number (epoch ms) | `loginAt + sessionTimeoutHours*3600_000`. |

**Transición / validación**:
- Login válido → crea Session con `expiresAt`.
- Cada acceso protegido → si `now > expiresAt`, Session se elimina y se redirige
  a login (FR-4).
- Logout → elimina Session.

## Stores (Dexie)

- `operators` — clave `id`, índice `username`.
- `config` — clave `id`.
- (futuras fases) `orders`, `clients`, `subscriptions`, `activityLog` — ya
  declaradas en `delegaDb.ts` pero fuera de alcance de esta fase.

## Seeding (primer arranque)

Si `config` está vacío al iniciar:
1. Insertar registro `config` con `sessionTimeoutHours`, contadores en 0 y
   `priceRanges` por defecto.
2. Insertar dos registros `operators` con sus `passwordHash` (definidos por los
   dueños vía `.env.example` / hashes).

## Validation Rules (de los requisitos)

- No se almacena contraseña en texto plano (solo `passwordHash`).
- Login compara SHA-256(`passwordIngresada`) === `operator.passwordHash`.
- Session expirada → acceso denegado.
- Rutas de panel sin Session → redirigidas a login (FR-5).
