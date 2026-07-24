# Feature Specification: Landing + Formulario (Fuente de Clientes)

**Feature Branch**: `fuente-clientes`

**Created**: 2026-07-20

**Status**: Draft

**Input**: User description: "PRIORIDAD 3: LANDING + FORMULARIO (FUENTE DE CLIENTES) Objetivo: Que un estudiante pueda llegar, entender el servicio, llenar el formulario y contactar por WhatsApp. Hojas: 3.1 Página Home (Hero, cómo funciona, precios base, CTA); 3.2 Página Servicios (Tabla completa de servicios y planes trimestrales); 3.3 Página Contacto (FAQ, datos de Pago Móvil, disclaimers); 3.4 Formulario interactivo /delegar (Selector de servicio, campos condicionales, cálculo de precio en tiempo real); 3.5 Generador de WhatsApp (Link wa.me con mensaje pre-llenado y token de seguimiento); 3.6 Página de seguimiento /orden/:token (Vista pública de estado de orden)."

## Clarifications

### Session 2026-07-20

- Q: ¿Cómo se maneja la clave secreta para verificar y firmar el token de seguimiento? → A: Mediante una clave secreta estática configurada en variables de entorno (ej. `BUN_PUBLIC_TRACKING_SALT`).
- Q: ¿Cómo se gestionan los datos de Pago Móvil y disclaimers en la página de contacto? → A: Se cargan dinámicamente desde el almacén de configuración de IndexedDB (`config`) para permitir su edición desde el panel de administración.
- Q: ¿Cómo se define y gestiona la lista de tipos de servicio (ServiceType) y sus campos condicionales asociados? → A: Definidos estáticamente en el código del formulario (en src/pages/DelegatePage.tsx o en src/lib/config/serviceTypes.ts).
- Q: ¿Cómo se construye y verifica el token de seguimiento utilizado en WhatsApp y en la página de seguimiento? → A: Base64(JSON.stringify(datos) + '.' + SHA256(datos + salt)) donde datos incluyen id, serviceType, status, price, etc. y salt es BUN_PUBLIC_TRACKING_SALT.
- Q: ¿Cómo obtiene el operador los enlaces de seguimiento actualizados para enviarlos al cliente cuando cambia el estado de una orden? → A: El operador genera estos enlaces desde el panel administrativo usando la misma función de generación de token que el formulario cliente, pero con los datos actuales de la orden obtenidos de IndexedDB.
- Q: ¿Cómo se pone a disposición del formulario cliente los datos de precios para el cálculo en tiempo real? → A: Los datos de precios se empaquetan en la aplicación en tiempo de build para uso en el cliente, ya que no hay backend para servir estos datos dinámicamente (consistente con Principio I: No-Backend).
- Q: ¿Cómo se manejan y presentan los errores de validación en el formulario de solicitud? → A: Los errores de validación se muestran en tiempo real debajo de cada campo afectado, indicando claramente qué información falta o es inválida, y el botón de WhatsApp permanece deshabilitado hasta que todos los campos requeridos sean válidos.

### Session 2026-07-22

- Q: ¿Cómo se define y gestiona la lista de tipos de servicio (ServiceType) y sus campos condicionales asociados? → A: Definidos estáticamente en el código del formulario (en src/pages/DelegatePage.tsx o en src/lib/config/serviceTypes.ts).
- Q: ¿Cuál es el formato exacto y el proceso de generación/verificación del token de tracking? → A: Base64(JSON.stringify(datos) + '.' + SHA256(datos + salt))
- Q: ¿Cómo se maneja la validación y visualización de errores en el formulario interactivo? → A: Validación en tiempo real con mensajes inline debajo de cada campo

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Descubrir el servicio y consultar tarifas (Priority: P1)

Un estudiante con dudas académicas llega a la landing page (`/`), lee la propuesta de valor (Hero), entiende la simplicidad del proceso en tres pasos (llenar formulario, enviar WhatsApp, recibir entrega), y revisa las tarifas base para decidir si delegar su tarea. Si desea ver detalles de precios específicos por tipo de trabajo o planes trimestrales, navega a la página de Servicios (`/servicios`).

