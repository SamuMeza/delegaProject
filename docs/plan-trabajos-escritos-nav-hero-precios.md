# Plan: Trabajos Escritos Unificados + Nav Mobile + Hero + Precios

**Rama:** `feature/trabajos-escritos-nav-hero-precios`
**Fecha:** 2026-08-19

---

## Resumen

Unificar ensayo/investigación/formato en "Trabajos Escritos" con sub-tipos, imagen al hero, sidebar mobile, subida de archivos funcional, páginas legales completas, mejora del área de contacto/FAQ, cambio en el flujo de WhatsApp, y precios actualizados.

---

## 1. Unificar ensayo/investigación/formato → "Trabajos Escritos"

### Sub-tipos (seleccionables en el wizard)

| Sub-tipo | Descripción |
|----------|-------------|
| Ensayo | Redacción de ensayos académicos |
| Tesis / Trabajo de grado | Trabajos de titulación |
| Monografía | Trabajos monográficos |
| Informe | Informes técnicos o académicos |
| Artículo | Artículos académicos o científicos |
| Formato / Normas APA | Aplicar formato a documento existente |

### Campos para "Trabajos Escritos"

| Campo | Tipo | Requerido | Opciones |
|-------|------|-----------|----------|
| Tipo de trabajo | select | Sí | Ensayo, Tesis, Monografía, Informe, Artículo, Formato |
| Tema | text | Sí | — |
| Cantidad de páginas | number | Sí | — |
| ¿Tiene guía/instrucciones? | radio | Sí | Sí / No |
| Instrucciones especiales | textarea | No | — |

**Campos eliminados:** cantidad de palabras, nivel académico, estilo de citación (APA asumido).

### Archivos a modificar (10)

| # | Archivo | Cambio |
|---|---------|--------|
| 1 | `src/lib/types/index.ts` | Reemplazar `"ensayo"`, `"presentacion"`, `"investigacion"`, `"formato"` por `"trabajos_escritos"` en `ServiceType`. Crear `OrderDetailsTrabajosEscritos`. Actualizar `OrderDetails` union. |
| 2 | `src/lib/config/serviceTypes.ts` | Reemplazar 4 entradas por 1: `id: "trabajos_escritos"`, campos con select de sub-tipo, base price $2. |
| 3 | `src/lib/pricing.ts` | Reemplazar 4 `ADJUSTMENTS` por 1 solo: `trabajos_escritos: { "paginas:8+": 1 }`. Quitar ajustes de wordCount, academicLevel, sourceCount. |
| 4 | `src/lib/orders/ui.ts` | Label `trabajos_escritos: "Trabajos Escritos"`. Unificar `defaultOrderDetails()` con caso merged. |
| 5 | `src/lib/orders/parseWhatsApp.ts` | Mapear todos los nombres antiguos (`ensayo`, `investigación`, `formato`, etc.) a `"trabajos_escritos"`. Fallback default → `"trabajos_escritos"`. |
| 6 | `src/pages/admin/OrderCreatePage.tsx` | Unificar switch cases en 1 caso `"trabajos_escritos"`. Default state → `"trabajos_escritos"`. |
| 7 | `src/components/OrderDetailsFields.tsx` | Unificar 4 secciones de formulario en 1 con select de sub-tipo. |
| 8 | `src/pages/ServicesPage.tsx` | Actualizar `SERVICE_UNITS` y `SERVICE_RANGES` con un solo entry `trabajos_escritos: "por tarea"` / `"$2–$5"`. |
| 9 | `src/pages/HomePage.tsx` | Actualizar copy: "Ensayos, presentaciones..." → "Trabajos escritos, diseño..." |
| 10 | `supabase/seed.sql` | `service_operator_map`: `"trabajos_escritos": "op_001"`. `price_ranges`: `"trabajos_escritos": {"min": 2, "max": 5}`. Operator services: `ARRAY['trabajos_escritos']`. |

**Archivos que NO necesitan cambios:**
- `src/lib/orders/service.ts` — usa `ServiceType` genéricamente
- `src/lib/orders/stateMachine.ts` — solo maneja `OrderStatus`

---

## 2. Precios actualizados

