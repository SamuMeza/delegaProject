# Delega — Apoyo Escolar

Servicio de apoyo escolar (liceo/universidad, Venezuela). Los estudiantes entran
por la landing, describen la tarea, y la solicitud llega vía WhatsApp. Los dos
operadores gestionan, ejecutan, cobran por Pago Móvil y entregan el trabajo desde
un panel administrativo privado.

## Arquitectura

- **Frontend SPA.** React 19 con React Router 7 para client-side routing. Deploy
  estático en Vercel.
- **Backend Supabase.** PostgreSQL como fuente de verdad. Los datos se leen y
  escriben directamente desde el cliente vía `@supabase/supabase-js`.
- **Estado en memoria.** Zustand cachea datos en memoria; Supabase persiste.
  No hay React Query ni SWR (no hay servidor propio).
- **WhatsApp-first.** La landing genera un mensaje pre-llenado `wa.me`; el
  operador registra la orden manualmente en el panel.
- **Hosting:** Vercel (build estático). `vercel.json` reescribe todas las rutas a
  `index.html` para que React Router funcione.

## Stack

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
| shadcn/ui (Radix) | — | Componentes base en `src/components/ui` |

Runtime: **Bun** (no Node). Build estático con `bun run build.ts` → `dist/`.

## Desarrollo

```bash
bun install
cp .env.example .env   # define BUN_PUBLIC_* (Supabase, hashes de login, número WhatsApp)
bun dev                # HMR sobre src/frontend.tsx
```

## Build y despliegue

```bash
bun run build          # genera dist/ (estático)
```

### Deploy en Vercel

1. Conectar el repo de GitHub a Vercel.
2. Configurar en Vercel Dashboard → Settings → General:
   - **Build Command:** `bun run build`
   - **Output Directory:** `dist`
   - **Framework Preset:** `Other`
3. Agregar Environment Variables en el Dashboard (ver `.env.example`).

### Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `BUN_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `BUN_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave pública (anon key) de Supabase |
| `BUN_PUBLIC_OPERATOR_1_USER` | Usuario del operador 1 |
| `BUN_PUBLIC_OPERATOR_1_PASS_HASH` | SHA-256 de la contraseña del operador 1 |
| `BUN_PUBLIC_OPERATOR_2_USER` | Usuario del operador 2 |
| `BUN_PUBLIC_OPERATOR_2_PASS_HASH` | SHA-256 de la contraseña del operador 2 |
| `BUN_PUBLIC_SESSION_TIMEOUT_HOURS` | Horas de expiración de sesión |
| `BUN_PUBLIC_WHATSAPP_NUMBER` | Número WhatsApp destino |
| `BUN_PUBLIC_TRACKING_SALT` | Salt para tokens de seguimiento |

## Credenciales de operadores (login)

El login compara `SHA-256(password)` contra el hash almacenado en la tabla
`operators` de Supabase. Genera los hashes localmente:

```bash
printf '%s' "tu_contraseña" | sha256sum   # Linux/macOS
# o usa una herramienta online de SHA-256 sobre el texto plano de la contraseña
```

Copia `.env.example` a `.env` y pega los hashes. Nunca guardes la contraseña en
texto plano. La sesión expira según `BUN_PUBLIC_SESSION_TIMEOUT_HOURS`.

## Estructura

```
src/
├── frontend.tsx           # entrypoint React
├── App.tsx                # rutas (públicas + /admin/* protegida, lazy)
├── pages/                 # páginas públicas de la landing
├── pages/admin/           # vistas del panel administrativo
├── components/            # ui/ (shadcn) + ServiceSelector, DynamicFields, etc.
├── hooks/                 # useAuth, useDatabase (Supabase), useStatistics, etc.
├── lib/
│   ├── supabase.ts        # cliente Supabase
│   ├── db/activity.ts     # logActivity (audit trail)
│   ├── orders/            # service.ts, stateMachine.ts, permissions, ui
│   ├── types/             # interfaces TS estrictas de entidades
│   ├── auth/              # hash.ts, session.ts
│   ├── config/            # env.ts, serviceTypes.ts
│   └── pricing.ts         # cálculo de precios
styles/globals.css         # Tailwind v4 + tokens de marca
vercel.json                # rewrite SPA → index.html
.env.example               # variables BUN_PUBLIC_*
supabase/seed.sql          # seed inicial de Supabase
docs/                      # documentación del proyecto
```

## Documentación

- `docs/arquitectura.md` — arquitectura del sistema
- `docs/supabase/setup.md` — configuración de Supabase
- `docs/supabase/schema.md` — schema de tablas
- `docs/deployment.md` — guía de deploy en Vercel
- `docs/development.md` — guía de desarrollo local
- `docs/mockups/` — mockups de UI
- `docs/technical-debt.md` — deuda técnica
- `docs/design-tokens.md` — tokens de diseño
- `.specify/memory/constitution.md` — constitución del proyecto (reglas de negocio)
