# Research: App Foundation (Fundación de la App)

**Feature**: 001-app-foundation
**Date**: 2026-07-19
**Spec**: [spec.md](./spec.md)

Este documento consolida las decisiones de diseño para la fundación. No había
marcadores `[NEEDS CLARIFICATION]` en el spec; el stack y las restricciones ya
están fijados por la constitución v1.1.0 y el `AGENTS.md`.

## R1. Almacenamiento persistente local

- **Decision**: Usar Dexie 4 como wrapper delgado sobre IndexedDB.
- **Rationale**: La constitución I permite Dexie explícitamente ("MAY be used as a
  thin wrapper") y prohíbe servidor/sync remoto. Dexie reduce el boilerplate de
  IndexedDB y ofrece `dexie-react-hooks` para reactividad.
- **Alternatives considered**:
  - IndexedDB nativo sin wrapper: más verboso, sin hooks reactivos listos.
  - localStorage: insuficiente para datos estructurados/indexados y con límites
    de tamaño; no cumple el modelo de stores del manual.
  - Sql.js / otra DB en memoria: introduce complejidad innecesaria (YAGNI, V).

## R2. Esquema de autenticación (sin backend)

- **Decision**: Validación de credenciales mediante hash SHA-256 de la contraseña
  ingresada, comparado contra el hash almacenado en el registro del operador.
  Sin secreto de servidor; la comparación ocurre en el cliente.
- **Rationale**: Aclaración aceptada en el spec (Opción A). Para un panel de dos
  personas sin backend, no hay servidor que guarde un secreto; exponer hashes
  (no contraseñas en texto plano) es una compensación aceptable bajo la
  constitución. El hashing se hace con la Web Crypto API del navegador.
- **Alternatives considered**:
  - Hash ofuscado solo en build (Opción B): ata las credenciales al bundle y
    dificulta rotación; menos flexible que `operators` dinámico.
  - Credenciales hardcodeadas (Opción C): rompe el modelo de `operators` y la
    gestión por los dueños.

## R3. Sesión y expiración

- **Decision**: La sesión activa se guarda en `localStorage` con un timestamp de
  expiración derivado de `config.session_timeout_hours`. En cada acceso protegido
  se valida que no haya expirado; si expiró, se limpia y se redirige al login.
- **Rationale**: `localStorage` persiste entre recargas/cierres (cumple SC-2 y
  el escenario de persistencia). La expiración configurable cumple FR-4.
- **Alternatives considered**:
  - sessionStorage: no sobrevive al cierre del navegador; no cumple persistencia.
  - Cookie: innecesaria sin servidor; `localStorage` es suficiente y simple.

## R4. Seeding del primer arranque

- **Decision**: Al iniciar, si el store `config` (o `operators`) está vacío, se
  puebla con valores por defecto definidos por los dueños (hashes de los dos
  operadores y parámetros de `config`).
- **Rationale**: Aclaración aceptada (Opción A). Cumple FR-2 ("valores iniciales
  presentes desde el primer arranque") y evita un panel inaccesible.
- **Alternatives considered**:
  - Sin seed (Opción B): requiere paso manual fuera de la app; peor UX.
  - Seed solo de config (Opción C): deja `operators` vacío y bloquea el login.

## R5. Despliegue estático

- **Decision**: Build estático con `bun run build` → `dist/`; `vercel.json`
  reescribe cualquier ruta a `index.html` (SPA). Deploy automático al conectar
  el repo a Vercel.
- **Rationale**: Cumple constitución I (hosting estático, sin costos fijos) y
  FR-1. Bun es el runtime de build definido en el proyecto.
- **Alternatives considered**:
  - SSR/funciones serverless: violaría constitución I (sin backend).

## R6. Abstracción de acceso a datos reactiva

- **Decision**: Hook `useDelegaDB` (o hooks específicos sobre `dexie-react-hooks`)
  que expone lectura/escritura reactiva a las stores, ocultando el detalle de
  Dexie a las pantallas.
- **Rationale**: Cumple FR-3 (capa de abstracción reactiva) y evita que cada
  pantalla maneje bajo nivel de almacenamiento.
- **Alternatives considered**:
  - Acceso directo a Dexie por pantalla: duplica lógica y acopla UI al storage.
