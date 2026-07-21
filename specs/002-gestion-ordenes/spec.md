# Feature Specification: Gestión de Órdenes

**Feature Branch**: `002-gestion-ordenes`

**Created**: 2026-07-19

**Status**: Draft

**Input**: User description: "PRIORIDAD 2: GESTIÓN DE ÓRDENES (CORE DEL NEGOCIO) Objetivo: Poder recibir, registrar, gestionar y completar una orden de principio a fin. 2.1 CRUD de órdenes en panel; 2.2 Asignación automática de operador según serviceType (op_001/op_002); 2.3 Permisos de escritura (solo órdenes propias, ver todo, notas en cualquiera); 2.4 Sistema de estados: nueva → pendiente_pago → en_progreso → revision → pendiente_final → completada; 2.5 Notas internas con autor y timestamp; 2.6 Adjuntos de archivos (blobs en IndexedDB); 2.7 Dashboard resumen (contadores del mes, órdenes urgentes)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registrar y ver una orden de principio a fin (Priority: P1)

Un operador recibe una solicitud por WhatsApp, abre el panel privado, crea manualmente una orden con los datos del estudiante y el servicio, y la ve aparecer en el listado. Desde la lista puede abrir el detalle y avanzar la orden por su ciclo de estados (nueva → pendiente_pago → en_progreso → revision → pendiente_final → completada) hasta entregarla. Cada cambio queda registrado.

**Why this priority**: Es el flujo central del negocio (constitución, Principio III: Structured Order Tracking). Sin esto el panel no coordina nada; es la funcionalidad mínima viable del producto.

**Independent Test**: Un operador autenticado puede crear una orden desde el panel, verla en el listado y en el detalle, y moverla hasta "completada" confirmando que el estado cambia y persiste tras recargar la página.

**Acceptance Scenarios**:

1. **Given** un operador autenticado en el panel, **When** completa el formulario de nueva orden con cliente, serviceType y descripción, **Then** la orden se guarda con estado `nueva`, un ID `ORD-###` y el operador creador asignado.
2. **Given** una orden en estado `nueva`, **When** el operador selecciona un estado válido siguiente en el detalle, **Then** el estado de la orden se actualiza y la transición queda registrada.
3. **Given** órdenes existentes, **When** el operador abre la lista, **Then** ve todas las órdenes (propias y ajenas) con su estado, cliente y operador asignado.

---

### User Story 2 - Asignación automática y permisos de edición (Priority: P2)

Al crear una orden, el sistema asigna automáticamente al operador responsable según el `serviceType` (op_001 o op_002). Los operadores ven todas las órdenes, pero solo pueden editar/cambiar estado de las que tienen asignadas; en las ajenas solo pueden agregar notas internas.

**Why this priority**: Evita el "caos de WhatsApp" y duplicación de trabajo (Principio II). La asignación por tipo de servicio y el límite de escritura son reglas de coordinación del negocio de dos personas.

**Independent Test**: Crear una orden de un serviceType que asigna a op_002 y verificar que queda asignada a op_002; luego, con sesión de op_001, confirmar que puede verla pero no cambiar su estado (solo agregar nota).

**Acceptance Scenarios**:

1. **Given** se crea una orden con `serviceType` A, **When** se guarda, **Then** se asigna automáticamente al operador `op_001`.
2. **Given** se crea una orden con `serviceType` B, **When** se guarda, **Then** se asigna automáticamente al operador `op_002`.
3. **Given** un operador con sesión distinta al asignado de una orden, **When** intenta cambiar estado o editar campos, **Then** la acción está bloqueada y se muestra un mensaje de solo-lectura.
4. **Given** un operador no asignado, **When** agrega una nota interna, **Then** la nota se guarda con su autor y timestamp.

---

### User Story 3 - Notas internas y adjuntos por orden (Priority: P3)

Cada orden permite registrar notas internas (con autor y marca de tiempo) y adjuntar archivos (ej. entregables, capturas) que se guardan localmente. Las notas y adjuntos ayudan a los dos operadores a coordinar sin perder contexto.

**Why this priority**: Soporte a la coordinación humana (Principio II). No bloquea el flujo core, pero es necesario para cerrar el ciclo de seguimiento de una orden real.

