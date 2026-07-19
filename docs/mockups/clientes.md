# Mockup — Clientes (lista + detalle)

**Manual:** §5.5 · **Tokens:** `docs/design-tokens.md`

## Lista (`/admin/clientes`)

```
MAIN
 Tabla: Nombre | Teléfono | Total órdenes | Total gastado | Suscripción activa
 Buscar por nombre/teléfono.
 Fila clickeable → detalle.
```

## Detalle (`/admin/clientes/:phone`)

```
MAIN
 Información personal (nombre, teléfono wa.me)
 Historial de órdenes (lista con enlaces a /admin/ordenes/:id)
 Suscripción activa (si hay): tipo, fechas, cupo usado este mes / total
   [Renovar suscripción]  [Cancelar suscripción]  (bg-primary / ghost)
```

## Tokens
- Cards/secciones: `bg-surface-container-lowest rounded-xl shadow-ambient`.
- Botones: Primary (`bg-primary`) y Ghost (`border-border-subtle`).
- Suscripción activa badge: `bg-secondary-container text-on-secondary-container`.
