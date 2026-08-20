# Arquitectura del Sistema

## Visión general

Delega es una SPA (Single Page Application) con backend serverless en Supabase.
Los estudiantes envían solicitudes de apoyo escolar vía WhatsApp; los dos
operadores gestionan, ejecutan, cobran y entregan desde un panel administrativo
privado.

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React SPA)                     │
│  Landing → WhatsApp → Panel Admin (Dashboard, Órdenes, etc.) │
│                                                             │
│  Estado: Zustand (cache en memoria)                         │
│  Persistencia: Supabase (PostgreSQL)                        │
└───────────────────────┬─────────────────────────────────────┘
                        │ @supabase/supabase-js
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase (Serverless)                     │
│  PostgreSQL Database │ Auth │ Realtime │ Edge Functions      │
└─────────────────────────────────────────────────────────────┘
```

## Componentes

### Frontend

| Componente | Tecnología | Descripción |
|-----------|-----------|-------------|
| UI | React 19 | Componentes funcionales con hooks |
| Routing | React Router 7 | Rutas públicas + `/admin/*` protegida |
| Estado global | Zustand 5 | Cache en memoria, no persiste |
| Estilos | Tailwind CSS 4 | CSS-first, sin config file |
| Componentes UI | shadcn/ui (Radix) | Primitivas accesibles |
| Build | Bun | `bun run build.ts` → `dist/` |

### Backend (Supabase)

| Componente | Descripción |
|-----------|-------------|
| PostgreSQL | Base de datos relacional (fuente de verdad) |
| Auth | No se usa (login custom con SHA-256 en `operators`) |
| Realtime | Potencial para updates en tiempo real (futuro) |
| Edge Functions | No se usan actualmente |

## Flujo de datos

### Flujo principal: Solicitud de estudiante

```
1. Estudiante visita landing → describe tarea
2. Click "Delegar por WhatsApp" → wa.me pre-llenado
3. Operador recibe mensaje en WhatsApp
4. Operador abre panel admin → crea orden manualmente
5. Orden se guarda en Supabase (tabla `orders`)
6. Operador gestiona, ejecuta, cobra, entrega
7. Estado de orden se actualiza en Supabase
```

### Flujo de datos en tiempo real

```
Operador 1 actualiza orden → Supabase → Operador 2 ve el cambio
(en la próxima recarga o navegación)
```

## Decisiones de diseño

### ¿Por qué Supabase y no IndexedDB?

- **Antes**: IndexedDB (Dexie) — todo en el navegador, sin servidor
  - Problema: datos locales, sin sync entre dispositivos, pérdida al limpiar cache
- **Ahora**: Supabase (PostgreSQL) — backend serverless
  - Ventaja: datos persistentes, accessibles desde cualquier dispositivo,
    sin infraestructura propia, free tier generoso

### ¿Por qué Zustand para cache?

- Zustand es ligero (~1KB), sin boilerplate, con selectors eficientes
- Cachea datos de Supabase en memoria para evitar re-fetch innecesarios
- No es fuente de verdad — en page reload se re-fetch de Supabase

### ¿Por qué Bun y no Node?

- Bun es más rápido para build y dev
- Soporte nativo para TypeScript (sin config extra)
- `Bun.build()` con `define:` inyecta env vars directamente al bundle

## Stack detallado

| Capa | Tecnología | Versión | Propósito |
|------|-----------|---------|-----------|
| UI Framework | React | 19 | Componentes funcionales |
| Routing | react-router-dom | 7.18.1 | Client-side routing |
| State | Zustand | 5.0.14 | In-memory cache |
| DB Client | @supabase/supabase-js | ^2.112.2 | Comunicación con Supabase |
| CSS | Tailwind CSS | 4.3.3 | Utility-first styles |
| Icons | lucide-react | 1 | Iconografía |
| UI Primitives | shadcn/ui (Radix) | — | Componentes base |
| Build | Bun | 1.3+ | Build + dev server |
| Deploy | Vercel | — | Static hosting + SPA rewrite |
| Database | Supabase (PostgreSQL) | — | Serverless backend |