**Independent Test**: Un operador abre una orden, agrega una nota y sube un archivo; tras recargar, la nota y el archivo (descargable) siguen presentes y asociados a la orden.

**Acceptance Scenarios**:

1. **Given** una orden abierta, **When** un operador escribe y guarda una nota, **Then** la nota aparece en la lista con autor y timestamp.
2. **Given** una orden, **When** se adjunta un archivo, **Then** el archivo se almacena y puede descargarse desde el detalle de la orden.
3. **Given** una nota o adjunto existente, **When** cualquier operador lo visualiza, **Then** ve quién lo creó y cuándo.

---

### User Story 4 - Dashboard resumen (Priority: P3)

El panel de inicio muestra contadores del mes (total de órdenes, por estado, ingresos/Pago Móvil registrados) y resalta las órdenes urgentes o vencidas para que ninguna se quede colgada.

**Why this priority**: Constitución Principio III — "ver a simple vista quién debe qué y qué está vencido". Da visibilidad mutua inmediata sin abrir listas.

**Independent Test**: Con órdenes en distintos estados y fechas, el dashboard muestra conteos correctos del mes y lista las órdenes marcadas como urgentes o fuera de plazo.

**Acceptance Scenarios**:

1. **Given** órdenes en el mes actual, **When** el operador abre el dashboard, **Then** ve el conteo total y desglose por estado.
2. **Given** órdenes marcadas urgentes o con fecha límite vencida, **When** abre el dashboard, **Then** aparecen destacadas en una sección de "órdenes urgentes".

---

### Edge Cases