### Trabajos Escritos
- Base: **$2** (antes $3-$5 según servicio)
- Ajuste páginas 8+: +$1
- Rango display: `$2–$5`

### Presentación (sin cambios)
- Base: $4
- Rango display: `$4–$6`

### Diseño
- Base: $3
- Sub-tipo **paquete_fotos**: rango $7–$14 (nuevo)
- Sub-tipo **flyers_animados**: rango $8–$10 (nuevo)
- Sub-tipos existentes (logo, infografía, banner): se mantienen en base $3
- Rango display actualizado: `$3–$14`

### Video
- Base: $8
- **Quitar** opción 4K del select de resolución
- **Quitar** ajuste `"resolution:4k": 2` de pricing.ts
- Rango display: `$8–$15`

### Implementación de precios por sub-tipo en Diseño

El sistema actual usa `basePrice` por servicio + ajustes en `ADJUSTMENTS`. Para sub-tipos con rangos distintos:

**Opción A (recomendada):** Agregar lógica en `estimatePrice()` que detecte `designType` y ajuste el precio base:
- `designType === "flyers_animados"` → precio base $8
- `designType === "paquete_fotos"` → precio base $7
- Resto → precio base $3

---

## 3. Hero con imagen

- **Archivo:** `C:\Users\Equipo\Downloads\Gemini_Generated_Image_su3g6hsu3g6hsu3g.png`
- **Dimensiones:** 1493x704 px (2.12:1 — más ancha que 16:9)
- **Destino:** copiar a `public/hero.jpg`
- **Implementación:** reemplazar placeholder del emoji 📚 en `HomePage.tsx` línea 39-47 por `<img src="/hero.jpg">` con `object-cover` y `object-position: center`

---

## 4. Navegación mobile — Sidebar

### Landing (`src/components/landing/LandingLayout.tsx`)

**Actual:** Links ocultos en mobile con `hidden md:flex`. No hay menú hamburguesa.

**Nuevo:**
- Hamburger button ☰ visible solo en `< md`
- Sidebar drawer lateral izquierdo con overlay oscuro
- Links: Inicio, Servicios, Delegar, Contacto
- Cerrar al hacer click en link o en overlay
- Transición suave de apertura/cierre
- Estado: `useState<boolean>` para open/close

### Admin (`src/pages/admin/AdminLayout.tsx`)

**Actual:** Top bar con solo logo + campana. Bottom tab bar con 4 tabs. FAB flotante.

**Nuevo:**
- Hamburger button en top bar mobile (reemplazar botón de notificaciones, mover notificaciones al sidebar o ícono dentro del drawer)
- Reutilizar el sidebar desktop como drawer mobile
- **Eliminar** `BOTTOM_TABS` array y el `<nav>` inferior
- **Eliminar** el FAB flotante
- Botón "Crear nueva orden" dentro del sidebar mobile

---

## 5. Eliminar bottom tabs y FAB del admin

**Archivos afectados:**
- `src/pages/admin/AdminLayout.tsx`

**Cambios:**
- Eliminar array `BOTTOM_TABS` (líneas 31-36)
- Eliminar `<nav>` inferior con tabs (líneas 148-172)
- Eliminar FAB flotante (líneas 175-181)
- Actualizar responsive del `<main>` (quitar `pb-20 md:pb-0`, dejar solo padding normal)
- Agregar hamburger button en mobile top bar
- Agregar drawer overlay + sidebar mobile

---

## 6. Subida de archivos funcional

**Actual:** El upload zone en `DelegatePage.tsx` (líneas 154-159) es 100% visual. No hay `<input type="file">`, no hay handlers, no hay estado para archivos.

**Nuevo:**

### Estado
Agregar al `FormState`:
```ts
files: File[]
```

### Componente
Reemplazar el div placeholder por:
- `<input type="file" multiple accept=".pdf,.docx,.doc" className="hidden" ref={fileInputRef} />`
- `<div onClick={() => fileInputRef.current?.click()}>` — abre el selector
- Drag & drop: `onDragOver`, `onDrop` handlers
- Lista de archivos seleccionados con opción de eliminar
- Icono: cambiar `<Send>` por `<Upload>` (lucide-react)

