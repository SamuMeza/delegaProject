# Mockup — Órdenes (lista + detalle)

**Manual:** §5.3 (lista), §5.4 (detalle) · **Tokens:** `docs/design-tokens.md`
**Referencia:** estructura de tabla heredada de `panel_administrativo_delega_1` (Recent Orders).

## Lista (`/admin/ordenes`)

```
MAIN (con SideNav)
 Barra de filtros: [Estado ▾] [Operador ▾] [Buscar ID/nombre...]
 [+ Nueva orden]  (bg-primary)
 Tabla (10 por página, paginada):
   ID | Cliente | Servicio | Operador | Estado | Creado | (acción)
   #ORD-001 | Maria | Ensayo | op_001(azul) | [Nueva] | hoy
   #ORD-002 | Carlos | Presentación | op_002(verde) | [En progreso]
 Fila clickeable → detalle.
```

## Detalle (`/admin/ordenes/:id`)

```
MAIN
 Header: ID grande + Cliente (wa.me link) + Operador(color) + Estado(chip)
 ┌─ Información Servicio ─┐ ┌─ Pago ──────────────────┐
 │ serviceType            │ │ Precio total            │
 │ details (legible)      │ │ Pagado / Pendiente      │
 │ hasMaterial (video)    │ │ Referencia              │
 └────────────────────────┘ │ Historial de pagos      │
 ┌─ Archivos ─────────────┐ └──────────────────────────┘
 │ lista + descargar/subir│ ┌─ Notas internas ─────────┐
 └────────────────────────┘ │ cronológico + agregar    │
 ┌─ Control Estado ───────┐ └──────────────────────────┘
 │ [cambiar estado ▾]     │ ┌─ Timeline visual ────────┐
 │ [Marcar pagada]        │ │ creación→trabajo→preview │
 │ [Subir preview]        │ │ →finalización            │
 │ [Cancelar]             │ └──────────────────────────┘
```

## Permisos (manual §4) — orden AJENA
- Todos los campos `readonly`.
- Botones de acción deshabilitados.
- Mensaje: "Esta orden está siendo gestionada por [Nombre otro operador]".
- Botón "Agregar nota" ACTIVO (coordinación), registra en activity_log.

## Tokens
- Tabla: header `bg-surface-container-low label-caps`, filas `divide-border-subtle hover:bg-surface-container-low`.
- Operador: dot `bg-brand-operator-1` / `bg-brand-operator-2`.
- Estado chips: ver `dashboard.md`. Acciones: Primary/Ghost según §178 DESIGN.