- ¿Qué pasa si se intenta transicionar a un estado no adyacente en el pipeline (ej. de `nueva` a `completada`)? → El sistema debe rechazar transiciones inválidas (en UI y en la capa de servicio) y solo permitir las definidas por el ciclo (FR-005, research R6). [CHK027]
- ¿Qué pasa si un operador crea una orden sin asignar `serviceType`? → No debe permitirse; el serviceType es obligatorio para la asignación automática (contracts C4). [CHK014]
- ¿Qué pasa si `serviceType` no tiene entrada en `serviceOperatorMap`? → Se asigna a `op_001` por defecto y se registra advertencia; no se bloquea la creación (FR-006, CHK011).
- ¿Qué pasa si se sube un archivo muy grande o falla la subida? → El sistema debe advertir/limitar a un tope (≈25 MB) y mostrar mensaje de error de subida sin perder el resto de la orden; un blob corrupto debe poder reintentarse (research R2, CHK015, CHK028, CHK031, CHK032).
- ¿Qué pasa si se elimina una orden? → Las órdenes completadas o con pagos registrados no deben borrarse libremente; se prefiere un estado `cancelada` sobre el borrado físico (conservar trazabilidad del negocio, research R9). Cancelar requiere confirmación (FR-015).
- ¿Qué pasa si dos operadores editan la misma orden propia a la vez? → Ambos están en máquinas distintas (sin sync, Principio I); la última escritura gana. No se implementa resolución de conflictos (fuera de alcance). [CHK029]
- ¿Qué pasa si una orden tiene `dueDate` vencido pero estado `completada` o `cancelada`? → No se muestra como vencida; solo cuentan estados activos (FR-013, CHK034).
- ¿Qué pasa si la sesión expira mientras se ve una orden? → El panel redirige a login (guardián de sesión ya implementado); los datos persisten y no se pierden (FR-014, CHK030).
- ¿Qué pasa si un operador no dueño intenta editar/cambiar estado? → Acción bloqueada: controles deshabilitados y se muestra indicador de solo-lectura (FR-007, contracts C3, CHK003).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE permitir a un operador autenticado crear manualmente una orden con al menos: cliente (nombre/contacto), `serviceType`, descripción del trabajo y fecha de solicitud.
- **FR-002**: El sistema DEBE generar un identificador legible y secuencial (`ORD-###`) para cada orden nueva mediante un contador persistente.
- **FR-003**: El sistema DEBE listar todas las órdenes (de ambos operadores) con su estado, cliente y operador asignado, ordenadas de forma útil (ej. por fecha o urgencia).
- **FR-004**: El sistema DEBE permitir abrir el detalle completo de una orden mostrando todos sus campos, historial de estados, notas y adjuntos.
- **FR-005**: El sistema DEBE permitir cambiar el estado de una orden únicamente siguiendo el pipeline: `nueva` → `pendiente_pago` → `en_progreso` → `revision` → `pendiente_final` → `completada`, más el estado terminal `cancelada`.
- **FR-006**: El sistema DEBE asignar automáticamente el operador responsable (`op_001` o `op_002`) en el momento de crear la orden, basado en el `serviceType` seleccionado, leyendo el mapa `serviceOperatorMap` de `Config`. Si el `serviceType` no tiene entrada en el mapa, el sistema DEBE asignar a `op_001` por defecto y registrar una advertencia en la bitácora (no rechazar la creación). [Claridad, CHK011]
- **FR-007**: El sistema DEBE permitir a cualquier operador ver y leer todas las órdenes, pero restringir la edición de campos y cambios de estado solo a las órdenes asignadas a ese operador.
- **FR-008**: El sistema DEBE permitir a cualquier operador agregar notas internas a cualquier orden. Las notas son de solo-lectura una vez creadas (modelo append-only): no se editan ni se borran, para preservar trazabilidad del coordinación. [Claridad, CHK007]
- **FR-009**: Cada nota interna DEBE registrar el autor (operador) y la marca de tiempo de creación.
- **FR-010**: El sistema DEBE permitir adjuntar archivos a una orden y almacenarlos localmente, así como descargarlos desde el detalle.
- **FR-011**: El sistema DEBE registrar el historial de transiciones de estado de cada orden (de → a, autor, timestamp).
- **FR-012**: El sistema DEBE mostrar en el dashboard contadores del **mes calendario actual** (no por operador): total de órdenes, desglose por estado, y conteo de órdenes urgentes/vencidas, e ingresos Pago Móvil registrados (`totalPaid`). Los conteos abarcan las órdenes de ambos operadores (visibilidad mutua, Principio II). [Claridad, CHK045]
- **FR-013**: El sistema DEBE considerar "urgente" a una orden que cumpla **cualquiera** de: (a) flag manual `urgent = true`, o (b) `dueDate` en el pasado y estado distinto de `completada`/`cancelada`. Ambas condiciones se resaltan en dashboard y listados, distinguidas visualmente (ej. "Vencida" vs "Urgente"). Una orden `completada` o `cancelada` con `dueDate` vencido NUNCA se muestra como vencida. [Claridad, CHK046, CHK034, CHK035]
- **FR-014**: El sistema DEBE persistir todas las órdenes, notas, adjuntos e historial en el almacenamiento local del navegador, de forma que sobrevivan a recargas y cierres. El acceso al panel ya está protegido por sesión; si la sesión expira mientras se ve una orden, el sistema redirige a login (sin perder los datos). [Claridad, CHK030]
- **FR-015**: El sistema DEBE requerir confirmación explícita del operador antes de acciones irreversibles: cancelar una orden (pasar a `cancelada`) y borrar un adjunto. La cancelación conserva el registro (no borrado físico). [Gap, CHK008]
- **FR-016**: La interfaz del panel DEBE cumplir accesibilidad mínima: etiquetas (`label`) asociadas a todo control de formulario, navegación por teclado y foco visibles en listados/formularios/modales, y contraste ≥ 4.5:1 para texto y distintivos de estado. [Gap, a11y, CHK036, CHK037]
- **FR-017**: La interfaz del panel DEBE ser responsive (funcional en escritorio y móvil de los dos operadores) y DEBE mostrar estados de carga y vacío para consultas asíncronas (Dexie), de modo que el panel nunca quede en blanco de forma indefinida. Incluye el estado de bienvenida (zero-state) cuando no existen órdenes: mensaje claro + CTA "Nueva orden". [Gap, NFR, CHK038, CHK039, CHK004]
- **FR-018**: El sistema DEBE calcular y mantener `paymentStatus` de cada orden como `unpaid` | `partial` | `paid`, derivado de `totalPaid` vs `price`: `totalPaid <= 0` → `unpaid`; `0 < totalPaid < price` → `partial`; `totalPaid >= price` → `paid`. El dashboard y el detalle muestran `paymentStatus` por orden (Principio IV). [A1, research R9, contracts C5]

### Controles por estado (affordances)

