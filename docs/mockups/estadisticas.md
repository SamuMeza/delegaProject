# Mockup — Estadísticas (`/admin/estadisticas`)

**Manual:** §5.8, §2.2.5 · **Tokens:** `docs/design-tokens.md`

## Layout

```
MAIN
 Selector de rango de meses
 ┌─ Ingresos totales por mes (gráfico barras) ─┐
 ┌─ Órdenes completadas vs pendientes (barras)┐
 Tabla distribución por operador:
   Mes | Órdenes op_001 | Ingresos op_001 | Órdenes op_002 | Ingresos op_002 | %
   (colores: op_001 = brand-operator-1, op_002 = brand-operator-2)
 Exportación: solo visualización (no CSV/Excel).
```

## Datos (manual §2.2.5)
- `stats` agregado mensual: `totalOrders`, `totalRevenue`, `byOperator`,
  `completedOrders`, `pendingOrders`, `newClients`, `returningClients`.
- `byOperator` suma `price` de órdenes `completadas` por `operatorId`.

## Tokens
- Gráficos: barras con `bg-brand-operator-1` / `bg-brand-operator-2`.
- Cards contenedoras: `bg-surface-container-lowest rounded-xl shadow-ambient`.
- Sin exportación de archivo (solo visual).
