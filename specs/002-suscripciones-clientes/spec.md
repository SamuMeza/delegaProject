# Feature Specification: Suscripciones y Clientes

**Feature Branch**: `subs-clientes`

**Created**: 2026-07-24

**Status**: Draft

**Input**: User description: "PRIORIDAD 4: SUSCRIPCIONES Y CLIENTES — Gestionar clientes recurrentes y sus planes trimestrales"

## User Scenarios & Testing

### User Story 1 - Registrar un cliente recurrente (Priority: P1)

El operador accede a una sección de clientes donde ve una lista de todos los estudiantes/padres que han solicitado servicios. Puede crear un nuevo cliente con sus datos básicos (nombre, contacto, referencia) y ver su historial de órdenes anteriores.

**Why this priority**: Sin un registro de clientes no se puede vincular una suscripción. Es la base del feature.

**Independent Test**: Puede probarse creando un cliente desde cero, editando sus datos, y viendo la lista actualizada.

**Acceptance Scenarios**:

1. **Given** que el operador está en el panel de administración, **When** navega a la sección de clientes, **Then** ve una lista de todos los clientes registrados con nombre y fecha de último contacto (fecha de la orden más reciente, o fecha de creación del cliente si no tiene órdenes).
2. **Given** que el operador está en la lista de clientes, **When** hace clic en "Nuevo cliente", **Then** ve un formulario con campos para nombre, teléfono, email y notas, y al guardarlo aparece en la lista.
3. **Given** que el operador ve el detalle de un cliente, **When** revisa la pestaña de historial, **Then** ve todas las órdenes asociadas a ese cliente ordenadas por fecha descendente.

---

### User Story 2 - Crear una suscripción trimestral (Priority: P1)

El operador selecciona un cliente registrado y le asigna una suscripción trimestral. El sistema calcula automáticamente la fecha de fin (3 meses desde la fecha de inicio). Cada suscripción tiene un cupo mensual de órdenes.

**Why this priority**: La suscripción es el mecanismo central de facturación recurrente. Sin ella no tienen sentido los cupos ni las alertas.

**Independent Test**: Puede probarse creando una suscripción para un cliente y verificando que aparecen las fechas correctas (inicio, fin, próxima renovación).

**Acceptance Scenarios**:

1. **Given** que el operador está en el detalle de un cliente, **When** selecciona "Crear suscripción", **Then** ve un formulario con campos para fecha de inicio, cupo mensual y precio, y el sistema calcula la fecha de fin como inicio + 3 meses.
2. **Given** que existe una suscripción activa, **When** el operador la consulta, **Then** ve el estado (activa/vencida), el cupo mensual, las órdenes consumidas este mes, y la fecha de próximo vencimiento.
3. **Given** que una suscripción está próxima a vencer (menos de 15 días), **When** el operador ingresa al panel, **Then** ve una alerta visual (no bloqueante) indicando qué cliente y suscripción están por vencer.

---

### User Story 3 - Control de cupo al crear orden (Priority: P2)

Cuando el operador crea una orden para un cliente con suscripción activa, el sistema verifica el cupo mensual disponible. Si hay cupo, la orden se marca como "cubierta por suscripción". Si se excede el cupo, la orden se marca como "suelta" con un 20% de descuento sobre el precio estándar.

**Why this priority**: Automatiza una regla de negocio que los operadores hoy gestionan manualmente. Reduce errores.

**Independent Test**: Puede probarse creando órdenes hasta agotar el cupo y verificando que la siguiente orden se marca automáticamente como suelta con descuento.

**Acceptance Scenarios**:

1. **Given** que un cliente tiene suscripción activa con cupo mensual de 5 órdenes, **When** se crea la 4ta orden del mes, **Then** la orden se marca como "cubierta por suscripción" y el contador usedPerMonth sube a 4.
2. **Given** que un cliente ha agotado su cupo mensual (usedPerMonth = monthlyQuota), **When** se crea una nueva orden, **Then** la orden se marca como "suelta con 20% descuento" y no se incrementa usedPerMonth.
3. **Given** que un cliente no tiene suscripción activa, **When** se crea una orden, **Then** la orden se maneja con el precio estándar sin descuento ni verificación de cupo.

---

### User Story 4 - Renovación y vencimiento de suscripciones (Priority: P3)

El operador puede renovar una suscripción próxima a vencer. Al renovar, se crea un nuevo período con nueva fecha de fin. Si la suscripción vence sin renovarse, el sistema deja de verificar cupo para ese cliente (las órdenes pasan a precio estándar).

**Why this priority**: Es un flujo menos frecuente pero crítico para mantener ingresos recurrentes.

**Independent Test**: Puede probarse renovando una suscripción y verificando que el nuevo período es correcto, y que al vencer sin renovar las órdenes dejan de aplicar cupo.

**Acceptance Scenarios**:

1. **Given** que una suscripción está activa, **When** el operador hace clic en "Renovar", **Then** se crea un nuevo período de 3 meses desde la fecha actual y la suscripción mantiene su estado activa.
2. **Given** que una suscripción ha vencido, **When** el operador crea una orden para ese cliente, **Then** la orden se maneja sin verificación de cupo (precio estándar).

---

### Edge Cases

