# Delega — Apoyo Escolar

Servicio de apoyo escolar (liceo/universidad, Venezuela). Los estudiantes entran
por la landing, describen la tarea, y la solicitud llega vía WhatsApp. Los dos
operadores gestionan, ejecutan, cobran por Pago Móvil y entregan el trabajo desde
un panel administrativo privado.

## Arquitectura

- **SPA sin backend.** Todo corre en el navegador; la persistencia es IndexedDB
  (vía Dexie). No hay servidor, no hay base de datos en la nube, no hay costos fijos.
- **Hosting:** Vercel (build estático). `vercel.json` reescribe todas las rutas a
  `index.html` para que React Router funcione.
- **Stack:** React 19, React Router 7, Zustand 5, Dexie 4, Tailwind CSS 4,
  shadcn/ui (Radix), lucide-react, tw-animate-css.
- **Service Operator Map (serviceOperatorMap):**  
  This is a configuration key in `Config` that maps `ServiceType` to `OperatorId`.
  It allows administrators to assign which operator handles each service type
  without requiring code changes. The configuration lives in `src/lib/db/seed.ts`
  where default mappings are defined, but can be overridden through the
  Configuration API. The mapping is crucial for order assignment logic.

## Desarrollo

```bash
bun install
cp .env.example .env   # define BUN_PUBLIC_* (hashes de login, número WhatsApp)
bun dev                # Bun.build con HMR sobre src/frontend.tsx
```

## Build y despliegue

```bash
bun run build          # genera dist/ (estático)
```

Conectar el repo a Vercel y configurar las variables de entorno `BUN_PUBLIC_*`
(ver `.env.example`). El panel admin requiere login con hashes SHA-256 definidos
en esas variables.

## Credenciales de operadores (login)

El login compara `SHA-256(password)` contra el hash almacenado en el registro del
operador en IndexedDB. Al primer arranque, `src/lib/db/seed.ts` crea dos
operadores (`op_001`, `op_002`) usando `BUN_PUBLIC_OPERATOR_1_USER`/`_PASS_HASH` y
`BUN_PUBLIC_OPERATOR_2_USER`/`_PASS_HASH`. Genera los hashes localmente:

```bash
printf '%s' "tu_contraseña" | sha256sum   # Linux/macOS
# o usa una herramienta online de SHA-256 sobre el texto plano de la contraseña
```

Copia `.env.example` a `.env` y pega los hashes. Nunca guardes la contraseña en
texto plano. La sesión expira según `sessionTimeoutHours` en `config`.

## Estructura

```
src/
├── frontend.tsx        # entrypoint React
├── App.tsx             # rutas (públicas + /admin/* protegida, lazy)
├── pages/              # páginas públicas de la landing
├── pages/admin/        # vistas del panel administrativo
├── components/         # ui/ (shadcn) + ServiceSelector, DynamicFields, etc.
├── hooks/              # useAuth, useOrderPermissions, useDelegaDB
├── lib/
│   ├── db/delegaDb.ts  # instancia Dexie (stores del manual §2.2)
│   ├── types/          # interfaces TS estrictas de entidades
│   ├── auth/           # lógica de sesión
│   └── pricing.ts      # cálculo de precios (§9.2)
```

## Documentación de negocio

El comportamiento completo (stores, estados de orden, permisos, precios, flujos)
está en `MANUAL_TÉCNICO` (manual_tecnico_delega.md en el escritorio del equipo) y
en `.specify/memory/constitution.md`.
