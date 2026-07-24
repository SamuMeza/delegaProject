# Quickstart: Suscripciones y Clientes

**Date**: 2026-07-24 | **Feature**: Suscripciones y Clientes

## Prerrequisitos

- Bun instalado
- `bun install` ejecutado
- `bun dev` corriendo (HMR en `http://localhost:3000`)

## Escenarios de Validación

### Escenario 1: CRUD de Clientes

1. Navegar a `/admin` e iniciar sesión con operador 1 o 2
2. Ir a "Clientes" en el menú lateral
3. **Verificar**: La lista muestra todos los clientes existentes (si hay seed data) o "Sin clientes registrados"
4. Hacer clic en "Nuevo cliente"
5. Completar: nombre "María Pérez", teléfono "0412-1234567", email "maria@ejemplo.com"
6. Hacer clic en "Guardar"
7. **Verificar**: El cliente aparece en la lista con nombre y teléfono
8. Hacer clic en el cliente para ver detalle
9. **Verificar**: La página de detalle muestra los datos del cliente y "Sin órdenes registradas" en el historial

---

### Escenario 2: Crear Suscripción

1. Desde el detalle de "María Pérez", hacer clic en "Crear suscripción"
2. Configurar: tipo "básico", cupo mensual "5", precio "$25"
3. **Verificar**: La fecha de fin se calcula automáticamente (hoy + 3 meses)
4. Guardar la suscripción
5. **Verificar**: La suscripción aparece como "Activa" en el detalle del cliente
6. **Verificar**: El ID generado sigue el patrón `SUB-001`

---

### Escenario 3: Control de Cupo

1. Desde el panel, crear una nueva orden para "María Pérez" (servicio: ensayo)
2. **Verificar**: La orden se crea con `coverageTipo = "cubierta_por_suscripcion"`
3. Repetir 4 veces más (hasta agotar cupo de 5)
4. Crear una 6ta orden
5. **Verificar**: La orden se crea con `coverageTipo = "suelta_con_descuento"`
6. **Verificar**: El precio aplica 20% de descuento sobre el precio estándar
7. **Verificar**: `usedPerMonth` se mantiene en 5 (no se incrementó con la 6ta)

---

### Escenario 4: Renovación y Alerta

1. Crear una suscripción con fecha de inicio 3 meses atrás y fecha de fin en 10 días (simular)
2. Ir al Dashboard (`/admin`)
3. **Verificar**: Aparece un banner de alerta "Suscripción próxima a vencer: María Pérez (vence en 10 días)"
4. Ir al detalle de la suscripción y hacer clic en "Renovar"
5. **Verificar**: Se crea un nuevo período de 3 meses
6. **Verificar**: La suscripción anterior cambia a estado "reemplazada"

---

### Escenario 5: Sin Suscripción

1. Crear un cliente sin suscripción: "Juan López"
2. Crear una orden para Juan López
3. **Verificar**: `coverageTipo = "estandar"` (sin descuento, sin verificación de cupo)

---

### Escenario 6: Suscripción Vencida

1. Crear una suscripción con fecha de fin en el pasado
2. Crear una orden para ese cliente
3. **Verificar**: La orden se maneja como `coverageTipo = "estandar"` (sin verificación de cupo)

---

### Escenario 7: Reinicio Mensual

1. Crear una suscripción con cupo 3 y usedPerMonth = 3 en mes actual
2. Simular cambio de mes (o verificar lógica: si key `YYYY-MM` no existe, inicializar en 0)
3. Crear una orden
4. **Verificar**: `usedPerMonth["YYYY-MM"]` = 1 (reiniciado)

## Comandos de Verificación

```bash
# Iniciar servidor de desarrollo
bun dev

# Verificar types
bun run build.ts  # compila a dist/frontend.js, valida types

# Verificar páginas
# http://localhost:3000/admin/clientes
# http://localhost:3000/admin/clientes/0412-1234567
# http://localhost:3000/admin/suscripciones
```

## Criterios de Aceptación

- [ ] Escenario 1: CRUD cliente funciona (crear, listar, ver detalle)
- [ ] Escenario 2: Suscripción se crea con ID `SUB-###` y fecha fin calculada
- [ ] Escenario 3: Cupo se verifica y descuento 20% se aplica automáticamente
- [ ] Escenario 4: Alerta aparece en dashboard y renovación crea nuevo período
- [ ] Escenario 5: Órdenes sin suscripción usan precio estándar
- [ ] Escenario 6: Suscripciones vencidas no afectan precio
- [ ] Escenario 7: usedPerMonth se reinicia al cambiar de mes

Para más detalle sobre el modelo de datos, ver [data-model.md](data-model.md).
Para el contrato de base de datos, ver [contracts/db-contract.md](contracts/db-contract.md).