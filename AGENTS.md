# AGENTS.md — Delega

Agent guidance for the Delega project. Read this before editing code.

## Qué es Delega

Servicio de apoyo escolar en Venezuela operado por dos personas. SPA con backend
Supabase (PostgreSQL serverless). Los estudiantes entran por la landing y su
solicitud llega por WhatsApp; los operadores gestionan y entregan desde un panel
privado. No es un marketplace: es una herramienta de coordinación para un negocio
de dos personas.

Reglas de negocio completas en `.specify/memory/constitution.md` (versión 2.0.0).

## Principios de la constitución (obligatorios)

- **I. Supabase como fuente de verdad.** Todos los datos se persisten en
  Supabase PostgreSQL. El frontend es un React SPA que se comunica con Supabase
  vía `@supabase/supabase-js`. Deploy estático en Vercel.
- **II. WhatsApp-first.** La landing genera un mensaje pre-llenado `wa.me`; el
  operador registra la orden manualmente en el panel.
- **III. Seguimiento estructurado.** Toda orden tiene un estado enumerado
  (`nueva`, `pendiente_pago`, `en_progreso`, `revision`, `pendiente_final`,
  `completada`, `cancelada`). Ver transiciones en `src/lib/orders/stateMachine.ts`.
- **IV. Precios Venezuela / Pago Móvil.** Rangos $3–$15, suscripciones trimestrales
  (~$25), seguimiento de pago por orden. Ver `src/lib/pricing.ts`.
- **V. Simplicidad y reutilización.** YAGNI: solo lo que reduce caos o coordina.

## Stack y versiones

| Tecnología | Versión | Uso |
|---|---|---|
| React | 19 | UI |
| react-dom | 19 | Render |
| react-router-dom | 7.18.1 | Rutas SPA (públicas + `/admin/*`) |
| Zustand | 5.0.14 | Estado global (cache en memoria) |
| @supabase/supabase-js | ^2.112.2 | Cliente Supabase |
| Tailwind CSS | 4.3.3 | Estilos (v4 CSS-first, sin `tailwind.config.js`) |
| tw-animate-css | 1.4.0 | Animaciones |
| lucide-react | 1 | Íconos |
| class-variance-authority | 0.7.1 | Variantes de componentes |
| tailwind-merge | 3.6.0 | Merge de clases |
| clsx | 2.1.1 | Clases condicionales |
| bun-plugin-tailwind | 0.1.2 | Plugin de build Tailwind para Bun |
| shadcn/ui (Radix) | — | Componentes base en `src/components/ui` |

Runtime: **Bun** (no Node). Build estático con `bun run build.ts` → `dist/`.

## Documentación de las tecnologías

Referencias locales (en `node_modules`) y oficiales. Úsalas antes de escribir
código contra una librería.

### Supabase (PostgreSQL)
- Oficial: https://supabase.com/docs
- Cliente JS: https://supabase.com/docs/reference/javascript
- `src/lib/supabase.ts` — inicialización del cliente
- `src/lib/orders/service.ts` — capa de servicio (operaciones secuenciales)
- `src/lib/db/activity.ts` — audit trail

### Zustand
- Local: `node_modules/zustand/README.md`
- Oficial: https://github.com/pmndrs/zustand

### React Router (v7)
- Local: `node_modules/react-router-dom/README.md`
- Oficial: https://reactrouter.com
- Rutas en `src/App.tsx`. Admin con `React.lazy` + `Suspense`.

### React (v19)
- Local: `node_modules/react/README.md`
- Oficial: https://react.dev

### Tailwind CSS (v4)
- Local: `node_modules/tailwindcss/README.md`
- Oficial: https://tailwindcss.com
- v4 es CSS-first: tokens en `@theme` dentro de `styles/globals.css`. No hay
  `tailwind.config.js`. Colores de marca: `--brand-operator-1: #3b82f6`,
  `--brand-operator-2: #10b981`.

### lucide-react
- Oficial: https://lucide.dev

### tailwind-merge
- Local: `node_modules/tailwind-merge/README.md`
- Oficial: https://github.com/dcastil/tailwind-merge

### class-variance-authority (cva)
- Oficial: https://github.com/joe-bell/cva

### bun-plugin-tailwind
- Oficial: https://tailwindcss.com

## Estructura de código

```
src/
├── frontend.tsx           # entrypoint React
├── App.tsx                # rutas (públicas + /admin/* protegida)
├── index.html             # título "Delega", lang="es"
├── pages/                 # landing: Home, Services, Delegate, Contact, OrderTracking
├── pages/admin/           # Dashboard, Orders, Clients, Subscriptions, ActivityLog, Statistics, Login
├── components/            # ui/ (shadcn) + ServiceSelector, DynamicFields, PriceEstimator, WhatsAppGenerator
├── hooks/                 # useAuth, useDatabase, useOrderPermissions, useStatistics, useActivityLog
├── lib/
│   ├── supabase.ts        # cliente Supabase
│   ├── db/activity.ts     # logActivity (audit trail)
│   ├── orders/
│   │   ├── service.ts     # CRUD de órdenes (operaciones secuenciales)
│   │   ├── stateMachine.ts # transiciones de estado válidas
│   │   ├── permissions.ts # permisos por operador
│   │   ├── ui.ts          # labels, clases, helpers
│   │   └── parseWhatsApp.ts # parsing de mensajes de WhatsApp
│   ├── types/index.ts     # interfaces TS estrictas (Order, Client, Subscription, Operator, etc.)
│   ├── auth/              # hash.ts (SHA-256), session.ts (localStorage)
│   ├── config/            # env.ts (variables de entorno), serviceTypes.ts
│   └── pricing.ts         # cálculo de precios
styles/globals.css         # Tailwind v4 + tokens de marca
supabase/seed.sql          # seed inicial de Supabase
```

## Reglas de implementación

- **TypeScript estricto** (`strict: true` en `tsconfig.json`). Evitar `any`;
  usar `unknown` + type guards. Usar los tipos de `src/lib/types`.
- **Supabase es fuente de verdad.** Zustand cachea en memoria; Supabase persiste.
  No usar React Query/SWR (ya hay un cliente Supabase directo).
- **Login:** SHA-256 de la contraseña contra hashes en `BUN_PUBLIC_OPERATOR_*_PASS_HASH`.
  Sesión en `localStorage` con expiración (`BUN_PUBLIC_SESSION_TIMEOUT_HOURS`).
- **Permisos:** un operador edita solo sus órdenes; puede ver y
  comentar las ajenas. Ver `src/hooks/useOrderPermissions.ts`.
- **IDs:** `ORD-###` / `SUB-###` desde contadores en tabla `config` de Supabase.
- **Env vars:** prefijo `BUN_PUBLIC_*` (visibles en cliente, aceptable para hashes
  de login). Nunca contraseñas en texto plano.
- **Responsive mobile-first**, accesibilidad (labels, foco, contraste 4.5:1).

## Comandos

```bash
bun install
bun dev        # HMR sobre src/frontend.tsx
bun run build  # build estático → dist/
```
