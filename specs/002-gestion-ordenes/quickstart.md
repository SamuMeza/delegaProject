# Quickstart: Gestión de Órdenes

**Feature**: `specs/002-gestion-ordenes`
**Date**: 2026-07-19

Guía de validación ejecutable (end-to-end) de la feature. No contiene código de
implementación; referencia `data-model.md` y `contracts/order-contracts.md`.

## Prerrequisitos

- Repo en rama `002-gestion-ordenes` con fundación (FR-1..FR-5) ya mergeada en `main`.
- `bun install` ejecutado.
- Variables `BUN_PUBLIC_OPERATOR_1_*`, `BUN_PUBLIC_OPERATOR_2_*` presentes (`.env`).
- Navegador para abrir el panel en `localhost` vía `bun dev`.

## Escenarios de validación

### V1 — Crear orden y asignación automática (FR-001, FR-002, FR-006, R1, R8)

1. `bun dev` → abrir `/admin/login` → entrar como `op_001`.
2. Ir a `/admin/ordenes` → "Nueva orden".
3. Completar cliente + `serviceType = ensayo` + `details` + precio.
4. Guardar.
5. **Esperado**: la orden aparece con `id = ORD-001`, estado `nueva`, operador
   asignado `op_001` (por `serviceOperatorMap`). Repetir con `formato` → asigna
   `op_002`. ✔ cubre FR-006/SC-003.

### V2 — Pipeline de estados (FR-005, R6)

1. Abrir detalle de la orden `ORD-001`.
2. Avanzar `nueva → pendiente_pago → en_progreso → revision → pendiente_final →
   completada`.
3. **Esperado**: cada transición válida aplica; el historial (`statusHistory`)
   registra de→a, autor y timestamp. Intentar saltar `nueva → completada` →
   rechazado. ✔ cubre FR-005/SC-002.

### V3 — Permisos de escritura (FR-007, R5)

1. Con sesión `op_002`, abrir `ORD-001` (asignada a `op_001`).
2. **Esperado**: se ve el detalle (canView) pero los controles de estado/edición
   están deshabilitados (solo lectura). El campo de nota sí está habilitado.
3. Agregar nota → se guarda con autor `op_002`. ✔ cubre FR-007/SC-004.

### V4 — Notas y adjuntos (FR-009, FR-010, R2, R4)

1. En `ORD-001` (sesión propietaria), agregar nota y subir un archivo.
2. Recargar la página.
3. **Esperado**: nota y adjunto persisten; adjunto descargable; nota muestra autor
   y timestamp. ✔ cubre FR-009/FR-010/SC-005.

### V5 — Dashboard resumen (FR-012, FR-013, R7)

1. Crear órdenes en varios estados y marca una `urgent` o con `dueDate` vencida.
2. Ir a `/admin` (dashboard).
3. **Esperado**: contadores del mes (total, por estado, urgentes/vencidas,
   ingresos Pago Móvil) coherentes con los datos. ✔ cubre FR-012/FR-013/SC-006.

### V6 — Persistencia tras cierre (FR-014, R8, R9)

1. Crear y completar una orden con pago registrado.
2. Cerrar pestaña y reabrir `bun dev`.
3. **Esperado**: la orden sigue en `completada` con `paymentStatus = paid`. ✔ SC-007.

## Verificación de tipos y build

- `bun x tsc --noEmit` → 0 errores.
- `bun run build` → build estático exitoso en `dist/`.

## Non-Functional: rendimiento (local-first)

- Al ser datos locales (IndexedDB), el listado de órdenes y el dashboard deben
  sentirse **instantáneos**: tiempo de percepción de render < 100 ms para volúmenes
  del negocio (decenas de órdenes/mes). No hay latencia de red por diseño
  (Principio I). Si una consulta Dexie se siente lenta, es un defecto de la capa
  reactiva, no de red. [E1, CHK040]

## Criterios de aceptación (relación con spec)

| Spec | Escenario |
|---|---|
| FR-001..FR-005 | V1, V2 |
| FR-006 | V1 |
| FR-007 | V3 |
| FR-008..FR-009 | V3, V4 |
| FR-010 | V4 |
| FR-011 | V2 |
| FR-012..FR-013 | V5 |
| FR-014 | V4, V6 |
