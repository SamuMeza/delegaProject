# Technical Debt - Grupo B (Priority 5)

Los siguientes elementos fueron identificados como Priority 5 en el manual técnico y fueron bloqueados para implementación futura según instrucciones del usuario del 24/07/2026.

## Elementos pendientes de implementación:

### 1. Páginas de Reportes Independientes
- **ActivityLogPage**: Vista independiente para el registro de actividades
- **StatisticsPage**: Vista independiente para estadísticas detalladas  
- **SubscriptionsPage**: Vista independiente para gestión de suscripciones

### 2. Sistema de Notificaciones
- Implementar sistema de notificaciones en tiempo real (aunque sea local-first)
- Notificaciones para cambios de estado de órdenes
- Recordatorios de vencimientos próximos
- Alertas de actividades recientes

### 3. Mejoras al Dashboard
- **Gráficos integrados**: Visualizaciones de tendencias, distribución de servicios, ingresos por operador
- **Accesos rápidos**: Atajos a acciones comunes desde el dashboard principal
- **Widgets personalizables**: Permitir a los operadores configurar qué información ven primero

### 4. Mejoras Generales
- Animaciones y transiciones adicionales usando tw-animate-css
- Mejoras en accesibilidad más allá del WCAG 2.1 AA básico
- Optimizaciones de rendimiento para grandes volúmenes de datos

## Estado actual
Todos los elementos del Grupo 1-4 (corregimientos de alta prioridad) han sido implementados según el manual técnico. Estos elementos del Grupo 5 representan mejoras de experiencia de usuario y funcionalidades avanzadas que se posponen para futuras iteraciones.

## Próximos pasos sugeridos
Cuando se autorice el trabajo en Grupo 5:
1. Priorizar basado en feedback de usuarios operadores
2. Implementar siguiendo los mismos principios de local-first y simplicidad
3. Mantener compatibilidad con el enfoque mobile-first y accesibilidad existente