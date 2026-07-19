# Quickstart: App Foundation (Fundación de la App)

**Feature**: 001-app-foundation
**Date**: 2026-07-19
**Spec**: [spec.md](./spec.md) · **Contracts**: [contracts/auth-and-routes.md](./contracts/auth-and-routes.md) · **Data Model**: [data-model.md](./data-model.md)

Guía de validación end-to-end para confirmar que la fundación funciona. No
contiene código de implementación; eso va en `tasks.md` / fase de implementación.

## Prerrequisitos

- Bun instalado.
- Repositorio conectado a Vercel (para FR-1) — o validación local con `bun dev`.
- Archivo `.env` (o `.env.example` copiado) con los hashes de los dos operadores
  (`BUN_PUBLIC_OPERATOR_1_PASS_HASH`, `BUN_PUBLIC_OPERATOR_2_PASS_HASH`).

## Escenario Q1 — Build exitoso (FR-1)

```bash
bun install
bun run build
```

**Esperado**: el comando termina sin errores y genera `dist/` con `index.html`.

## Escenario Q2 — Typecheck (calidad)

```bash
bun x tsc --noEmit
```

**Esperado**: sin errores de tipos.

## Escenario Q3 — Seeding y persistencia (FR-2, SC-2)

1. `bun dev` y abrir la app en el navegador.
2. Abrir DevTools → Application → IndexedDB → base `delega_app`.
3. Verificar que existen los stores `operators` (2 registros) y `config` (1).
4. Recargar la página; volver a Inspeccionar IndexedDB.

**Esperado**: los datos siguen presentes tras recargar (100% retención).

## Escenario Q4 — Login y sesión (FR-4, SC-3, SC-5)

1. Ir a `/admin/login`.
2. Ingresar `username` y `password` correctos de un operador sembrado.
3. **Esperado**: redirige a `/admin`; el header muestra la identidad.

4. Cerrar sesión (logout).
5. **Esperado**: redirige a login; `localStorage` ya no tiene la sesión.

6. Reintentar login con password incorrecto.
7. **Esperado**: mensaje "Credenciales incorrectas"; sin acceso al panel.

## Escenario Q5 — Protección de rutas (FR-5, SC-4)

1. Sin sesión, intentar abrir `/admin` (o cualquier `/admin/*`).
2. **Esperado**: redirige a `/admin/login`.

3. Iniciar sesión; abrir `/admin` y verificar sidebar + header + área de contenido.
4. Esperar a que pase `sessionTimeoutHours` (o forzar `expiresAt` en paso de
   prueba) y recargar.
5. **Esperado**: la sesión expiró; redirige a login.

## Escenario Q6 — Despliegue (FR-1, SC-1)

1. Hacer push al repo conectado a Vercel.
2. Abrir la URL de producción.

**Esperado**: el sitio carga sin errores en <5s y el flujo Q3–Q5 funciona en
producción.

## Notas

- Los escenarios usan DevTools/IndexedDB del navegador como oráculo de
  persistencia; no requieren framework de tests automatizados en esta fase.
- Para probar expiración rápida, reducir `config.sessionTimeoutHours`
  temporalmente en el seeding de prueba.
