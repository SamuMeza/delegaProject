# AGENTS.md — Delega

Agent guidance for the Delega project. Read this before editing code.

## Qué es Delega

Servicio de apoyo escolar en Venezuela operado por dos personas. SPA sin backend:
la persistencia es IndexedDB (vía Dexie) en el navegador. Los estudiantes entran
por la landing y su solicitud llega por WhatsApp; los operadores gestionan y entregan
desde un panel privado. No es un marketplace: es una herramienta de coordinación
para un negocio de dos personas.

Reglas de negocio completas en `manual_tecnico_delega.md` (escritorio del equipo) y
en `.specify/memory/constitution.md` (versión 1.1.0).

## Principios de la constitución (obligatorios)

- **I. Sin backend, local-first.** Solo IndexedDB (Dexie como wrapper permitido).
  No servidor, no DB en la nube, no costos fijos. Deploy estático en Vercel.
- **II. WhatsApp-first.** La landing genera un mensaje pre-llenado `wa.me`; el
  operador registra la orden manualmente en el panel.
- **III. Seguimiento estructurado.** Toda orden tiene un estado enumerado
  (`nueva`, `pendiente_pago`, `en_progreso`, `revision`, `pendiente_final`,
  `completada`, `cancelada`). Ver transiciones en manual §2.2.4.
- **IV. Precios Venezuela / Pago Móvil.** Rangos $3–$15, suscripciones trimestrales
  (~$25), seguimiento de pago por orden. Ver §9.2.
- **V. Simplicidad y reutilización.** YAGNI: solo lo que reduce caos o coordina.

## Stack y versiones (fijadas)

| Tecnología | Versión | Uso |
|---|---|---|
| React | 19.2.7 | UI |
| react-dom | 19.2.7 | Render |
| react-router-dom | 7.18.1 | Rutas SPA (públicas + `/admin/*`) |
| Zustand | 5.0.14 | Estado global |
| Dexie | 4.4.4 | Wrapper IndexedDB |
| dexie-react-hooks | 4.4.0 | Hooks reactivos sobre Dexie |
| Tailwind CSS | 4.3.3 | Estilos (v4 CSS-first, sin `tailwind.config.js`) |
| tw-animate-css | 1.4.0 | Animaciones |
| lucide-react | 1.25.0 | Íconos |
| class-variance-authority | 0.7.1 | Variantes de componentes |
| tailwind-merge | 3.6.0 | Merge de clases |
| clsx | 2.1.1 | Clases condicionales |
| bun-plugin-tailwind | 0.1.2 | Plugin de build Tailwind para Bun |
| shadcn/ui (Radix) | — | Componentes base en `src/components/ui` |

Runtime: **Bun** (no Node). Build estático con `bun run build.ts` → `dist/`.

## Documentación de las tecnologías

Referencias locales (en `node_modules`) y oficiales. Úsalas antes de escribir
código contra una librería.

### Dexie (IndexedDB)
- Local: `node_modules/dexie/README.md`
- Oficial: https://dexie.org
- `dexie-react-hooks`: https://dexie.org (mismos docs)
- Stores definidas en `src/lib/db/delegaDb.ts` (manual §2.2).

### Zustand
- Local: `node_modules/zustand/README.md`
- Oficial: https://github.com/pmndrs/zustand

### React Router (v7)
- Local: `node_modules/react-router-dom/README.md`
- Oficial: https://reactrouter.com
- Rutas en `src/App.tsx`. Admin con `React.lazy` + `Suspense` (manual §11.7).

### React (v19)
- Local: `node_modules/react/README.md`
- Oficial: https://react.dev

### Tailwind CSS (v4)
- Local: `node_modules/tailwindcss/README.md`
- Oficial: https://tailwindcss.com
- v4 es CSS-first: tokens en `@theme` dentro de `styles/globals.css`. No hay
  `tailwind.config.js`. Colores de marca: `--brand-operator-1: #3b82f6`,
  `--brand-operator-2: #10b981`.

### tw-animate-css
- Local: `node_modules/tw-animate-css/README.md`
- Oficial: https://github.com/Wombosvideo/tw-animate-css

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
├── frontend.tsx        # entrypoint React
├── App.tsx             # rutas (públicas + /admin/* protegida)
├── index.html          # título "Delega", lang="es"
├── pages/              # landing: Home, Services, Delegate, Contact, OrderTracking
├── pages/admin/        # Dashboard, Orders, Clients, Subscriptions, ActivityLog, Statistics, Login
├── components/         # ui/ (shadcn) + ServiceSelector, DynamicFields, PriceEstimator, WhatsAppGenerator
├── hooks/              # useAuth, useOrderPermissions, useDelegaDB
├── lib/
│   ├── db/delegaDb.ts  # instancia Dexie (stores §2.2)
│   ├── types/index.ts  # interfaces TS estrictas (Order, Client, Subscription, Operator, ActivityLogEntry, Config)
│   ├── auth/           # sesión localStorage (§3)
│   └── pricing.ts      # cálculo de precios (§9.2)
styles/globals.css      # Tailwind v4 + tokens de marca
vercel.json             # rewrite SPA → index.html
.env.example            # variables BUN_PUBLIC_*
```

## Reglas de implementación

- **TypeScript estricto** (`strict: true` en `tsconfig.json`). Evitar `any`;
  usar `unknown` + type guards. Usar los tipos de `src/lib/types`.
- **IndexedDB es fuente de verdad.** Zustand cachea en memoria; Dexie persiste.
  No usar React Query/SWR (no hay servidor).
- **Login:** SHA-256 de la contraseña contra hashes en `BUN_PUBLIC_OPERATOR_*_PASS_HASH`.
  Sesión en `localStorage` con expiración (`session_timeout_hours`, manual §3).
- **Permisos (manual §4):** un operador edita solo sus órdenes; puede ver y
  comentar las ajenas. Ver `useOrderPermissions`.
- **IDs:** `ORD-###` / `SUB-###` desde contadores en `config` (manual §9.5).
- **Env vars:** prefijo `BUN_PUBLIC_*` (visibles en cliente, aceptable para hashes
  de login). Nunca contraseñas en texto plano.
- **Responsive mobile-first**, accesibilidad (labels, foco, contraste 4.5:1).

## Comandos

```bash
bun install
bun dev        # HMR sobre src/frontend.tsx
bun run build  # build estático → dist/
```
