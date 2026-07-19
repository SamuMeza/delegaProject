# Mockup — Servicios y Planes (`/servicios`)

**Referencia visual:** `servicios_y_planes_delega/screen.png`. Estructura en `servicios_y_planes_delega/code.html`.
**Manual:** §8.2 · **Tokens:** `docs/design-tokens.md`

## Layout

```
NAV (igual que inicio, item activo = Servicios/Pricing)
┌────────────────────────────────────────────────────────┐
│ HEADER centered: H1 display-lg "Precios claros..."       │
│   P body-lg variant                                      │
├────────────────────────────────────────────────────────┤
│ INDIVIDUAL SERVICES (grid 3 col, cards)                  │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │
│  │ Ensayo │ │Presenta│ │Investig│ │Formato │ │ Diseño │ │  (6 del manual;
│  │ $3-$5  │ │ $4-$6  │ │  $5    │ │  $2    │ │  $3    │ │   video $8-15)
│  │ icon   │ │ icon   │ │ icon   │ │ icon   │ │ icon   │ │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ │
│  + Video (card 6)  $8-$15                                │
│  Badge urgencia: bg-error-container "Urgencia +50% <48h" │
├────────────────────────────────────────────────────────┤
│ QUARTERLY PLANS (grid 4 col)                             │
│  Básico   Pro*    Creativo   Full                        │
│  $25      $45     $35        $60   (trimestrales)       │
│  (4/mes)  (8/mes) (3 diseño) (6/mes,máx3 socio)         │
│  [Select Básico bg-primary-fixed-dim]                    │
│  [Select Pro bg-primary MOST POPULAR]                   │
│  [Select Creativo ...]  [Select Full bg-secondary]      │
│  Nota: mensual alt. +15% (Básico $10, Pro $17...)       │
└────────────────────────────────────────────────────────┘
FOOTER (bg-primary)
```

## Tokens
- Cards servicios: `bg-surface-container-lowest rounded-xl shadow-ambient hover:shadow-ambient-hover`.
- Iconos: `bg-surface-container rounded-lg text-primary` + Material Symbols.
- Plan destacado: `border-2 border-primary`, badge `bg-primary text-on-primary`.
- Botón Full: `bg-secondary text-on-secondary` (CTA premium).

## Adaptación al manual (§9.2)
- Precios base exactos: ensayo 1-3=$3, 4-7=$5; presentación 10diap=$4, 11-20=$6;
  investigación=$5; formato=$2; diseño=$3; video corto=$8, presentación=$15,
  publicitario=$12, educativo=$10.
- Planes: Básico $25 (4/mes), Pro $45 (8/mes), Creativo $35 (3 diseño/video),
  Full $60 (6/mes, máx 3 socio). Mensual alt: +15%.
- Urgencia +50% <48h (badge `urgency-alert`).