**Why this priority**: Es la puerta de entrada de clientes potenciales. Sin una landing atractiva y clara con precios transparentes, los estudiantes no confiarán en el servicio ni avanzarán al formulario de pedido.

**Independent Test**: Un visitante puede cargar la landing page en escritorio o móvil, leer los textos y navegar entre las secciones públicas (Inicio, Servicios, Contacto) de forma fluida y rápida.

**Acceptance Scenarios**:

1. **Given** un visitante en la página de inicio (`/`), **When** carga la página, **Then** ve un Hero Banner atractivo, una explicación clara de "cómo funciona", rangos de precios aproximados ($3–$15) y un botón de llamada a la acción (CTA) hacia `/delegar`.
2. **Given** un visitante interesado en el detalle de servicios, **When** navega a `/servicios`, **Then** visualiza una tabla detallada con los 6 tipos de servicios (`ensayo`, `presentacion`, `investigacion`, `formato`, `diseno`, `video`), sus precios base, y la oferta del plan trimestral (~$25).

---

### User Story 2 - Completar solicitud y enviar por WhatsApp (Priority: P1)

Un estudiante decide delegar una tarea, entra al formulario interactivo (`/delegar`), selecciona el tipo de servicio que necesita y completa los campos específicos para ese tipo de trabajo. Ve un estimado del precio en tiempo real y, al hacer clic en "Enviar", es redirigido a WhatsApp con un mensaje pre-llenado con todos los detalles del formulario y un token de seguimiento único.

**Why this priority**: Es la conversión clave del negocio (WhatsApp-First, Principio II). Permite la recepción estructurada de pedidos sin intervención inicial del operador ni necesidad de un backend receptor.

**Independent Test**: Llenar el formulario de solicitud con un servicio de presentación, ingresar los datos requeridos (número de diapositivas), presionar enviar y verificar que abre una pestaña de WhatsApp con la información y un token estructurado legible.

**Acceptance Scenarios**:

1. **Given** el formulario `/delegar`, **When** el usuario selecciona un servicio (ej. `ensayo`), **Then** aparecen campos condicionales pertinentes (ej. número de páginas/palabras, nivel académico) y se ocultan los de otros servicios.
2. **Given** el formulario `/delegar` con datos ingresados, **When** el usuario modifica parámetros del trabajo, **Then** la sección de estimación calcula y muestra el precio en tiempo real según el tarifario vigente.
3. **Given** el formulario validado y completo, **When** el usuario hace clic en "Delegar por WhatsApp", **Then** el sistema abre una nueva pestaña con un enlace `https://wa.me/` que contiene el mensaje formateado con los datos estructurados del pedido y un código/token de seguimiento.

---

### User Story 3 - Visualizar el estado de una orden sin backend (Priority: P2)

Un estudiante recibe un enlace de actualización de estado enviado por el operador por WhatsApp (ej. `delega.app/orden/:token`). Al abrir el enlace, el estudiante puede visualizar el progreso y el estado actual de su orden (nueva, pendiente de pago, en progreso, en revisión, completada, cancelada), así como las notas públicas o entregables disponibles, de forma totalmente estática y sin requerir base de datos centralizada.

**Why this priority**: Cumple con el Principio III (Structured Order Tracking) y el Principio I (No-Backend). Permite que el cliente consulte su estado en cualquier momento de manera transparente e interactiva.

**Independent Test**: Cargar una URL de tracking `/orden/TOKEN` con un token codificado válido y confirmar que la página muestra los datos correctos de la orden, su estado ("En Progreso") y la barra de progreso sin hacer llamadas al servidor.

**Acceptance Scenarios**:

1. **Given** una URL de tracking con un token codificado válido, **When** el estudiante la abre, **Then** la aplicación decodifica la información en el cliente y muestra una línea de tiempo del estado actual de la orden con detalles del pedido.
2. **Given** un token corrupto o alterado, **When** el estudiante abre la página, **Then** la interfaz muestra un mensaje de error amigable explicando que el enlace no es válido.

---

### User Story 4 - Resolver dudas y consultar Pago Móvil (Priority: P3)