### Límites
- Máximo 10MB por archivo
- Tipos permitidos: PDF, DOCX, DOC
- Máximo 5 archivos

### Archivos a modificar
| # | Archivo | Cambio |
|---|---------|--------|
| 1 | `src/pages/DelegatePage.tsx` | Agregar `files: File[]` al `FormState`, agregar `fileInputRef`, reemplazar placeholder por upload funcional |
| 2 | `src/components/landing/FileUpload.tsx` | **Nuevo archivo** — componente reutilizable de upload con drag & drop |

---

## 7. Flujo de WhatsApp: copiar + abrir (sin envío directo)

### Problema actual
- El botón "Enviar por WhatsApp" usa `wa.me/?text=...` con emojis que no se renderizan
- Copiar y pegar en el panel admin no funciona correctamente con el formato actual
- Dos botones separados generan confusión

### Solución
Unificar en **un solo botón** con flujo de2 pasos:
1. Copiar mensaje al portapapeles (texto plano, sin emojis problemáticos)
2. Abrir chat de WhatsApp (`wa.me/584167050424` sin `?text=`)

### Cambios en `buildMessage()`
- Mantener formato legible con emojis (para cuando el usuario copia y pega manualmente)
- El mensaje se copia al clipboard, luego se abre WhatsApp vacío
- Feedback visual: "¡Mensaje copiado! Ahora pégalo en WhatsApp"

### Archivos a modificar

| # | Archivo | Cambio |
|---|---------|--------|
| 1 | `src/components/landing/WhatsAppGenerator.tsx` | Reemplazar los2 botones por1: "Copiar y abrir WhatsApp". Primero `navigator.clipboard.writeText(message)`, luego `window.open("https://wa.me/584167050424")`. Agregar estado de feedback "¡Copiado!". Quitar el link `wa.me/?text=...`. |

---

## 8. Páginas faltantes del footer

### Links rotos actuales (5 de 8)

| Link | Target actual | Target nuevo |
|------|---------------|--------------|
| Términos de servicio | `href="#"` | `/legal/terminos` |
| Política de privacidad | `href="#"` | `/legal/privacidad` |
| Aviso de integridad académica | `href="#"` | `/legal/integridad` |
| WhatsApp | `href="#"` | `https://wa.me/584167050424` (link externo) |
| FAQ | `href="#"` | `/contacto#faq` (ancla a sección existente) |

### Páginas a crear

| # | Archivo | Ruta | Contenido |
|---|---------|------|-----------|
| 1 | `src/pages/legal/TerminosPage.tsx` | `/legal/terminos` | Términos de servicio completos |
| 2 | `src/pages/legal/PrivacidadPage.tsx` | `/legal/privacidad` | Política de privacidad completa |
| 3 | `src/pages/legal/IntegridadPage.tsx` | `/legal/integridad` | Aviso de integridad académica |

### Archivos a modificar

| # | Archivo | Cambio |
|---|---------|--------|
| 1 | `src/App.tsx` | Agregar rutas `/legal/terminos`, `/legal/privacidad`, `/legal/integridad` |
| 2 | `src/components/landing/LandingLayout.tsx` | Actualizar footer: cambiar `href="#"` por `<Link>` de React Router. WhatsApp → link externo `wa.me`. FAQ → `/contacto#faq`. |
| 3 | `src/pages/legal/TerminosPage.tsx` | **Nuevo archivo** |
| 4 | `src/pages/legal/PrivacidadPage.tsx` | **Nuevo archivo** |
| 5 | `src/pages/legal/IntegridadPage.tsx` | **Nuevo archivo** |

---

## 9. Contenido de páginas legales

### 9.1 Términos de Servicio (`/legal/terminos`)

