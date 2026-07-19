# Mockup — Dashboard (`/admin`)

**Referencia visual:** `panel_administrativo_delega_1/screen.png`. Estructura en `panel_administrativo_delega_1/code.html`.
**Manual:** §5.2 · **Tokens:** `docs/design-tokens.md`

## Layout (SideNav + Main)

```
┌──────────────┬──────────────────────────────────────────────────────┐
│ SIDENAV      │ MAIN (ml-64, bg-surface-studio, px-gutter)            │
│ (w-64 white, │  Header: H2 "Dashboard" + "This Month" btn           │
│  border-r)   │                                                      │
│ Delega avatar│  STATS GRID (4 col):                                 │
│ Admin Panel  │   [Total Orders 428] [Revenue $24.5k]               │
│ • Overview✓  │   [Pending Review 32] [New Clients 84]              │
│ • Orders      │   (cards bg-white rounded-xl shadow-ambient,        │
│ • Clients     │    icono en circle bg-surface-container)            │
│ • Subscriptions│                                                    │
│ • Activity Log│  GRID 3 col:                                        │
│ • Settings    │   ┌─ Recent Orders (col-span-2, table) ─┐ ┌Alerts┐ │
│ [+ New Order] │   │ Order ID | Client | Service | Fecha│ │Urgencia│ │
│ Support       │   │ #ORD-9081 Maria  Ensayo  Hoy  [Nva]│ │3 items │ │
│ Logout        │   │ #ORD-9080 Carlos Presen. [EnProg]  │ │border  │ │
│              │   │ #ORD-9079 Ana  [Revisión]          │ │error   │ │
└──────────────┴───│ #ORD-9078 ... [Completada]         │ │left   │ │
                   └────────────────────────────────────┘ └───────┘ │
```

## Status Chips (manual §2.2.4)
- `nueva`: `bg-blue-100 text-blue-800` → usar `bg-surface-container text-primary`
- `en_progreso` / `revision` / `pendiente_final`: `bg-tertiary-container text-on-tertiary-container`
- `completada`: `bg-secondary-container text-on-secondary-container`
- `cancelada`: `bg-error-container text-on-error-container`

## Alertas de urgencia (§5.2.d)
- Lista de órdenes con `dueDate` = hoy/manana, ordenadas por vencimiento.
- Item: `border-l-4 border-urgency-alert bg-surface-container-low`.
- Badge contador: `bg-urgency-alert text-white`.

## Tokens
- SideNav: `bg-surface-container-lowest border-r border-border-subtle`.
- Item activo: `bg-secondary-container text-on-secondary-container rounded-lg`.
- Stat icons: circle `bg-secondary-container text-on-secondary-container` etc.
- Alertas container: `border border-error/20 bg-error-container/10`.
