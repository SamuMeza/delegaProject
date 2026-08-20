# Setup de Supabase

## Crear proyecto

1. Ir a [supabase.com](https://supabase.com) → Sign Up / Sign In
2. Create New Project
3. Seleccionar región (US East recommended for Venezuela)
4. Anotar la **URL** y **anon key** (public API key)

## Configurar variables de entorno

Agregar en `.env` (local) y en Vercel Dashboard:

```env
BUN_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
BUN_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu_anon_key_aqui
```

## Crear tablas

Ejecutar en Supabase SQL Editor el script `supabase/seed.sql`.

### Resumen de tablas

| Tabla | Propósito |
|-------|-----------|
| `operators` | Credenciales y datos de los dos operadores |
| `clients` | Información de clientes (teléfono, nombre, email, notas) |
| `orders` | Órdenes de servicio (estado, precio, pagos, notas) |
| `subscriptions` | Suscripciones trimestrales de clientes |
| `activity_log` | Audit trail de acciones |
| `config` | Contadores de ID y configuración de la app |
| `stats` | Estadísticas pre-calculadas |
| `order_attachments` | Archivos adjuntos de órdenes |

## Configurar Row Level Security (RLS)

**Opcional para el setup actual.** La app accede a Supabase desde el cliente
con la anon key. Si se desea restringir acceso, configurar RLS policies.

Para el setup actual, RLS puede estar deshabilitado (ya que las credenciales
son públicas en el bundle del cliente).

## Seed

El archivo `supabase/seed.sql` inserta datos iniciales:
- 2 operadores (`op_001`, `op_002`)
- Configuración por defecto (contadores en 0)
- Clientes y órdenes de ejemplo (opcional)

Ejecutar en Supabase SQL Editor después de crear las tablas.

## Verificar conexión

```bash
bun dev
# Abrir panel admin → Login con op_001 / password
# Si funciona, la conexión a Supabase está activa
```