| Sección | Contenido esencial |
|---------|-------------------|
| Aceptación de términos | Usar Delega implica aceptar estos términos. Fecha de última actualización visible. |
| Descripción de servicios | Apoyo académico: ensayos, tesis, diseño, video. No es garantía de calificación. |
| Proceso | WhatsApp-first: solicitud → cotización → pago → entrega. |
| Precios y pago | Precios en USD ($2–$15), pago vía Pago Móvil, tipo de cambio del día. |
| Entrega y revisiones | Tiempos estimados por tipo de servicio. Revisiones incluidas. |
| Obligaciones del usuario | Información veraz, uso ético del material. |
| Propiedad intelectual | Licencia de uso personal. Delega no reclama el trabajo entregado tras pago completo. |
| Limitación de responsabilidad | No garantiza calificaciones. Máximo liability = monto pagado. |
| Cancelaciones | Reembolso total antes de iniciar. Parcial después. Sin reembolso tras entrega aceptada. |
| Ley aplicable | Leyes de la República Bolivariana de Venezuela. |
| Contacto | WhatsApp + email. |

### 9.2 Política de Privacidad (`/legal/privacidad`)

| Sección | Contenido esencial |
|---------|-------------------|
| Responsable de datos | Delega. |
| Datos recolectados | Nombre, teléfono (WhatsApp), email, datos académicos, referencias de pago. |
| Finalidad | Procesar órdenes, comunicar estado, mejorar servicio. |
| Base legal | Consentimiento expreso + necesidad contractual. |
| Compartición | No se vende datos. Compartido solo con Supabase (infraestructura EE.UU.). |
| Seguridad | Cifrado en tránsito y reposo. Acceso limitado a operadores. |
| Retención | Datos de órdenes se mantienen para servicio y auditoría. |
| Derechos del usuario | Acceso, rectificación, eliminación, retiro de consentimiento (Ley de Protección de Datos Personales, abril 2025). |
| Contacto | WhatsApp + email para ejercer derechos. |

### 9.3 Aviso de Integridad Académica (`/legal/integridad`)

| Sección | Contenido esencial |
|---------|-------------------|
| Propósito | Todo servicio es de apoyo académico y referencia. Modelos, guías, material de estudio. |
| Responsabilidad del estudiante | Cumplir políticas de integridad de su institución. |
| No garantía de calificación | Delega no garantiza notas, admisión ni aprobación. |
| Compromiso de originalidad | Todo trabajo es original y sin plagio. |
| Usos prohibidos | Presentar como propio sin entender, usar para deshonestidad académica. |
| Marco ético | Apoyo académico debe mejorar aprendizaje, no reemplazarlo. |

### Nota legal
- **Ley de Protección de Datos Personales** (abril 2025, Venezuela) — requiere consentimiento, minimización, seguridad
- **Constitución Art. 28** — derecho a la privacidad
- **Ley de Protección al Consumidor** — honorarios, facturación, mecanismos de reclamo
- **Ley sobre Mensajes de Datos y Firmas Electrónicas** — validez de comunicaciones electrónicas

---

## 10. Mejora del área de contacto/FAQ

### Problema actual
- FAQ carga desde Supabase (`config.faqs`), pero si no hay datos solo muestra "Cargando..."
- WhatsApp es texto estático sin link real
- No hay forma de contacto directo más allá de las FAQs predefinidas
- El área se siente vacía

### Mejoras propuestas

#### 10.1. Link de WhatsApp funcional
Reemplazar texto estático por link a `wa.me/584167050424` con mensaje pre-llenado.

#### 10.2. Formulario de contacto rápido
Formulario simple (nombre, mensaje) que genere un link de WhatsApp con el mensaje pre-llenado. Permite dudas personalizadas sin salir de la página.

#### 10.3. Sección "¿Cómo funciona?"
Sección visual con3 pasos:
1. Selecciona tu servicio
2. Envía tu solicitud por WhatsApp
3. Recibe tu trabajo

Resuelve la duda más común de nuevos estudiantes.

#### 10.4. FAQ mejorado con 10 preguntas

