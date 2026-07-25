# Feature Specification: Reportes, Auditoría y Pulido

**Feature Branch**: `004-reportes-auditoria-pulido`

**Created**: 2026-07-24

**Status**: Draft

**Input**: User description: "PRIORIDAD 5: REPORTES, AUDITORÍA Y PULIDO. Objetivo: Tener visibilidad del negocio y trazabilidad de acciones. Hojas: 5.1 Activity Log — Registrar cada acción de operador, vista filtrable. 5.2 Estadísticas mensuales — Gráficos de ingresos, órdenes por operador, distribución. 5.3 Notificaciones push + sonora — Alerta al llegar nueva orden. 5.4 Exportación de backup — JSON con todos los datos de IndexedDB. 5.5 Responsive y accesibilidad — Mobile-first, contraste, navegación por teclado."

## User Scenarios & Testing

### User Story 1 — Activity Log del operador (Priority: P1)

Un operador quiere ver un registro cronológico de todas las acciones realizadas en el panel para saber quién hizo qué y cuándo, y poder filtrar por operador, fecha o tipo de acción para investigar un evento específico.

**Why this priority**: La trazabilidad es fundamental para la auditoría del negocio a dos personas. Sin esto, los operadores no tienen visibilidad de las acciones del otro, lo que puede generar conflictos o pérdida de información.

**Independent Test**: Puede probarse abriendo el panel de actividad, realizando varias acciones (crear orden, cambiar estado, actualizar cliente), y verificando que cada una aparece en el log con operador, fecha y tipo de acción. Los filtros deben reducir correctamente los resultados.

**Acceptance Scenarios**:

1. **Given** un operador ha realizado varias acciones en el panel, **When** abre la vista de Activity Log, **Then** ve una lista cronológica descendente con cada acción (operador, tipo, detalle, timestamp).
2. **Given** la vista de Activity Log está abierta, **When** el operador selecciona un filtro por tipo de acción, **Then** solo se muestran las acciones de ese tipo.
3. **Given** la vista de Activity Log está abierta, **When** el operador selecciona un filtro por fecha (rango), **Then** solo se muestran las acciones dentro de ese rango.
4. **Given** la vista de Activity Log está abierta, **When** el operador selecciona un filtro por operador, **Then** solo se muestran las acciones de ese operador.

---

### User Story 2 — Estadísticas mensuales del negocio (Priority: P1)

Un operador quiere ver un resumen visual del mes actual con indicadores de ingresos estimados, órdenes por estado y distribución por operador, para tomar decisiones informadas sobre capacidad y precios.

**Why this priority**: Sin visibilidad de métricas, los operadores trabajan a ciegas. Esta es la herramienta de gestión más importante después del tracking de órdenes.

**Independent Test**: Puede probarse abriendo la sección de estadísticas después de tener varias órdenes en distintos estados. Deben mostrarse totales correctos y distribución por operador coincidiendo con los datos reales.

**Acceptance Scenarios**:

1. **Given** hay órdenes de varios operadores con distintos estados, **When** el operador abre las estadísticas, **Then** ve un resumen con: total de órdenes del mes, desglose por estado, y distribución por operador.
2. **Given** hay órdenes con montos asociados, **When** se calculan los ingresos, **Then** se muestra un total estimado de ingresos del mes basado en precios de órdenes y suscripciones activas.
3. **Given** las estadísticas están visibles, **When** avanza al siguiente mes, **Then** los indicadores se reinician y reflejan solo el mes actual.

---

### User Story 3 — Exportación manual de datos (Priority: P2)

Un operador quiere descargar un archivo JSON con todos los datos de la aplicación para tener un respaldo externo en caso de pérdida del navegador.

**Why this priority**: La persistencia es local (IndexedDB), por lo que no hay recuperación automática. Un backup manual es la única protección contra pérdida de datos.

**Independent Test**: Puede probarse haciendo clic en el botón de exportación, verificando que se descarga un archivo JSON, y luego inspeccionando que el archivo contiene todas las tablas de datos (órdenes, clientes, suscripciones, operadores, actividad).