Define qué controles se habilitan según el estado y el permiso del operador (complementa FR-007 y contracts C3). Un operador no propietario nunca edita ni transiciona, pero siempre puede comentar.

| Estado | Propietario: editar campos | Propietario: cambiar estado a | No propietario |
|---|---|---|---|
| `nueva` | sí | `pendiente_pago` | solo lectura + nota |
| `pendiente_pago` | sí | `en_progreso`, `cancelada` | solo lectura + nota |
| `en_progreso` | sí | `revision`, `cancelada` | solo lectura + nota |
| `revision` | sí | `pendiente_final`, `en_progreso` | solo lectura + nota |
| `pendiente_final` | sí | `completada` | solo lectura + nota |
| `completada` | no (terminal) | — | solo lectura + nota |
| `cancelada` | no (terminal) | — | solo lectura + nota |

[C2, CHK002]

### Key Entities

- **Order (Orden)**: Representa una solicitud de apoyo escolar. Atributos clave: `id` (`ORD-###`), cliente, `serviceType`, descripción, `assignedOperator` (`op_001`/`op_002`), `status` (enumerado del pipeline), `urgent` (flag), fecha límite, fecha de creación, historial de estados, notas, adjuntos, estado de pago (Pago Móvil: unpaid/paid/partial — ver Principio IV). Relación: pertenece a un operador asignado; contiene muchas notas y muchos adjuntos.
- **InternalNote (Nota interna)**: Comentario de coordinación. Atributos: autor (operador), timestamp, texto. Relación: pertenece a una Order.
- **Attachment (Adjunto)**: Archivo binario (blob). Atributos: nombre, tipo MIME, tamaño, blob, autor, timestamp. Relación: pertenece a una Order.
- **StatusTransition (Transición de estado)**: Registro de cambio. Atributos: de, a, autor, timestamp. Relación: pertenece a una Order.
- **Operator (operador)**: Ya definido en fundación; `op_001`/`op_002` con su mapeo a `serviceType`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un operador puede crear una orden completa y verla en el listado en menos de 2 minutos.
- **SC-002**: El 100% de las transiciones de estado siguen el pipeline definido; ninguna transición inválida es aceptada por la interfaz.
- **SC-003**: El 100% de las órdenes creadas muestran el operador asignado correcto según su `serviceType` (sin asignación manual errónea).
- **SC-004**: Un operador no asignado puede ver cualquier orden pero es bloqueado al intentar editarla, en el 100% de los intentos.
- **SC-005**: Las notas y adjuntos agregados persisten y son recuperables tras recargar la página (100% de los casos en pruebas locales).
- **SC-006**: El dashboard refleja conteos del mes y órdenes urgentes coherentes con los datos reales almacenados (sin discrepancias visibles).
- **SC-007**: El estado de una orden avanzada hasta `completada` se mantiene correcto tras cerrar y reabrir la aplicación.

## Assumptions

- El `serviceType` es un valor acotado de 6 tipos (`ensayo`, `presentacion`, `investigacion`, `formato`, `diseno`, `video`), no "dos tipos". La constitución describe el modelo de negocio como "dos operadores, dos service types" a modo de ejemplo; el sistema real soporta 6 tipos mapeados a los dos operadores vía `Config.serviceOperatorMap` (research R1). Esta diferencia está reconciliada: el mapeo es data-driven, no hardcodeado. [CHK041]
- El seguimiento de pago (Pago Móvil, Principio IV) se registra por orden, pero la lógica de cobro completa es manejada por el operador; el sistema solo registra estado de pago (unpaid/paid/partial).
- Los archivos adjuntos se almacenan como blobs en el almacenamiento local del navegador (IndexedDB); no hay envío a la nube (Principio I).
- No hay sincronización entre dispositivos (Principio I); cada operador trabaja en su propia máquina. La visibilidad mutua es dentro del mismo navegador/dispositivo compartido o por acuerdo operativo.
- La eliminación física de órdenes no es un requisito; se prefiere el estado `cancelada` para conservar trazabilidad.
- Los contadores del mes se calculan sobre el almacenamiento local del navegador, sin dependencias externas.
- "Urgente" se modela como un flag manual del operador y/o por fecha límite vencida, sin reglas automáticas complejas.
