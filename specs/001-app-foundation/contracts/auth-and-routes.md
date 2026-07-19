# Contracts: App Foundation (Fundación de la App)

**Feature**: 001-app-foundation
**Date**: 2026-07-19
**Spec**: [spec.md](./spec.md) · **Data Model**: [data-model.md](./data-model.md)

Contratos de interfaz para esta fase (app web estática, sin API externa). Se
documentan el contrato de autenticación y el de protección de rutas del panel.

## C1. Contrato de Autenticación (Login)

**Actor**: Operador (los dos dueños del negocio).

**Entrada (formulario de login)**:
- `username`: texto (no vacío).
- `password`: texto (no vacío).

**Comportamiento**:
1. Buscar `Operator` por `username`.
2. Calcular `h = SHA-256(password)`.
3. Si `h === operator.passwordHash` → crear `Session` (ver data-model) y redirigir
   al panel.
4. Si no existe el usuario o el hash no coincide → mostrar mensaje de error
   genérico ("Credenciales incorrectas") sin revelar cuál campo falló.

**Salida**:
- Éxito: sesión persistida en `localStorage`; navegación a `/admin`.
- Fallo: sin sesión; mensaje de error claro.

**Logout**: elimina `Session` de `localStorage` y redirige a `/admin/login`.

**Expiración**: en cualquier acceso protegido, si `now > session.expiresAt`,
eliminar `Session` y redirigir a login.

## C2. Contrato de Protección de Rutas del Panel

**Regla**: toda ruta bajo `/admin/*` (excepto `/admin/login`) requiere `Session`
válida.

**Comportamiento**:
- Con `Session` válida → render del panel (sidebar + header + contenido).
- Sin `Session` o expirada → redirección a `/admin/login`.

**Header del panel** debe mostrar:
- Identidad del operador (`displayName` / `username`).
- Botón de logout.

**Sidebar** debe listar las secciones del negocio (al menos: Dashboard,
Órdenes, Clientes, Suscripciones, Estadísticas, Log de actividad) como
navegación; en esta fase el contenido de cada sección es un placeholder.

## C3. Contrato de Persistencia Inicial (Seeding)

**Trigger**: primer arranque de la app en un navegador sin datos.

**Garantía**: tras el seeding, `config` y los dos `operators` existen y son
consultables; las recargas subsiguientes no duplican ni pierden estos datos.

## C4. Contrato de Build/Despliegue

**Build**: comando de build produce un directorio estático (`dist/`) sin errores.

**Deploy**: el hosting estática sirve la SPA; cualquier ruta desconocida
reescribe a `index.html` para que el router client-side funcione.

**Criterio de aceptación (FR-1)**: un push al repo genera un despliegue accesible
en la URL pública; el build termina exitosamente de forma reproducible.
