# Mockup — Activity Log (`/admin/activity-log`)

**Manual:** §5.7, §2.2.6 · **Tokens:** `docs/design-tokens.md`

## Layout

```
MAIN
 Filtros: [Operador ▾] [Acción ▾] [Rango fechas]
 Tabla (20 por página): Fecha | Operador | Acción | Objetivo | Detalles
   2026-07-19 10:23 | op_001 | change_status | #ORD-9081 |
     "Cambió 'nueva' → 'en_progreso'"
   2026-07-19 09:15 | op_002 | create_order | #ORD-9080 | ...
 Acciones críticas (cancelaciones, cambios estado) resaltadas.
```

## Acciones (manual §2.2.6)
login, logout, create_order, update_order, delete_order, add_note,
upload_file, change_status, create_subscription, cancel_subscription.

## Tokens
- Tabla patrón dashboard. Fila crítica: `bg-error-container/10` o borde izq `urgency-alert`.
- Operador: dot `bg-brand-operator-1`/`bg-brand-operator-2`.
- Log visible para ambos operadores sin restricción de lectura.
