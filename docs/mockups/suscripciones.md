# Mockup — Suscripciones (`/admin/suscripciones`)

**Manual:** §5.6, §9.3 · **Tokens:** `docs/design-tokens.md`

## Layout

```
MAIN
 Filtros: [Activas | Vencidas | Canceladas | Todas]
 Tabla: ID | Cliente | Tipo | Inicio | Fin | Precio | Estado
   #SUB-001 | Maria | básico | 2026-07-01 | 2026-10-01 | $25 | [activa]
   #SUB-002 | Carlos | pro | ... | ... | $45 | [vencida] (próx vencer <7d → aviso)
 [+ Nueva suscripción]  [Cancelar] (por fila)
```

## Reglas de negocio (manual §9.3)
- `endDate = startDate + 3 meses`.
- Estado auto → `vencida` si `endDate < hoy`.
- Aviso visual si falta < 7 días (badge `urgency-alert`).
- Renovación: nueva SUB-xxx, no extiende la anterior.

## Tokens
- Tabla igual patrón dashboard. Estado chips:
  - activa: `bg-secondary-container text-on-secondary-container`
  - vencida: `bg-error-container text-on-error-container`
  - cancelada: `bg-surface-container text-on-surface-variant`
- Próxima a vencer: `bg-urgency-alert text-white` badge.