| # | Pregunta | Respuesta |
|---|----------|-----------|
| 1 | ¿Qué es Delega y cómo funciona? | Servicio de apoyo escolar en Venezuela. Envías tu tarea por WhatsApp, te damos cotización, confirmas pago, nuestro equipo trabaja. Sigues el estado desde la plataforma. |
| 2 | ¿Cuáles son los precios? | Varían por tipo y complejidad. Servicios individuales $2–$15. Suscripciones trimestrales ~$25. Cotización personalizada por WhatsApp. |
| 3 | ¿Cómo pago? | Pago Móvil (transferencia móvil). Te damos los datos tras aceptar cotización. Orden comienza al confirmar pago. |
| 4 | ¿Cuánto tarda? | Tareas simples: 24–48h. Complejas (tesis): 3–7 días. Tiempo estimado en la cotización. |
| 5 | ¿Puedo pedir cambios? | Sí, revisiones incluidas. Ajustes sin costo adicional tras la entrega. |
| 6 | ¿El trabajo es original? | Sí, todo es original y sin plagio. Recomendamos usar como referencia y citar adecuadamente. |
| 7 | ¿Es legal usar este servicio? | Sí, es apoyo académico como un tutor. El uso es responsabilidad del estudiante. |
| 8 | ¿Cómo sigo mi orden? | Enlace de seguimiento único con estado en tiempo real. También por WhatsApp. |
| 9 | ¿Ayudan con cualquier materia? | Ensayos, tesis, diseño, video. Para necesidades específicas, preguntar por WhatsApp. |
| 10 | ¿Qué pasa si no estoy satisfecho? | Correcciones sin costo. En casos excepcionales, reembolso según circunstancias. |

#### 10.5. Disclaimers para incluir en el sitio
1. "Los servicios son de apoyo académico y referencia. No garantizamos calificaciones."
2. "Precios en USD. Pago vía Pago Móvil. Tipo de cambio del día."
3. "Delega se reserva el derecho de modificar o suspender servicios sin previo aviso."

### Archivos a modificar

| # | Archivo | Cambio |
|---|---------|--------|
| 1 | `src/pages/ContactPage.tsx` | Reescritura completa: formulario WA, sección "Cómo funciona", FAQ con búsqueda, fallback hardcoded, 10 preguntas |

---

## 11. Orden de ejecución

1. Crear rama `feature/trabajos-escritos-nav-hero-precios`
2. Tipos y configuración (`types/index.ts`, `serviceTypes.ts`, `pricing.ts`)
3. Componentes (`ServiceSelector`, `DynamicFields`, `OrderDetailsFields`, `OrderCreatePage`)
4. UI y labels (`ui.ts`, `parseWhatsApp`, `ServicesPage`, `HomePage`)
5. Seed SQL (actualizar datos en Supabase)
6. Hero image (copiar imagen, actualizar `HomePage.tsx`)
7. Subida de archivos funcional (`DelegatePage.tsx` + nuevo `FileUpload.tsx`)
8. WhatsApp: flujo copiar + abrir (`WhatsAppGenerator.tsx`)
9. Nav mobile landing (`LandingLayout.tsx`)
10. Nav mobile admin (`AdminLayout.tsx` — sidebar + eliminar bottom tabs/FAB)
11. Páginas legales (3 páginas + rutas en `App.tsx` + actualizar footer links)
12. Mejora contacto/FAQ (`ContactPage.tsx`)
13. Video: quitar 4K (`serviceTypes.ts`, `pricing.ts`, `OrderDetailsFields.tsx`)
14. Build test y commit

---

## 12. Riesgos y notas

- **Supabase seed:** los datos en `seed.sql` son para setup inicial. Si ya hay datos en Supabase con los service types antiguos, se necesita un script de migración o actualización manual.
- **Órdenes existentes:** órdenes con `serviceType: "ensayo"` etc. seguirán funcionando pero no se mostrarán correctamente en el UI hasta que se migren a `"trabajos_escritos"`.
- **Imagen del hero:** la imagen es más ancha que 16:9, se recortará lateralmente con `object-cover`. Verificar que el contenido importante esté centrado.
- **Contenido legal:** las páginas legales se crean con contenido completo basado en investigación de leyes venezolanas. Se recomienda revisión por abogado.
- **FAQ hardcoded:** si Supabase no tiene FAQs configurados, se muestran las 10 por defecto.
- **Archivos subidos:** actualmente solo se guardan en memoria del browser (no se suben a Supabase Storage). Los archivos se pierden al recargar. Para persistencia real se necesitaría Supabase Storage (futuro).
- **Ley de Protección de Datos Personales** (abril 2025): la ley está en implementación progresiva. Delega debe adoptar buenas prácticas ahora y estar preparada para registrarse cuando sea requerido.
