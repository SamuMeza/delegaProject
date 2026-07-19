# Mockup — Login (`/admin/login`)

**Manual:** §5.1, §3 · **Tokens:** `docs/design-tokens.md` · (Sin PNG; inferido de §5.1)

## Layout (centrado, sin sidebar)

```
┌────────────────────────────────────────────────────────┐
│ Card central (max-w-md, bg-surface-container-lowest     │
│  rounded-xl shadow-ambient, p-8)                        │
│  H2 headline-md "Acceso al Panel"  text-primary        │
│                                                         │
│  [Usuario]        input h-12 rounded-lg border-subtle   │
│  [Contraseña]     input type=password                   │
│                                                         │
│  [ Ingresar  bg-primary text-on-primary ]  (loading)   │
│                                                         │
│  Error genérico (si falla): text-error, sin decir cuál │
│  Indicador intentos restantes (cerca de 5)             │
└────────────────────────────────────────────────────────┘
```

## Comportamiento (manual §3)
- SHA-256 de la contraseña vs `BUN_PUBLIC_OPERATOR_*_PASS_HASH`.
- Sesión en `localStorage` con `expiresAt = loginAt + session_timeout_hours`.
- Límite 5 intentos (contador en `sessionStorage`), bloqueo 15 min.
- Error genérico (no revela campo).

## Tokens
- Inputs focus: ring `secondary` 2px. Botón: `bg-primary text-on-primary`.
