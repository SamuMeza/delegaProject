# Mockup — Seguimiento de Orden (`/orden/:token`)

**Manual:** §8.5 · **Tokens:** `docs/design-tokens.md` · (Sin PNG; inferido de §8.5)

## Layout

```
NAV mínima (solo logo + link inicio) — vista PÚBLICA, sin precios
┌────────────────────────────────────────────────────────┐
│ Si no hay token en URL:                                 │
│   Input "Ingresa tu token de seguimiento" + [Ver]      │
│                                                         │
│ Si token válido:                                        │
│  Card (bg-surface-container-lowest rounded-xl):        │
│   • Estado actual (Status Chip, ver §estados)          │
│   • Fecha de entrega estimada                          │
│   • Servicio solicitado                                │
│   • Nota: "Para más detalles, contáctanos por WhatsApp"│
│                                                         │
│ Si token no existe:                                     │
│   "Orden no encontrada. Verifica tu token o contáctanos."│
└────────────────────────────────────────────────────────┘
```

## Status Chips (manual §2.2.4)
- `nueva`: `bg-surface-container text-on-surface-variant`
- `pendiente_pago`: `bg-tertiary-container text-on-tertiary-container`
- `en_progreso`: `bg-tertiary-container text-on-tertiary-container`
- `revision`: `bg-tertiary-container text-on-tertiary-container`
- `pendiente_final`: `bg-tertiary-container text-on-tertiary-container`
- `completada`: `bg-secondary-container text-on-secondary-container`
- `cancelada`: `bg-error-container text-on-error-container`

## Tokens
- Card: `rounded-xl shadow-ambient`. NO mostrar precio/pago (manual §8.5).