Un estudiante tiene dudas sobre el servicio antes de contratar o necesita los datos de Pago Móvil para concretar el pago de su orden. Visita la página de Contacto (`/contacto`) donde encuentra una sección de Preguntas Frecuentes (FAQ), los datos bancarios del Pago Móvil de los operadores, y disclaimers sobre el uso del servicio.

**Why this priority**: Ahorra tiempo operativo (Principio V) al resolver de forma autosuficiente las dudas comunes de Pago Móvil y políticas del servicio, reduciendo la mensajería repetitiva en WhatsApp.

**Independent Test**: Navegar a `/contacto`, expandir los acordeones de FAQ y verificar que la información de Pago Móvil y disclaimers sea clara y legible.

**Acceptance Scenarios**:

1. **Given** el visitante en `/contacto`, **When** visualiza la página, **Then** tiene acceso directo a los datos de Pago Móvil (Banco, RIF, Teléfono de los operadores) y a un acordeón de Preguntas Frecuentes desplegable.

---

### Edge Cases

- **WhatsApp no abre o el cliente cancela el envío**: El sistema muestra en la pantalla de éxito de `/delegar` un botón alternativo de "Copiar mensaje al portapapeles" y un link simple por si falla el redireccionamiento automático a WhatsApp.
- **Datos requeridos incompletos**: Ver User Story 2, Acceptance Scenario 3 — la validación inline deshabilita el CTA hasta que todos los campos requeridos sean válidos.
- **Manipulación de precios por el cliente en el token de seguimiento**: Como el token del cliente se genera en el navegador del cliente al enviar el formulario (y se actualiza por el operador en el panel), un cliente podría intentar alterar el token. Para evitarlo, el token público generado por el cliente es meramente descriptivo. El panel del operador importa estos datos pero recalcula y valida el precio internamente mediante `pricing.ts`. El token de seguimiento oficial (el que muestra estados actualizados) es generado y firmado (mediante un hash de verificación SHA-256) únicamente por el panel privado del operador.
- **El cliente pierde su link de tracking**: El operador puede volver a enviarle el link desde la vista de detalle de la orden en el panel administrativo privado en cualquier momento.

## Requirements *(mandatory)*

### Token Format Specification

Todos los tokens de seguimiento siguen el formato: `Base64(JSON.stringify(datos) + '.' + SHA256(datos + salt))` donde `datos` es un objeto JSON con los campos de la orden (id, serviceType, status, price, dueDate, paymentStatus, etc.) y `salt` es la clave secreta estática `BUN_PUBLIC_TRACKING_SALT`. Este formato se utiliza tanto para la generación en el formulario cliente como para la verificación de integridad en la página de tracking y la generación de enlaces oficiales desde el panel del operador. El hash SHA-256 se calcula sobre la concatenación de `JSON.stringify(datos)` + `salt`.

### Functional Requirements

- **FR-001**: El sistema DEBE ofrecer una página Home (`/`) responsiva con secciones de propuesta de valor (Hero), descripción gráfica del flujo de trabajo, rangos de precios base y un CTA visible hacia el formulario.
- **FR-002**: El sistema DEBE proveer una página de Servicios (`/servicios`) con una tabla de los 6 tipos de servicios y planes de suscripción trimestral.
- **FR-003**: El sistema DEBE proveer una página de Contacto (`/contacto`) con acordeón de FAQs, datos del Pago Móvil para transferencias en bolívares (Banco, Teléfono, RIF) y disclaimers legales/académicos, cargando esta información dinámicamente desde el almacén de configuración de IndexedDB (`config`).
- **FR-004**: El formulario en `/delegar` DEBE adaptar sus campos de forma condicional basándose en el `ServiceType` seleccionado (por ejemplo, mostrar "Cantidad de palabras" si es Ensayo, o "Número de diapositivas" si es Presentación). Los tipos de servicio y sus campos condicionales asociados están definidos estáticamente en el código del formulario (en src/pages/DelegatePage.tsx o en src/lib/config/serviceTypes.ts).
- **FR-005**: El formulario en `/delegar` DEBE integrar la lógica de `pricing.ts` para calcular y mostrar un costo estimado de la orden en tiempo real a medida que el estudiante modifica los parámetros.
- **FR-006**: Al hacer submit en `/delegar`, el sistema DEBE generar un link de redirección a WhatsApp (`wa.me`) con el teléfono del negocio (obtenido de las variables de entorno `BUN_PUBLIC_WHATSAPP_NUMBER`) y un mensaje codificado en URL con los datos estructurados.
- **FR-007**: El sistema DEBE incluir un "token de solicitud" único en el mensaje inicial de WhatsApp, generado según el formato definido en "Token Format Specification" más arriba, para facilitar que el panel administrativo del operador lo lea o importe de forma semiautomática si se desea en el futuro.
- **FR-008**: La página `/orden/:token` DEBE ser un visor estático (sin llamadas de red) que decodifique el token recibido por la URL y muestre el estado de la orden actual, ID, fecha estimada, el progreso y los detalles correspondientes.
- **FR-009**: El token de seguimiento utilizado en `/orden/:token` DEBE verificar el hash de integridad SHA-256 (según el formato definido en "Token Format Specification") para evitar manipulaciones de estado o precio por parte del cliente en la URL.
- **FR-010**: El panel privado del operador DEBE tener la funcionalidad de "Generar Enlace de Seguimiento", la cual construye la URL `/orden/:token` firmada (usando el formato de "Token Format Specification") con el estado actual de la orden (por ejemplo, cuando pasa de `pendiente_pago` a `en_progreso`) para que el operador se la envíe al cliente por WhatsApp de un solo clic.

