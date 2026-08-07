# Guía de Deploy en Vercel

## Requisitos previos

- Repo en GitHub con el código de Delega
- Cuenta en Vercel (free tier)
- Proyecto Supabase creado y configurado

## Paso 1: Conectar repo a Vercel

1. Ir a [vercel.com](https://vercel.com) → Sign In con GitHub
2. Add New Project → Import Git Repository
3. Seleccionar el repo de Delega
4. Configurar:

| Campo | Valor |
|-------|-------|
| Framework Preset | `Other` |
| Build Command | `bun run build` |
| Output Directory | `dist` |
| Install Command | `bun install` |

5. Click "Deploy"

## Paso 2: Configurar Environment Variables

En Vercel Dashboard → Settings → Environment Variables, agregar:

| Variable | Valor | Entorno |
|----------|-------|---------|
| `BUN_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase | Production, Preview |
| `BUN_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Anon key de Supabase | Production, Preview |
| `BUN_PUBLIC_OPERATOR_1_USER` | `op_001` | Production, Preview |
| `BUN_PUBLIC_OPERATOR_1_PASS_HASH` | SHA-256 de la contraseña | Production, Preview |
| `BUN_PUBLIC_OPERATOR_2_USER` | `op_002` | Production, Preview |
| `BUN_PUBLIC_OPERATOR_2_PASS_HASH` | SHA-256 de la contraseña | Production, Preview |
| `BUN_PUBLIC_SESSION_TIMEOUT_HOURS` | `8` | Production, Preview |
| `BUN_PUBLIC_WHATSAPP_NUMBER` | Número WhatsApp | Production, Preview |
| `BUN_PUBLIC_TRACKING_SALT` | Salt para tokens | Production, Preview |

**Importante:** Las variables con prefijo `BUN_PUBLIC_` se inyectan al bundle
del cliente en tiempo de build. No son secretos — quedan hardcodeadas en el JS.

## Paso 3: Deploy automático

Cada push a `main` triggers un deploy automático en Vercel.

```
git push origin main → Vercel detecta → bun run build → dist/ → Deploy
```

## Paso 4: Verificar

1. Ir a la URL de Vercel (ej: `delega.vercel.app`)
2. Verificar que la landing carga correctamente
3. Login en `/admin` con credenciales de operador
4. Crear una orden de prueba
5. Verificar que los datos aparecen en Supabase Dashboard

## Configuración de `vercel.json`

```json
{
  "buildCommand": "bun run build",
  "outputDirectory": "dist",
  "framework": null,
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

- `rewrites`: SPA fallback — todas las rutas sirven `index.html` para que
  React Router maneje el routing client-side.

## Troubleshooting

### Build falla con "process is not defined"
Las env vars no se están inyectando. Verificar que `build.ts` tiene el loop
de `process.env` para `BUN_PUBLIC_*`.

### Página en blanco después de deploy
Verificar que `vercel.json` tiene el rewrite a `index.html`.

### Login no funciona
Verificar que los hashes SHA-256 en las env vars coinciden con las
contraseñas. Los hashes se generan con:

```bash
printf '%s' "tu_contraseña" | sha256sum
```

### Datos no aparecen
Verificar que Supabase está configurado (tablas creadas, seed ejecutado)
y que las env vars de Supabase son correctas.
