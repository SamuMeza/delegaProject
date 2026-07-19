# Spec: App Foundation (Fundación de la App)

**Feature**: 001-app-foundation
**Status**: Draft
**Created**: 2026-07-19
**Priority**: PRIORIDAD 1 (Fundación)

## Overview

Delega necesita una base operativa funcional: una aplicación web que arranque
correctamente, guarde los datos de forma persistente en el navegador del
operador, y permita a los dos operadores del negocio iniciar sesión en el panel
privado de forma segura. Sin esta base, ninguna otra funcionalidad (órdenes,
clientes, suscripciones) puede construirse ni probarse.

Esta especificación cubre el "andamiaje" del producto: el proyecto desplegable,
el almacenamiento de datos local, la abstracción de acceso a datos, el sistema
de autenticación, y el esqueleto visual del panel administrativo.

## Clarifications

### Session 2026-07-19

- Q: ¿Cómo se validan las credenciales de los operadores? → A: El hash SHA-256 de la contraseña ingresada se compara contra el hash almacenado en el registro del operador en el cliente; no hay secreto de servidor.
- Q: ¿Qué ocurre en el primer arranque sin operadores? → A: Seeding automático: si no hay datos, se crean `operators` y `config` con valores por defecto definidos por los dueños.

## Objetivos

- La aplicación se construye como un sitio estático y se despliega manualmente en
  un hosting estático (Vercel) subiendo el repositorio a GitHub y conectándolo a
  Vercel; el deploy se hace directamente desde Vercel tras el push.
- Los datos del negocio sobreviven recargas y cierres del navegador (persistencia
  local en el navegador del operador).
- Solo los operadores autorizados (con cuentas separadas) pueden entrar al panel
  privado.
- El panel privado tiene una estructura de navegación clara y protegida.

## User Scenarios & Testing

### Escenario 1: Despliegue exitoso
Como dueño del negocio, subo el repositorio a GitHub y conecto el proyecto a
Vercel; desde la interfaz de Vercel despliego el sitio manualmente. Verifico que
el sitio carga correctamente en una URL pública.

**Criterio de aceptación**: Tras subir el repo a GitHub y desplegar desde Vercel,
se obtiene un sitio accesible y funcional en la URL pública (el build estático
debe terminar sin errores antes del despliegue).

### Escenario 2: Persistencia de datos
Como operador, registro información en el panel, cierro el navegador y lo vuelvo
a abrir; la información sigue ahí. Cada operador tiene su propia cuenta y sus
datos persisten en el navegador que usa, de forma independiente.

**Criterio de aceptación**: Los datos iniciales del sistema (operadores y
configuración) existen desde el primer arranque y no se pierden al recargar.
Las cuentas de los dos operadores son separadas y cada una autentica por su
propio usuario/contraseña.

### Escenario 3: Acceso controlado
Como operador, inicio sesión con mis credenciales, uso el panel, y al cabo de un
tiempo de inactividad la sesión se cierra sola por seguridad.

**Criterio de aceptación**: Con credenciales correctas accedo; con credenciales
incorrectas se rechaza; pasado el tiempo de expiración debo volver a iniciar
sesión.

### Escenario 4: Navegación del panel
Como operador autenticado, veo una barra lateral con las secciones del negocio,
un encabezado con mi identidad y un botón para salir, y un área central donde se
muestra el contenido.

**Criterio de aceptación**: Intentar abrir el panel sin sesión redirige al
inicio de sesión.

## Functional Requirements

### FR-1: Proyecto desplegable (tarea 1.1)
El sistema debe ser un proyecto web construible y publicable en hosting estático
con despliegue automático desde el repositorio. La compilación debe finalizar
sin errores.

- **Acceptance**: Un push al repositorio genera un despliegue accesible; el
  `build` del proyecto termina exitosamente de forma reproducible.

### FR-2: Almacenamiento local persistente (tarea 1.2)
El sistema debe contar con un almacenamiento local en el navegador que defina las
colecciones de datos necesarias, sus índices de búsqueda, y los valores iniciales
del negocio: la lista de operadores y la configuración general (contadores de
IDs, tiempos de sesión, parámetros de negocio).

- **Acceptance**: Al primer arranque, si el almacenamiento está vacío, el sistema
  puebla automáticamente las colecciones requeridas con sus índices y los valores
  iniciales (`operators`, `config`) definidos por los dueños; dichos valores
  quedan presentes y consultables en arranques posteriores.

### FR-3: Abstracción de acceso a datos (tarea 1.3)
El sistema debe ofrecer una capa de acceso a los datos locales que permita a las
pantallas leer y escribir en las colecciones de forma reactiva, sin que cada
pantalla maneje detalles de bajo nivel del almacenamiento.

