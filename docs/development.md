# Guía de Desarrollo Local

## Requisitos

- [Bun](https://bun.sh) instalado (v1.3+)
- Git
- Editor de código (VS Code recomendado)

## Setup inicial

```bash
# Clonar el repo
git clone <url-del-repo>
cd delegaProject

# Instalar dependencias
bun install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores (ver abajo)

# Iniciar dev server
bun dev
```

El dev server corre en `http://localhost:3000` con HMR (Hot Module Replacement).

## Variables de entorno

Editar `.env` con tus valores:

```env
# Supabase (obtener de Supabase Dashboard → Settings → API)
BUN_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
BUN_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu_anon_key

# Login (generar hashes con: printf '%s' "contraseña" | sha256sum)
BUN_PUBLIC_OPERATOR_1_USER=op_001
BUN_PUBLIC_OPERATOR_1_PASS_HASH=5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8
BUN_PUBLIC_OPERATOR_2_USER=op_002
BUN_PUBLIC_OPERATOR_2_PASS_HASH=5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8

# Opcional
BUN_PUBLIC_SESSION_TIMEOUT_HOURS=8
BUN_PUBLIC_WHATSAPP_NUMBER=584121234567
BUN_PUBLIC_TRACKING_SALT=delega-secret-2026
```

## Estructura del proyecto

```
delegaProject/
├── src/                    # Código fuente
│   ├── frontend.tsx        # Entry point de React
│   ├── App.tsx             # Definición de rutas
│   ├── index.html          # HTML template
│   ├── pages/              # Páginas públicas (landing)
│   ├── pages/admin/        # Páginas del panel admin
│   ├── components/         # Componentes React
│   │   ├── ui/             # Primitivas shadcn/ui
│   │   └── *.tsx           # Componentes de negocio
│   ├── hooks/              # Custom hooks de React
│   ├── lib/                # Utilidades y configuración
│   │   ├── supabase.ts     # Cliente Supabase
│   │   ├── orders/         # Lógica de órdenes
│   │   ├── types/          # Tipos TypeScript
│   │   ├── auth/           # Autenticación
│   │   └── config/         # Configuración
│   └── styles/             # Estilos CSS
├── supabase/               # Archivos SQL de Supabase
│   └── seed.sql            # Datos iniciales
├── docs/                   # Documentación
├── tests/                  # Tests
├── build.ts                # Script de build
├── dev.ts                  # Dev server
├── vercel.json             # Configuración de deploy
└── .env                    # Variables de entorno (no commitear)
```

## Comandos

| Comando | Descripción |
|---------|-------------|
| `bun dev` | Dev server con HMR en puerto 3000 |
| `bun run build` | Build de producción → `dist/` |
| `bun test` | Ejecutar tests |

## Convenciones de código

### TypeScript

- **Strict mode** activado (`strict: true` en `tsconfig.json`)
- Evitar `any` — usar `unknown` + type guards
- Usar tipos de `src/lib/types/index.ts` para entidades

### Componentes

- Componentes funcionales con hooks
- Un componente por archivo
- Naming: `PascalCase.tsx` para componentes

### Estilos

- Tailwind CSS v4 (CSS-first, sin `tailwind.config.js`)
- Tokens de marca en `styles/globals.css` dentro de `@theme`
- Usar `cn()` de `src/lib/utils.ts` para merge de clases

### Estado

- Zustand para cache en memoria (no persiste)
- `useDatabase.ts` para hooks que leen de Supabase
- No usar React Query/SWR (ya hay cliente Supabase directo)

## Cómo agregar una nueva página

1. Crear archivo en `src/pages/NuevaPagina.tsx`
2. Agregar ruta en `src/App.tsx`
3. Si es admin, agregar bajo `<AdminLayout />` con lazy loading

## Cómo agregar un nuevo tipo de servicio

1. Agregar tipo en `src/lib/config/serviceTypes.ts`
2. Agregar mapeo en `config.service_operator_map` en Supabase
3. Agregar campos en `OrderDetailsFields.tsx` si es necesario
4. Agregar precio en `config.price_ranges` en Supabase

## Testing

```bash
bun test                    # Ejecutar todos los tests
```

Tests en `tests/`:
- `tests/unit/` — Tests unitarios
- `tests/integration/` — Tests de integración
- `tests/e2e.spec.ts` — Tests end-to-end con Playwright