**Acceptance Scenarios**:

1. **Given** hay datos en IndexedDB, **When** el operador hace clic en "Exportar backup", **Then** se descarga un archivo JSON con todos los registros de la base de datos.
2. **Given** el archivo JSON se ha descargado, **When** se abre en cualquier editor, **Then** contiene al menos las tablas: órdenes, clientes, suscripciones, operadores, log de actividad, configuración.

---

### User Story 4 — Notificación de nueva orden (Priority: P3)

Un operador quiere recibir una alerta visual y sonora cuando llega una nueva solicitud desde la landing page, para poder atenderla sin tener que recargar constantemente el panel.

**Why this priority**: Mejora el tiempo de respuesta pero no bloquea la operación — los operadores ya revisan el panel manualmente. Es una optimización de confort.

**Independent Test**: Puede probarse simulando el registro de una nueva orden desde otra pestaña o herramienta, y verificando que el panel muestra una notificación y reproduce un sonido sin recarga manual.

**Acceptance Scenarios**:

1. **Given** el panel de administración está abierto y visible, **When** se registra una nueva orden, **Then** aparece una notificación visual en pantalla (toast o banner) indicando "Nueva orden recibida" con el nombre del cliente.
2. **Given** el panel está abierto y visible, **When** se registra una nueva orden, **Then** se reproduce un sonido breve para alertar al operador.
3. **Given** el panel está abierto pero en segundo plano (otra pestaña), **When** se registra una nueva orden, **Then** el título de la pestaña parpadea o muestra un indicador ("(1) Nuevo pedido").

---

### User Story 5 — Experiencia móvil y accesible (Priority: P3)

Un operador quiere poder usar el panel desde un teléfono o tablet cuando no está frente a su computadora, y que los textos tengan suficiente contraste para leer sin esfuerzo.

**Why this priority**: Los operadores pueden necesitar consultar el panel desde el móvil cuando están fuera. La accesibilidad beneficia a todos los usuarios.

**Independent Test**: Puede probarse abriendo el panel en un navegador móvil (o viewport de 375px) y verificando que todas las pantallas principales son navegables sin scroll horizontal y con texto legible.

**Acceptance Scenarios**:

1. **Given** el panel está abierto en un viewport de 375px de ancho, **When** se navega por todas las pantallas principales, **Then** no hay contenido cortado ni scroll horizontal.
2. **Given** cualquier elemento textual en el panel, **When** se mide el contraste, **Then** cumple con la relación mínima 4.5:1 para texto normal.
3. **Given** el panel es navegado por teclado, **When** se presiona Tab secuencialmente, **Then** todos los elementos interactivos reciben foco visible en orden lógico.

---

### Edge Cases

- ¿Qué pasa cuando no hay órdenes ni actividad registrada? Las vistas de Activity Log y Estadísticas deben mostrar un estado vacío informativo, no errores.
- ¿Qué pasa cuando se exporta el backup con 0 registros? El archivo JSON debe ser válido con arrays vacíos, no fallar.
- ¿Qué pasa si hay muchas acciones en el Activity Log (miles)? La vista debe paginarse o virtualizarse para no degradar el rendimiento.
- ¿Qué pasa si el navegador no soporta Notificaciones API o el usuario las bloqueó? La notificación sonora debe fallar silenciosamente sin romper el panel.
- ¿Qué pasa si el operador usa el panel en un dispositivo muy pequeño (< 320px)? El panel fuera del rango especificado (FR-008: 320px-1920px) debe degradarse graceful — contenido reorganizado, sin pérdida de funcionalidad crítica, aunque algunos elementos pueden requerir scroll horizontal.

## Requirements

### Functional Requirements