- **Acceptance**: Las pantallas pueden listar, crear, actualizar y consultar
  datos locales a través de la abstracción, y reflejan cambios en pantalla sin
  recargar manualmente.

### FR-4: Autenticación de operadores (tarea 1.4)
El sistema debe permitir a un operador iniciar sesión con usuario y contraseña
validados contra la configuración del negocio, mantener la sesión en el
dispositivo del operador, y cerrar la sesión automáticamente tras un periodo de
expiración configurable.

- **Acceptance**:
  - Credenciales válidas → acceso concedido y sesión persistida localmente.
  - Credenciales inválidas → acceso denegado con mensaje claro.
  - Tras el tiempo de expiración (session_timeout) → sesión cerrada, requiere
    reingreso.
  - No se almacenan contraseñas en texto plano.

### FR-5: Layout del panel administrativo (tarea 1.5)
El sistema debe presentar, para operadores autenticados, un panel con barra
lateral de navegación, encabezado (identidad + cierre de sesión) y área de
contenido, y debe proteger todas sus rutas de acceso sin sesión.

- **Acceptance**:
  - El panel muestra sidebar, header y contenido.
  - La barra lateral lista al menos estas secciones (vistas placeholder, sin
    lógica de negocio aún): Dashboard, Órdenes, Clientes, Suscripciones,
    Estadísticas y Log de actividad.
  - El encabezado muestra la identidad del operador (nombre de usuario) y un
    botón de logout.
  - El botón de logout (cerrar sesión) cierra la sesión y redirige al login.
  - Toda ruta del panel sin sesión activa redirige al inicio de sesión.

## Key Entities

- **Operador (Operator)**: persona autorizada a usar el panel; identificada por
  `username`, con una contraseña representada únicamente por su hash (SHA-256) y
  rol dentro del negocio de dos personas. Cada operador tiene su propia cuenta
  separada. La validación de login compara el hash de la contraseña ingresada
  contra el hash almacenado; no existe secreto de servidor.
- **Configuración (Config)**: parámetros globales del negocio (contadores para
  generar IDs `ORD-###`/`SUB-###`, tiempo de expiración de sesión, rangos de
  precios). Es la fuente de valores iniciales.
- **Sesión (Session)**: estado de acceso del operador en su dispositivo, con
  marca de expiración (`expiresAt`). La sesión se guarda en `localStorage` y es
  gestionada por el módulo de autenticación (`useAuth`); no es una entidad
  persistida en IndexedDB, sino un estado de sesión del dispositivo.

## Success Criteria

- **SC-1**: El sitio público es accesible en su URL de producción y carga sin
  errores en menos de 5 segundos en una conexión residencial típica.
- **SC-2**: Tras recargar o cerrar/reabrir el navegador, los datos iniciales del
  negocio (operadores y configuración) siguen presentes (100% de retención en
  pruebas locales).
- **SC-3**: Un operador completa el flujo de login→uso→logout en menos de 1
  minuto.
- **SC-4**: El 100% de las rutas del panel están protegidas; un acceso sin sesión
  nunca muestra contenido del panel.
- **SC-5**: La tasa de rechazo de credenciales incorrectas es del 100% (ninguna
  contraseña inválida otorga acceso).

## Assumptions

- El hosting estático es Vercel (free tier), coherente con la constitución
  (sin costos fijos).
- La autenticación es para los dos operadores únicamente; no hay registro
  público de usuarios (principio II de la constitución).
- Las credenciales se validan contra valores de configuración del negocio
  expuestos de forma segura al cliente (hashes, no texto plano), aceptable para
  un panel de dos personas según la constitución.
- La expiración de sesión por defecto es de varias horas; el valor exacto es
  configurable en `config`.
- El cross-device sync está fuera de alcance (principio I: datos solo en el
  navegador del operador). Cada operador accede con su cuenta separada y sus
  datos viven en el navegador que usa; no hay sincronización entre dispositivos.
- El manual técnico detallado del negocio (`manual_tecnico_delega.md`) está
  disponible en el escritorio del equipo (referencia offline; no forma parte de
  esta fase de fundación).

## Dependencies

- Repositorio de código conectado al hosting estático.
- Definición de los dos operadores y sus credenciales (hashes) para poblar el
  sistema inicial.

## Scope Boundaries

**Incluido**: build/despliegue, almacenamiento local + valores iniciales,
abstracción de datos, login/logout con expiración, layout y protección de rutas
del panel.

**Excluido** (otras fases): alta/edición real de órdenes, clientes,
suscripciones, seguimiento de pagos, estadísticas, y cualquier feature de
negocio más allá del esqueleto del panel.
