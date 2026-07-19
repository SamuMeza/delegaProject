# Design Tokens — Delega

Paleta y sistema de diseño derivados de `DESIGN.md` (carpeta
`stitch_refined_markdown_publisher/academic_trust_efficiency`) y confirmados en
los `code.html` de referencia. La interfaz se adecúa al `manual_tecnico_delega.md`
(rutas, stores, estados de orden, precios Venezuela).

Sistema visual: **Corporate / Modern + Minimalismo**. Colores sobrios para
diferenciarse del aesthetic "startup" de alta saturación.

## Colores

| Token | Hex | Uso |
|---|---|---|
| `primary` | `#091426` | Marca, nav, headings (Deep Navy) |
| `on-primary` | `#ffffff` | Texto sobre primary |
| `primary-container` | `#1e293b` | Contenedores oscuros |
| `secondary` | `#43664d` | Acción/éxito (Sage Green) |
| `on-secondary` | `#ffffff` | Texto sobre secondary |
| `secondary-container` | `#c2e9c9` | Fondos de éxito/sugerencia |
| `tertiary` | `#1f1201` | Premium / aviso suave (Muted Gold) |
| `tertiary-container` | `#36260e` | Fondos premium |
| `error` | `#ba1a1a` | Errores |
| `urgency-alert` | `#ef4444` | Urgencia < 48h |
| `brand-operator-1` | `#3b82f6` | Operador 1 |
| `brand-operator-2` | `#10b981` | Operador 2 |
| `surface-studio` | `#f8fafc` | Fondo base |
| `surface` | `#f8f9ff` | Superficie |
| `surface-container-lowest` | `#ffffff` | Cards (pop del base) |
| `surface-container-low` | `#eff4ff` | Contenedores bajos |
| `surface-container` | `#e5eeff` | Contenedores |
| `surface-container-high` | `#dce9ff` | Contenedores altos |
| `surface-container-highest` | `#d3e4fe` | Contenedores más altos |
| `on-surface` | `#0b1c30` | Texto principal |
| `on-surface-variant` | `#45474c` | Texto secundario |
| `border-subtle` | `#e2e8f0` | Bordes sutiles |
| `outline` | `#75777d` | Outline/bordes fuertes |

## Tipografía

- **Display (headings):** Sora. `display-lg` 48px (32px mobile), `headline-md` 24px, `headline-sm` 20px.
- **Body/labels:** Inter. `body-lg` 18px, `body-md` 16px, `body-sm` 14px, `label-md` 14px/600, `label-caps` 12px/700.
- Regla: body nunca < 400; labels siempre 600/700.

## Forma y radios

- Botones/inputs/tags: 8px (`rounded-lg`).
- Cards/modales: 16px (`rounded-xl`/`rounded-2xl`).
- Hero/page containers: 24px (`rounded-3xl`).
- Base `--radius`: 0.75rem.

## Sombras (ambientales, tintadas navy)

- Resting: `0 4px 20px rgba(30,41,59,0.05)`
- Hover/Active: `0 10px 30px rgba(30,41,59,0.08)`

## Focus

- Ring 2px `secondary` (#43664d) con offset 2px (accesibilidad).

## Componentes clave

- **Botón Primary:** fondo `primary`, texto `on-primary`.
- **Botón Secondary:** fondo `secondary`, texto `on-secondary` (completar/siguiente paso).
- **Botón Ghost:** transparente, borde `border-subtle`, texto `primary` (cancelar/atrás).
- **Status Chip:**
  - Urgente (<48h): `bg-urgency-alert text-white`
  - En progreso: `bg-tertiary-container text-on-tertiary-container`
  - Completada: `bg-secondary-container text-on-secondary-container`
- **File Upload:** label "Max 10MB", estado success tras subir; watermark en previews.

## Espaciado

- Baseline 4px. Gutter 24px. Márgenes: mobile 16px, desktop 64px. Max-width 1280px.
- Grid: desktop 12 col, tablet 8 col, mobile 4 col (single-column en forms).
