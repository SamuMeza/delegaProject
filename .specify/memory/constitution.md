<!--
## Sync Impact Report

- Version change: 1.1.0 → 2.0.0
- Modified principles:
  - I. No-Backend, Local-First Persistence → Supabase-Backed Persistence (redefined)
- Added sections: none
- Removed sections: none
- Templates requiring updates:
  - ✅ .specify/templates/constitution-template.md (source of this fill)
  - ⚠ .specify/templates/plan-template.md — Constitution Check gate should
    reference Delega principles (follow-up deferred)
  - ✅ .specify/templates/spec-template.md (aligned)
  - ✅ .specify/templates/tasks-template.md (aligned)
- Follow-up TODOs:
  - TODO(RATIFICATION_DATE): set to first real adoption date once known;
    currently equals creation date.
  - Plan template Constitution Check still uses generic gate text; tailor to
    these principles.
-->

# Delega Constitution

## Core Principles

### I. Supabase-Backed Persistence (NON-NEGOTIABLE)

All application data MUST be persisted in Supabase PostgreSQL. The frontend is a
React SPA that communicates with Supabase via the official `@supabase/supabase-js`
client library. IndexedDB is no longer used. Deployment uses a static host (Vercel)
serving the React build, with Supabase as the serverless backend. Any feature
requiring a custom server or external database OTHER than Supabase MUST be rejected
unless the constitution is amended first. The Supabase project is the single source
of truth for all data; Zustand MAY be used as an in-memory cache in the client
but MUST NOT be treated as persistent storage.

### II. WhatsApp-First Intake & Human Coordination

The product MUST treat WhatsApp as the primary channel for student intake and
operator communication. A student request entering via the landing page MUST be
captured and surfaced to operators through the internal panel, not lost. The two
operators MUST have mutually visible state so work is never duplicated or
silently dropped. The system is a coordination tool for a two-person human
service, not a marketplace or freelancer platform.

### III. Structured Order Tracking (NON-NEGOTIABLE)

Every request MUST be represented as a tracked order with an explicit lifecycle
state (e.g., received, awaiting payment, in progress, preview sent, delivered,
changes requested). The panel MUST let operators move an order between states and
see, at a glance, who owes what to whom and what is overdue. Ambiguous "caos de
WhatsApp" states MUST be modeled as first-class, enumerated order statuses.

### IV. Venezuela-Native Pricing & Pago Móvil (NON-NEGOTIABLE)

Pricing MUST be denominated in Venezuelan bolívares (or USD equivalent as the
operators choose) using friendly per-task ranges ($3–$15) and cheap-feeling
quarterly subscriptions (e.g., $25 per three months). Payment collection MUST be
tracked against Pago Móvil as the settlement method. The system MUST record
payment state per order (unpaid, paid, partial) and MUST NOT assume lump-sum or
foreign payment rails.

### V. Simplicity, Reuse & Productized Workflow

The system MUST favor small, reusable templates and repeatable workflows over
bespoke handling. Operators MUST be able to reuse prior deliverables and track
"time taken per task type" so the business stays productized. YAGNI applies:
features that do not directly reduce chaos, coordinate the two operators, or
speed up delivery MUST NOT be built. Complexity MUST be justified in the plan.

## Tech & Persistence Constraints

- **Stack**: React (single-page web app), Supabase (PostgreSQL, auth, real-time),
  static hosting on Vercel. No custom backend server.
- **Supabase as single source of truth**: All data lives in Supabase tables.
  The client reads/writes directly via `@supabase/supabase-js`. No other
  persistence layer (IndexedDB, localStorage for data, etc.) is permitted for
  application data.
- **In-memory caching**: Zustand MAY cache Supabase data in memory for
  performance, but MUST NOT be treated as durable storage. On page reload,
  data MUST be re-fetched from Supabase.
- **No fixed costs**: Hosting and tooling MUST stay on free tiers (Vercel free,
  Supabase free tier).

## Operating Model

- Two operators, two service types, one shared revenue flow.
- Visibility is mutual: both operators see all orders and payment states.
- The landing page is the public face; the admin panel is private and for the
  two operators only. Access control is the operators' responsibility (no
  external users log in to the panel).

## Governance

This constitution supersedes all ad-hoc practices. Any PR or feature work MUST
verify compliance with the five Core Principles before completion; violations
MUST be documented in the plan's Complexity Tracking section with justification.

Amendments MUST follow this procedure:
1. Propose the change in writing, citing which principle or constraint is
   affected and the rationale.
2. Obtain agreement from both operators (the two owners of the business).
3. Update this file, increment the version per semantic versioning, set
   `Last Amended` to the amendment date, and record a Sync Impact Report.

Versioning policy: MAJOR for removing/redefining principles; MINOR for adding a
principle or materially expanding guidance; PATCH for clarifications and wording
fixes. La versión se incrementa solo cuando se enmienda este documento; los
cambios de features del producto NO alteran la versión de la constitución.
Compliance is reviewed by the operators at each amendment and on any
change that touches persistence, pricing, or the order lifecycle.

**Version**: 2.0.0 | **Ratified**: 2026-07-19 (fecha de adopción) | **Last Amended**: 2026-08-06 (migración de IndexedDB a Supabase)