- **Cliente sin órdenes previas**: Al crear un cliente nuevo, el historial de órdenes debe mostrar "Sin órdenes registradas".
- **Cupo exacto**: Si usedPerMonth + 1 == monthlyQuota, la orden se marca como cubierta y el contador llega exactamente al límite.
- **Suscripción recién creada a fin de mes**: El cupo mensual aplica para el mes calendario en curso sin prorrateo.
- **Múltiples suscripciones activas**: Un cliente solo puede tener una suscripción activa a la vez. Al crear una nueva, la anterior debe marcarse como reemplazada.
- **Renovación anticipada**: Si se renueva antes del vencimiento, el nuevo período comienza al terminar el actual, no al momento de la renovación.
- **Cliente eliminado**: No se permite eliminar un cliente con órdenes o suscripciones asociadas. Se puede desactivar (ocultar de la lista activa). No existe flujo de reactivación en este feature.

## Requirements

### Functional Requirements

- **FR-001**: El sistema MUST permitir a los operadores crear, editar (excepto el teléfono, que no es modificable después de la creación), listar y desactivar clientes con nombre, teléfono, email y notas.
- **FR-002**: El sistema MUST mostrar el historial de órdenes de un cliente, ordenado por fecha descendente.
- **FR-003**: El sistema MUST permitir crear suscripciones trimestrales vinculadas a un cliente, con fecha de inicio configurable y cálculo automático de fecha de fin (inicio + 3 meses).
- **FR-004**: Cada suscripción MUST tener un cupo mensual de órdenes configurable (monthlyQuota) y un contador de uso mensual (usedPerMonth) que se reinicia cada mes calendario. El operador define el cupo al crear la suscripción.
- **FR-005**: Al crear una orden para un cliente con suscripción activa, el sistema MUST verificar usedPerMonth vs monthlyQuota:
  - Si hay cupo disponible: marca la orden como "cubierta por suscripción" e incrementa usedPerMonth.
  - Si no hay cupo: marca la orden como "suelta con 20% de descuento" sobre el precio estándar (resultado de `estimatePrice()` en `src/lib/pricing.ts`) y NO incrementa usedPerMonth.
- **FR-006**: El sistema MUST mostrar alertas visuales en el panel para suscripciones próximas a vencer (15 días o menos restantes).
- **FR-007**: El sistema MUST permitir renovar una suscripción. Si se renueva antes del vencimiento, el nuevo período comienza al terminar el actual.
- **FR-008**: Un cliente solo puede tener una suscripción activa a la vez. Crear una nueva suscripción marca la anterior como "reemplazada".
- **FR-009**: El sistema MUST mostrar: nombre, teléfono, suscripción activa, órdenes del mes, y estado de alerta (badge visible cuando el cliente tiene una suscripción próxima a vencer — ≤15 días restantes) en la lista de clientes.
- **FR-010**: Suscripciones vencidas no deben contar para verificación de cupo. Las órdenes se manejan con precio estándar.

### Key Entities

- **Client**: Estudiante/padre que solicita servicios. Contiene nombre, teléfono, email, notas, fecha de registro, estado (activo/desactivado). Se vincula a órdenes (1:N) y suscripciones (1:N).
- **Subscription**: Plan trimestral de órdenes. Contiene cliente, fecha de inicio, fecha de fin, cupo mensual, usedPerMonth, estado (activa/vencida/reemplazada), fecha de última renovación. Vinculada a un cliente (N:1).
- **Order** (existente): Ampliada con campo opcional `subscription_id` y `coverageTipo` (estandar / cubierta_por_suscripcion / suelta_con_descuento). Vinculada a cliente (N:1) y opcionalmente a suscripción (N:1).

## Success Criteria

### Measurable Outcomes

- **SC-001**: Un operador puede crear un cliente nuevo y verlo en la lista en menos de 30 segundos.
- **SC-002**: Un operador puede crear una suscripción trimestral para un cliente existente en menos de 20 segundos.
- **SC-003**: El sistema detecta automáticamente si una orden excede el cupo mensual y aplica el descuento del 20% sin intervención manual del operador.
- **SC-004**: Las alertas de suscripciones próximas a vencer se muestran automáticamente al operador sin necesidad de navegación adicional.
- **SC-005**: Un operador puede ver el historial completo de órdenes de un cliente en menos de 3 clics desde la lista de clientes.
- **SC-006**: El contador usedPerMonth se reinicia correctamente al cambiar de mes calendario sin intervención manual.

## Assumptions

- **Cupo mensual**: Se refiere al número de órdenes que cubre la suscripción por mes calendario. Es configurable por suscripción — el operador define el monthlyQuota al crearla. No hay prorrateo para suscripciones creadas a mitad de mes, ni un valor fijo global.
- **Precio estándar**: Es el resultado de la función `estimatePrice()` definida en `src/lib/pricing.ts`, sin descuentos aplicados.
- **Precio de suscripción**: Se asume el valor estándar de ~$25/trimestre definido en la constitución (principio IV). El operador puede ajustarlo al crear la suscripción.
- **Descuento 20%**: Se aplica sobre el precio estándar de la orden (no acumulable con otros descuentos).
- **Alertas**: Se muestran como un banner o sección destacada en el dashboard del panel de administración. Aparecen cuando quedan 15 días o menos antes del vencimiento.
- **Clientes sin suscripción**: No tienen verificación de cupo; sus órdenes usan el flujo estándar existente.
- **Persistencia local**: Toda la información se almacena en IndexedDB en el navegador, consistente con el principio I de la constitución (no hay backend).
- **Reinicio mensual**: El sistema verifica usedPerMonth contra el mes calendario actual. Al cambiar de mes, usedPerMonth se reinicia a 0 para todas las suscripciones activas.