- **FR-001** (Activity Log): El sistema DEBE registrar cada acción del operador con: timestamp, operador, tipo de acción, ID del recurso afectado y descripción legible (cadena de texto en español, máximo 200 caracteres, incluye nombre del cliente o recurso afectado cuando sea aplicable), y persistirlo en IndexedDB.
- **FR-002** (Activity Log): El sistema DEBE ofrecer una vista que liste las acciones en orden cronológico descendente con filtros combinables por: operador, tipo de acción y rango de fechas.
- **FR-003** (Activity Log): La vista DEBE paginar los resultados (máximo 50 por página) y mostrar el total de acciones encontradas.
- **FR-004** (Estadísticas): El sistema DEBE mostrar un resumen del mes actual con: total de órdenes, desglose por estado, distribución por operador, e ingreso estimado basado en precios de órdenes y suscripciones activas.
- **FR-005** (Exportación): El sistema DEBE permitir al operador descargar un archivo JSON con todos los registros de IndexedDB mediante un solo clic. El archivo DEBE contener cada tabla como un array de objetos.
- **FR-006** (Notificaciones): El sistema DEBE alertar al operador sobre nuevas órdenes mediante: notificación visual en pantalla (toast, auto-dismiss 5 segundos, no intrusiva), sonido breve (0.5-2 segundos, tono distintivo no intrusivo), e indicador en el título de la pestaña.
- **FR-008** (Responsive): El panel DEBE ser funcional en viewports desde 320px hasta 1920px de ancho sin scroll horizontal.
- **FR-009** (Accesibilidad): Todos los elementos interactivos DEBEN ser accesibles por teclado con orden lógico de tabulación y foco visible.
- **FR-010** (Accesibilidad): El contraste de color DEBE cumplir la relación mínima 4.5:1 para texto normal y 3:1 para texto grande.

### Key Entities *(existing, no new entities required)*

- **ActivityLogEntry** (ya existe): Representa una acción registrada, con timestamp, operador, tipo de acción, ID del recurso, descripción y metadatos adicionales.
- **Dashboard Stats** (derivado): No es una entidad persistente — se calcula en tiempo real desde órdenes, suscripciones y clientes en IndexedDB. Refleja el estado actual del mes.

## Success Criteria

### Measurable Outcomes

- **SC-001** (User Experience): Un operador puede encontrar una acción específica en el Activity Log usando filtros con tiempo de respuesta <10 segundos desde que aplica el filtro hasta que se muestran los resultados (percibido por el usuario).
- **SC-002** (Technical): El Activity Log paginado mantiene scroll a 60fps y respuesta de filtros <500ms incluso con 10,000+ registros (métrica técnica de renderizado).
- **SC-003**: Las estadísticas mensuales reflejan exactamente el total de órdenes, distribución por operador e ingresos (coincidencia 1:1 con cálculo manual, sin errores de redondeo ni truncamiento).
- **SC-004**: La exportación de backup descarga un archivo JSON válido (sintaxis correcta, tipos de datos preservados) en menos de 1 segundo para hasta 10 MB de datos, conteniendo todos los registros del sistema (orders, clients, subscriptions, activityLog, operators, config).
- **SC-005**: Una nueva orden genera notificación visual (toast visible) y sonora en menos de 2 segundos desde que se confirma la persistencia en IndexedDB (después de completar la transacción de escritura).
- **SC-006**: El panel es navegable por teclado al 100% — todos los elementos funcionales reciben foco en orden predecible.
- **SC-007**: No hay contenido cortado o con scroll horizontal en viewports de 375px, 768px y 1024px.

## Assumptions

- Los operadores usan navegadores modernos (Chrome, Edge, Firefox actualizados) que soportan notificaciones de escritorio, reproducción de audio en el navegador e indicadores de pestaña en segundo plano.
- El Activity Log registrará acciones existentes (crear, actualizar, eliminar órdenes, clientes, suscripciones) y se extenderá a nuevas acciones según se implementen.
- Las estadísticas mensuales se calculan sobre el mes calendario actual (no sobre períodos configurables). No hay selector de mes en v1.
- La exportación de backup es manual — no hay programa de backups automáticos ni restauración desde la UI. El operador descarga el archivo y lo guarda externamente.
- Mobile-first aplica al panel administrativo completo. La landing page ya es responsive por diseño anterior.
- El ingreso estimado usa el precio registrado en cada orden (no considera descuentos ni abonos parciales para el cálculo resumido).