### Key Entities

- **Solicitud de Orden (OrderRequest)**: Estructura temporal en memoria del cliente antes del envío. Atributos: `serviceType`, `clientName`, `clientContact` (WhatsApp/Telegram/Email), `description`, `parameters` (campos dinámicos específicos del servicio), `estimatedPrice`, `createdAt`.
- **Token de Tracking (TrackingToken)**: Cadena Base64 que contiene la información serializada del estado de la orden firmado digitalmente en el cliente. Campos serializados: `id` (`ORD-###`), `clientName`, `serviceType`, `status` (estado actual), `description`, `price`, `dueDate`, `paymentStatus`, `verificationHash`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El formulario interactivo `/delegar` calcula el precio estimado de manera instantánea (en menos de 100ms tras cambiar un parámetro).
- **SC-002**: Al presionar enviar, el mensaje pre-llenado de WhatsApp se genera y redirige correctamente en el 100% de los casos con formato estructurado libre de errores de codificación URL.
- **SC-003**: La decodificación del token de tracking en `/orden/:token` se ejecuta en cliente en menos de 150ms, mostrando la pantalla con el estado sin parpadeos ni pantallas en blanco indefinidas.
- **SC-004**: Si un estudiante manipula manualmente los datos del token en la URL (por ejemplo, alterando el estado de `pendiente_pago` a `completada` o bajando el precio), la página `/orden/:token` detecta la discrepancia del hash de firma y muestra un estado de error de integridad.

## Assumptions

- Las tarifas y parámetros base de cálculo de precio en `/delegar` y `/servicios` son consistentes con la configuración definida en `pricing.ts` e IndexedDB. Los datos de precios se empaquetan en la aplicación en tiempo de build para uso en el cliente, ya que no hay backend para servir estos datos dinámicamente (consistente con Principio I: No-Backend).
- El número de WhatsApp al que se envían las solicitudes está configurado en las variables de entorno de la aplicación (`BUN_PUBLIC_WHATSAPP_NUMBER`).
- Debido a que no hay base de datos compartida entre el cliente y el operador, la única forma de que la página de seguimiento pública `/orden/:token` refleje cambios en el estado es si el operador le envía al cliente un nuevo enlace de tracking actualizado desde el panel cuando el estado de la orden cambia. Esta limitación es aceptada y es consistente con el flujo de coordinación humana WhatsApp-First (Principio II) y No-Backend (Principio I). El operador genera este enlace desde el panel administrativo usando la misma función de generación de token que se utiliza en `/delegar`, pero con los datos actualizados de la orden desde IndexedDB.
- El diseño visual de la landing page y el formulario adoptará una paleta premium, responsiva, con tipografía moderna (ej. Inter o Outfit), transiciones y estados vacíos o cargando elegantes.
