# Quickstart: Landing + Formulario (Fuente de Clientes)

**Branch**: `003-fuente-clientes`
**Date**: 2026-07-22

---

## Prerequisites

1. **Bun** installed (v1.x+): https://bun.sh
2. **Node.js** (for build tools only): v18+
3. Clone the repository
4. Install dependencies: `bun install`

## Setup Commands

```bash
# Install all dependencies
bun install

# Start development server with HMR
bun dev

# Build static site for production
bun run build.ts
```

The development server runs on the local Bun runtime with HMR over `src/frontend.tsx`. The production build outputs to `dist/` for deployment to Vercel (or any static host).

## Configuration

### Environment Variables

All environment variables use the `BUN_PUBLIC_*` prefix (they must be accessible in the browser for WhatsApp number, tracking salt, and login hashes).

| Variable | Description | Example |
|----------|-------------|---------|
| `BUN_PUBLIC_WHATSAPP_NUMBER` | Business WhatsApp number in international format | `584121234567` |
| `BUN_PUBLIC_TRACKING_SALT` | Secret salt for signing tracking tokens | `delega-secret-2026` |
| `BUN_PUBLIC_OPERATOR_1_PASS_HASH` | SHA-256 hash of operator 1 password | `sha256:...` |
| `BUN_PUBLIC_OPERATOR_2_PASS_HASH` | SHA-256 hash of operator 2 password | `sha256:...` |
| `BUN_PUBLIC_SESSION_TIMEOUT_HOURS` | Session expiration in hours | `8` |

### Local Development

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

## Running the Landing Pages Locally

1. `bun dev` starts the dev server
2. Open `http://localhost:3000` in your browser
3. Navigate the landing pages:
   - Home: `/`
   - Services: `/servicios`
   - Contact: `/contacto`
   - Form: `/delegar`
   - Tracking (test with a valid token): `/orden/TOKEN`
4. Admin panel (protected): `/admin` (requires operator login)

## Validating the Feature

### Manual Validation Steps

1. **Landing page loads**: Verify `/` renders Hero, how-it-works, and pricing sections
2. **Prices displayed**: Confirm pricing ranges match the `$3–$15` range and quarterly plans at ~$25
3. **Form interaction**: Navigate to `/delegar`, select a service type, verify conditional fields appear
4. **Pricing updates**: Modify form parameters and confirm the price estimator updates in real-time (<100ms)
5. **WhatsApp redirect**: Fill the form completely and click "Delegar por WhatsApp" — Chrome should open `wa.me/` with the pre-filled message
6. **Clipboard fallback**: If WhatsApp doesn't open, verify the "Copy message" button appears
7. **Tracking URL**: Open `/orden/TOKEN` with a valid token — verify the status is displayed without any network calls
8. **Tampering detection**: Manually modify the token in the URL — verify the integrity check detects tampering

### Test Command

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch
```

Note: `bun test` is the project test runner (configured via `bunfig.toml`). Tests use `@testing-library/react` with `happy-dom`.