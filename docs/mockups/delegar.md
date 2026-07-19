# Mockup — Delegar (`/delegar`)

**Referencia visual:** `delegar_tarea_delega/screen.png`. Estructura en `delegar_tarea_delega/code.html`.
**Manual:** §6 y §8.3 · **Tokens:** `docs/design-tokens.md`

## Patrón "Sequential Step" (formulario de una sola página, pasos revelados)

```
HEADER transaccional (bg-surface-studio, shadow-sm, fixed)
  Delega          [✕ Cancel (ghost)]

MAIN (max-w-3xl, single col)
 Progress bar (bg-secondary lleno según paso) + 4 indicadores:
   [1 Service]──[2 Details]──[3 Contact]──[4 Summary]

 ┌─ STEP 1: Service (card bg-white rounded-xl shadow-ambient) ─┐
 │ H2 headline-md "¿Qué necesitas?"                            │
 │ Grid 2-col de opciones (radio peer-checked → border-secondary│
 │  + bg-secondary-container):                                │
 │  Ensayo | Presentación | Investigación | Formato | Diseño | Video│
 │  (6 servicios del manual, íconos Material Symbols)         │
 │  [Next Step → bg-secondary]                                │
 └────────────────────────────────────────────────────────────┘

 ┌─ STEP 2: Details (DynamicFields según servicio) ──────────┐
 │ Campos condicionales (manual §2.2.4): tema, páginas,      │
 │  normas, diapositivas, profundidad, tipoDocumento, etc.   │
 │ Inputs h-12 rounded-lg border-border-subtle bg-surface-   │
 │  studio. File upload (dashed, "Max 10MB", 3 archivos).    │
 │ [Back ghost]  [Next Step → bg-secondary]                  │
 └────────────────────────────────────────────────────────────┘

 ┌─ STEP 3: Contact ─────────────────────────────────────────┐
 │ Nombre (min 2), WhatsApp (formato VEN 04XX-XXX-XXXX),     │
 │ Fecha entrega (mín 48h; si <48h → aviso +50%).            │
 └────────────────────────────────────────────────────────────┘

 ┌─ STEP 4: Summary + Price ─────────────────────────────────┐
 │ Resumen tarjeta (bg-surface-studio). Precio estimado en   │
 │  tiempo real (PriceEstimator). Si <48h: "+50%". Si suscrip │
 │  activa con cupo: "$0 (cubierto por suscripción)".        │
 │ [Edit Details ghost]  [Enviar por WhatsApp bg-#25D366]    │
 └────────────────────────────────────────────────────────────┘
```

## Tokens
- Progress/active step: `bg-secondary text-white`. Inputs focus ring: `secondary` 2px.
- Botón enviar: verde WhatsApp `#25D366` (fuera de paleta base, propio de la marca WA).
- Cards: `rounded-xl shadow-ambient`.

## Adaptación al manual (§6.3)
- Validaciones: nombre ≥2, teléfono formato VEN, fecha ≥48h, tema ≥5 chars.
- Archivos: ≤10MB, ≤3. Urgencia <48h → chip `urgency-alert` + aviso.
