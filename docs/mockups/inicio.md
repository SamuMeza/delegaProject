# Mockup — Inicio (`/`)

**Referencia visual:** `inicio_delega/screen.png` (no editable). Estructura confirmada en `inicio_delega/code.html`.
**Manual:** §8.1 · **Tokens:** `docs/design-tokens.md`

## Layout (desktop 1280px)

```
┌──────────────────────────────────────────────────────────────────────┐
│ NAV (fixed, bg-surface-studio, shadow-ambient)                        │
│  Delega(logo, font-headline-md)      Servicios  Contacto  │ Delegar → │
│                                        [Admin Login]  [Delegate Now bg-primary]│
└──────────────────────────────────────────────────────────────────────┘
│ HERO (grid 2 col, px-margin-desktop, pt-24 pb-32)                     │
│ ┌─────────────────────┐  ┌──────────────────────────────────────┐   │
│ │ H1 display-lg       │  │  Imagen (rounded-2xl, shadow-hover,   │   │
│ │  "¿Otra tarea que   │  │   bg-surface-container)               │   │
│ │   no te deja dormir?│  │   + blob bg-secondary-container blur   │   │
│ │   Déjala aquí."     │  │                                        │   │
│ │ P body-lg variant:  │  │                                        │   │
│ │  "Trabajos... $3"   │  │                                        │   │
│ │ [Empezar Ahora      │  │                                        │   │
│ │   bg-secondary]     │  │                                        │   │
│ │ [Ver Ejemplos       │  │                                        │   │
│ │   ghost border]     │  │                                        │   │
│ └─────────────────────┘  └──────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
│ SECCIONES (mobile-first, single col)                                 │
│  1. Cómo funciona — 3 pasos (íconos Material Symbols)                │
│  2. Precios base — lista servicios + link /servicios                 │
│  3. Footer (bg-primary text-on-primary): año, WhatsApp, "Hecho VEN" │
└──────────────────────────────────────────────────────────────────────┘
```

## Tokens aplicados
- Nav/texto marca: `text-primary`. CTA principal: `bg-secondary text-on-secondary`.
- Hero H1: `font-display-lg text-primary`. Body: `text-on-surface-variant`.
- Cards/precios: `bg-surface-container-lowest rounded-xl shadow-ambient`.
- Footer: `bg-primary text-on-primary`.

## Adaptación al manual
- Hero: frase exacta del manual §8.1 ("¿Otra tarea que no te deja dormir? Déjala aquí.").
- Indicadores: "⏱️ Entrega 24-48h · 💬 WhatsApp · 🔒 Pago 50%".
- Idioma: español.
