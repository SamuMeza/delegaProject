# Schema de Base de Datos

## Diagrama de relaciones

```
operators ──────┐
                │
clients ────────┼─── orders
                │
subscriptions ──┘
                │
activity_log ───┘ (references operators)
config          (singleton)
stats           (agregados)
order_attachments ── orders
```

## Tablas

### `operators`

Almacena credenciales y datos de los dos operadores.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | text | PK | Identificador único (ej: `op_001`) |
| `username` | text | UNIQUE NOT NULL | Usuario para login |
| `display_name` | text | NOT NULL | Nombre visible en el panel |
| `password_hash` | text | NOT NULL | SHA-256 de la contraseña |
| `role` | text | NOT NULL | Rol (actualmente `operator`) |
| `services` | text[] | NOT NULL | Tipos de servicio asignados |
| `color` | text | NOT NULL | Color hex para el operador |
| `active` | boolean | NOT NULL DEFAULT true | Si el operador está activo |
| `created_at` | timestamp with time zone | NOT NULL DEFAULT now() | Fecha de creación |

### `clients`

Información de clientes contactados.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `phone` | text | PK | Teléfono (formato local, ej: `0412-1234567`) |
| `name` | text | NOT NULL | Nombre del cliente |
| `email` | text | | Email (opcional) |
| `notes` | text | | Notas (opcional) |
| `total_orders` | integer | NOT NULL DEFAULT 0 | Contador de órdenes |
| `total_spent` | numeric | NOT NULL DEFAULT 0 | Total gastado |
| `subscription` | jsonb | | Suscripción activa (snapshot) |
| `history` | jsonb | DEFAULT '{}' | Historial de actividad |

### `orders`

Órdenes de servicio — la tabla central del sistema.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | text | PK | ID único (ej: `ORD-001`) |
| `client_phone` | text | FK → clients.phone | Teléfono del cliente |
| `client_name` | text | NOT NULL | Nombre del cliente al momento de crear |
| `service_type` | text | NOT NULL | Tipo de servicio |
| `operator_id` | text | FK → operators.id | Operador asignado |
| `details` | jsonb | NOT NULL | Detalles del servicio (varía por tipo) |
| `has_material` | boolean | NOT NULL DEFAULT false | Si el cliente provee material |
| `price` | numeric | NOT NULL | Precio acordado |
| `paid_amount` | numeric | NOT NULL DEFAULT 0 | Cuánto ha pagado |
| `total_paid` | numeric | NOT NULL DEFAULT 0 | Total pagado acumulado |
| `payment_ref` | text | | Referencia de pago |
| `status` | text | NOT NULL DEFAULT 'nueva' | Estado de la orden |
| `urgent` | boolean | NOT NULL DEFAULT false | Si es urgente |
| `payment_status` | text | NOT NULL DEFAULT 'pendiente' | Estado de pago |
| `status_history` | jsonb | DEFAULT '[]' | Historial de cambios de estado |
| `created_at` | timestamp with time zone | NOT NULL DEFAULT now() | Fecha de creación |
| `due_date` | text | | Fecha de entrega |
| `completed_at` | timestamp with time zone | | Fecha de completado |
| `notes` | jsonb | DEFAULT '[]' | Notas de la orden |
| `subscription_id` | text | | ID de suscripción aplicable |
| `coverage_tipo` | text | | Tipo de cobertura |

### `subscriptions`

Suscripciones trimestrales de clientes.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | text | PK | ID único (ej: `SUB-001`) |
| `client_phone` | text | FK → clients.phone | Teléfono del cliente |
| `type` | text | NOT NULL | Tipo de suscripción |
| `start_date` | text | NOT NULL | Fecha de inicio (YYYY-MM-DD) |
| `end_date` | text | NOT NULL | Fecha de fin (YYYY-MM-DD) |
| `price` | numeric | NOT NULL | Precio de la suscripción |
| `status` | text | NOT NULL DEFAULT 'activa' | Estado |
| `monthly_quota` | integer | NOT NULL | Cupo mensual de órdenes |
| `used_per_month` | jsonb | DEFAULT '{}' | Órdenes usadas por mes |

### `activity_log`

Audit trail de acciones realizadas.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | text | PK | ID único (UUID) |
| `operator_id` | text | FK → operators.id | Operador que realizó la acción |
| `action` | text | NOT NULL | Tipo de acción |
| `target_id` | text | NOT NULL | ID del objeto afectado |
| `details` | text | NOT NULL | Descripción de la acción |
| `timestamp` | timestamp with time zone | NOT NULL | Fecha y hora de la acción |

### `config`

Configuración singleton de la app.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | text | PK | Siempre `app` |
| `session_timeout_hours` | integer | NOT NULL DEFAULT 8 | Horas de expiración de sesión |
| `order_counter` | integer | NOT NULL DEFAULT 0 | Contador para IDs de órdenes |
| `subscription_counter` | integer | NOT NULL DEFAULT 0 | Contador para IDs de suscripciones |
| `notification_enabled` | boolean | NOT NULL DEFAULT true | Notificaciones activadas |
| `service_operator_map` | jsonb | NOT NULL | Mapeo servicio → operador |
| `price_ranges` | jsonb | NOT NULL | Rangos de precio por servicio |
| `faqs` | jsonb | DEFAULT '[]' | Preguntas frecuentes |
| `pago_movil` | jsonb | DEFAULT '{}' | Datos de Pago Móvil |
| `disclaimers` | jsonb | DEFAULT '[]' | Avisos legales |
| `created_at` | timestamp with time zone | NOT NULL | Fecha de creación |
| `updated_at` | timestamp with time zone | NOT NULL | Última actualización |

### `stats`

Estadísticas pre-calculadas (agregados).

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | text | PK | Identificador del snapshot |
| `data` | jsonb | NOT NULL | Estadísticas calculadas |
| `updated_at` | timestamp with time zone | NOT NULL | Última actualización |

### `order_attachments`

Archivos adjuntos de órdenes.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | text | PK | ID único |
| `order_id` | text | FK → orders.id | Orden asociada |
| `filename` | text | NOT NULL | Nombre del archivo |
| `url` | text | NOT NULL | URL del archivo |
| `size` | integer | | Tamaño en bytes |
| `uploaded_at` | timestamp with time zone | NOT NULL DEFAULT now() | Fecha de subida |

## Estados de orden

Valores permitidos para `orders.status`:

```
nueva → pendiente_pago → en_progreso → revision → pendiente_final → completada
                                                                    ↗
                                            cancelada ←─────────────┘
```

Ver transiciones válidas en `src/lib/orders/stateMachine.ts`.

## Estados de suscripción

```
activa → vencida (automático por fecha)
activa → cancelada (manual)
activa → reemplazada (al crear nueva)
```
