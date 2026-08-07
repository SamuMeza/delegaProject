# Procedimiento de Migración: IndexedDB ➔ Supabase

## Paso 0: Verificación de Conexión (Completado)
Se ha configurado con éxito el cliente en [supabase.ts](file:///c:/Users/Equipo/Documents/practicasProyectos/delegaProject/src/lib/supabase.ts) y se ha verificado que la conectividad a la API REST de Supabase con la API Key pública es funcional (HTTP 404 en tablas no existentes, confirmando la validez del token y el bypass del error 401).

---

## Paso 1: Crear Tablas en Supabase (DDL SQL)
Ejecuta el siguiente script en el **SQL Editor** de tu consola de Supabase en este orden específico. Este orden previene errores de claves foráneas (`FOREIGN KEY`) al crear primero las tablas independientes y finalmente las dependientes:

```sql
-- 1. Habilitar extensión UUID por seguridad si es necesario
create extension if not exists "uuid-ossp";

-- 2. Tabla: config
create table if not exists public.config (
    id text primary key,
    session_timeout_hours numeric not null default 4,
    order_counter integer not null default 0,
    subscription_counter integer not null default 0,
    notification_enabled boolean not null default true,
    service_operator_map jsonb not null default '{}'::jsonb,
    price_ranges jsonb not null default '{}'::jsonb,
    faqs jsonb not null default '[]'::jsonb,
    pago_movil jsonb not null default '{}'::jsonb,
    disclaimers jsonb not null default '[]'::jsonb,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

-- 3. Tabla: operators
create table if not exists public.operators (
    id text primary key,
    username text not null unique,
    display_name text not null,
    password_hash text not null,
    role text not null default 'operator',
    services text[] not null default '{}',
    color text not null default '#3b82f6',
    active boolean not null default true,
    created_at timestamp with time zone not null default now()
);

-- 4. Tabla: clients
create table if not exists public.clients (
    phone text primary key,
    name text not null,
    email text,
    notes text,
    total_orders integer not null default 0,
    total_spent numeric not null default 0,
    subscription jsonb, -- Embedded subscription info
    history text[] not null default '{}',
    created_at timestamp with time zone not null default now()
);

-- 5. Tabla: subscriptions
create table if not exists public.subscriptions (
    id text primary key,
    client_phone text not null references public.clients(phone) on delete cascade,
    type text not null,
    start_date date not null,
    end_date date not null,
    price numeric not null default 0,
    status text not null,
    monthly_quota integer not null default 0,
    used_per_month jsonb not null default '{}'::jsonb,
    created_at timestamp with time zone not null default now()
);

-- 6. Tabla: orders
create table if not exists public.orders (
    id text primary key, -- ORD-###
    client_phone text not null references public.clients(phone) on delete restrict,
    client_name text not null,
    service_type text not null,
    operator_id text not null references public.operators(id) on delete restrict,
    details jsonb not null,
    has_material boolean,
    price numeric not null default 0,
    paid_amount numeric not null default 0,
    total_paid numeric not null default 0,
    payment_ref text not null default '',
    status text not null,
    urgent boolean not null default false,
    payment_status text not null default 'unpaid',
    status_history jsonb not null default '[]'::jsonb,
    created_at timestamp with time zone not null default now(),
    due_date date,
    completed_at timestamp with time zone,
    notes jsonb not null default '[]'::jsonb,
    subscription_id text references public.subscriptions(id) on delete set null,
    coverage_tipo text not null default 'estandar',
    file_urls jsonb not null default '[]'::jsonb -- URLs públicas de Storage (Paso 6)
);

-- 7. Tabla: order_attachments
create table if not exists public.order_attachments (
    id uuid primary key default gen_random_uuid(),
    order_id text not null references public.orders(id) on delete cascade,
    name text not null,
    mime text not null,
    size integer not null,
    blob_url text, -- Referencia/URL pública de Storage
    author text not null references public.operators(id) on delete restrict,
    uploaded_at timestamp with time zone not null default now()
);

-- 8. Tabla: activity_log
create table if not exists public.activity_log (
    id text primary key,
    operator_id text not null references public.operators(id) on delete restrict,
    action text not null,
    target_id text not null,
    details text not null,
    timestamp timestamp with time zone not null default now()
);

-- 9. Tabla: stats (Histórico Mensual)
create table if not exists public.stats (
    id text primary key, -- YYYY-MM
    month text not null unique,
    total_orders integer not null default 0,
    total_revenue numeric not null default 0,
    by_operator jsonb not null default '{}'::jsonb,
    completed_orders integer not null default 0,
    pending_orders integer not null default 0,
    new_clients integer not null default 0,
    returning_clients integer not null default 0,
    created_at timestamp with time zone not null default now()
);
```

---

## Paso 2: Crear Bucket de Archivos
1. Dirígete a la sección de **Storage** en tu panel de control de Supabase.
2. Crea un nuevo Bucket público haciendo clic en **New Bucket**.
3. Nómbralo estrictamente como: `order-files`.
4. Habilita la opción de **Public bucket** para que los archivos puedan ser leídos de forma directa mediante su URL.
5. Configura las siguientes políticas de almacenamiento (Policies) para el bucket `order-files` en el editor de políticas:
   - **Permitir lectura anónima (SELECT):** Permitir a todo el mundo (roles `anon` y `authenticated`) leer archivos.
   - **Permitir escritura anónima (INSERT/UPDATE):** Permitir inserciones a cualquier rol.

---

## Paso 3: Mapeo de Nombres de Campos (IndexedDB ➔ PostgreSQL)
Dado que PostgreSQL utiliza la convención de nomenclatura `snake_case`, aquí tienes el mapa de conversión de campos aplicados en los esquemas DDL y necesarios para las queries:

### Tabla `config`
- `sessionTimeoutHours` ➔ `session_timeout_hours`
- `orderCounter` ➔ `order_counter`
- `subscriptionCounter` ➔ `subscription_counter`
- `notificationEnabled` ➔ `notification_enabled`
- `serviceOperatorMap` ➔ `service_operator_map`
- `priceRanges` ➔ `price_ranges`
- `pagoMovil` ➔ `pago_movil`
- `createdAt` ➔ `created_at`
- `updatedAt` ➔ `updated_at`

### Tabla `operators`
- `displayName` ➔ `display_name`
- `passwordHash` ➔ `password_hash`
- `createdAt` ➔ `created_at`

### Tabla `clients`
- `totalOrders` ➔ `total_orders`
- `totalSpent` ➔ `total_spent`
- `createdAt` ➔ `created_at`

### Tabla `subscriptions`
- `clientPhone` ➔ `client_phone`
- `startDate` ➔ `start_date`
- `endDate` ➔ `end_date`
- `monthlyQuota` ➔ `monthly_quota`
- `usedPerMonth` ➔ `used_per_month`
- `createdAt` ➔ `created_at`

### Tabla `orders`
- `clientPhone` ➔ `client_phone`
- `clientName` ➔ `client_name`
- `serviceType` ➔ `service_type`
- `operatorId` ➔ `operator_id`
- `hasMaterial` ➔ `has_material`
- `paidAmount` ➔ `paid_amount`
- `totalPaid` ➔ `total_paid`
- `paymentRef` ➔ `payment_ref`
- `paymentStatus` ➔ `payment_status`
- `statusHistory` ➔ `status_history`
- `createdAt` ➔ `created_at`
- `dueDate` ➔ `due_date`
- `completedAt` ➔ `completed_at`
- `subscriptionId` ➔ `subscription_id`
- `coverageTipo` ➔ `coverage_tipo`
- **`fileUrls` (Paso 6)** ➔ `file_urls` (JSONB array de URLs en la base de datos)

### Tabla `order_attachments`
- `orderId` ➔ `order_id`
- `blob` ➔ `blob_url` (Almacenado como referencia/URL de Supabase Storage en vez de datos crudos IndexedDB)
- `uploadedAt` ➔ `uploaded_at`

### Tabla `activity_log`
- `operatorId` ➔ `operator_id`
- `targetId` ➔ `target_id`

### Tabla `stats`
- `totalOrders` ➔ `total_orders`
- `totalRevenue` ➔ `total_revenue`
- `byOperator` ➔ `by_operator`
- `completedOrders` ➔ `completed_orders`
- `pendingOrders` ➔ `pending_orders`
- `newClients` ➔ `new_clients`
- `returningClients` ➔ `returning_clients`
- `createdAt` ➔ `created_at`
