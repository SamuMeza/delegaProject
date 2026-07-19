# Mockup — Contacto (`/contacto`)

**Manual:** §8.4 · **Tokens:** `docs/design-tokens.md` · (Sin PNG dedicado; inferido de §8.4)

## Layout

```
NAV (igual que inicio)
┌────────────────────────────────────────────────────────┐
│ HEADER: H1 "Contacto"  P body-lg variant               │
├──────────────────┬─────────────────────────────────────┤
│ INFO DIRECTA     │ DATOS PAGO MÓVIL (card)             │
│  WhatsApp (link) │  Banco: [valor]                     │
│  "Resp < 2h"     │  Teléfono asociado: [valor]         │
│                  │  Cédula: [valor]                    │
│                  │  Nota: "Usa el ID de orden como     │
│                  │   referencia de pago"               │
├──────────────────┴─────────────────────────────────────┤
│ FAQ (acordeón)                                           │
│  • Antelación mínima 48h                                 │
│  • Urgencias y cambios de fecha                         │
│  • Suscripciones trimestrales                           │
│  • Política de pagos (50% / 50%)                        │
│  • Si no te gusta el trabajo                            │
│  • Materias disponibles                                 │
│  • Seguridad y confidencialidad                         │
│  • Disclaimer uso responsable                           │
└────────────────────────────────────────────────────────┘
FOOTER (bg-primary)
```

## Tokens
- Cards: `bg-surface-container-lowest rounded-xl shadow-ambient`.
- Link WhatsApp: verde marca `#25D366`.
- FAQ: items `border-b border-border-subtle`, labels `label-caps`.
