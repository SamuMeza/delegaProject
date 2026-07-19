# Requirements Quality Checklist: App Foundation (Fundación de la App)

**Purpose**: Unit-test the requirements writing for the App Foundation feature (PRIORIDAD 1) — validate completeness, clarity, consistency, measurability, and scenario coverage of the written spec/plan before implementation.
**Created**: 2026-07-19
**Feature**: [spec.md](../spec.md)
**Focus**: Completeness, Clarity, Coverage (incl. auth/persistence edge cases), Non-Functional (security, deploy)
**Depth**: Standard
**Audience**: Reviewer (PR) — used to gate the spec/plan before `/speckit.tasks`

## Requirement Completeness

- [X] CHK001 - Are all five foundation tasks (1.1–1.5) represented as explicit functional requirements? [Completeness, Spec §FR-1..FR-5]
- [X] CHK002 - Are the exact data stores and their indices specified (operators, config) or flagged as a gap? [Completeness, Spec §FR-2 / data-model.md]
- [X] CHK003 - Are the Operator entity fields (username, passwordHash, displayName, role) fully defined in requirements? [Completeness, Spec §Key Entities / data-model.md]
- [X] CHK004 - Are the Config entity fields (sessionTimeoutHours, counters, priceRanges) fully defined? [Completeness, Gap, data-model.md]
- [X] CHK005 - Are the login form inputs (username, password) explicitly required in the auth contract? [Completeness, contracts/auth-and-routes.md §C1]
- [X] CHK006 - Is the panel navigation structure (sidebar sections) enumerated or marked as placeholder-only? [Completeness, Spec §FR-5 / contracts §C2]

## Requirement Clarity

- [X] CHK007 - Is the credential validation mechanism (SHA-256 hash comparison, no server secret) stated unambiguously? [Clarity, Spec §Clarifications / research.md §R2]
- [X] CHK008 - Is "session expiration" quantified via `sessionTimeoutHours` rather than a vague duration? [Clarity, Spec §FR-4 / data-model.md]
- [X] CHK009 - Is "build successful / reproducible" defined with an objective exit criterion? [Clarity, Spec §FR-1 / contracts §C4]
- [X] CHK010 - Is the first-run seeding behavior (auto-populate if empty) stated without ambiguity? [Clarity, Spec §Clarifications / FR-2]
- [X] CHK011 - Are the two operators' credentials sourced from owner-defined values (not hardcoded magic)? [Clarity, Assumptions, research.md §R4]

## Requirement Consistency

- [X] CHK012 - Do the auth requirements (FR-4) align with the Session model (expiresAt, loginAt) in data-model.md? [Consistency, Spec §FR-4 / data-model.md]
- [X] CHK013 - Does the seeding requirement (FR-2) agree with the Operator/Config counts in data-model.md (2 operators, 1 config)? [Consistency, Spec §FR-2 / data-model.md]
- [X] CHK014 - Are route-protection rules consistent between Spec §FR-5 and contracts §C2 (only /admin/login public)? [Consistency, Spec §FR-5 / contracts §C2]
- [X] CHK015 - Is the "no plaintext password" rule consistent across Spec §FR-4, data-model.md, and contracts §C1? [Consistency]

## Acceptance Criteria Quality

- [X] CHK016 - Is SC-2 (100% retention after reload) measurable and testable from requirements? [Measurability, Spec §SC-2]
- [X] CHK017 - Is SC-4 (100% of panel routes protected) objectively verifiable? [Measurability, Spec §SC-4]
- [X] CHK018 - Is SC-5 (100% rejection of invalid credentials) stated as a pass/fail criterion? [Measurability, Spec §SC-5]
- [X] CHK019 - Can SC-1 (<5s load) be verified without implementation detail? [Measurability, Spec §SC-1]
- [X] CHK020 - Does each FR have a concrete acceptance bullet (no vague phrasing)? [Acceptance Criteria, Spec §FR-1..FR-5]

## Scenario Coverage

- [X] CHK021 - Are primary flows covered: deploy, persist, login, use panel, logout? [Coverage, Spec §User Scenarios]
- [X] CHK022 - Are exception flows defined: invalid credentials rejected with clear message? [Coverage, Exception, contracts §C1]
- [X] CHK023 - Are recovery flows defined: expired session clears and redirects to login? [Coverage, Recovery, Spec §FR-4 / contracts §C2]
- [X] CHK024 - Is the first-run (empty store) scenario explicitly required via seeding? [Coverage, Alternate, Spec §FR-2]
- [X] CHK025 - Are requirements defined for the no-session access attempt to /admin/*? [Coverage, Exception, contracts §C2]

## Edge Case Coverage

- [X] CHK026 - Is behavior defined when localStorage session exists but is corrupted/expired? [Edge Case, Gap, data-model.md Session]
- [X] CHK027 - Is behavior defined if seeding finds partial data (config present, operators missing)? [Edge Case, Gap, data-model.md Seeding]
- [X] CHK028 - Are requirements defined for concurrent/repeat logins on the same device? [Edge Case, Gap]
- [X] CHK029 - Is the empty/placeholder content state of panel sections addressed? [Edge Case, Spec §FR-5]

## Non-Functional Requirements

- [X] CHK030 - Are security requirements (hashes not plaintext, no server secret) explicitly stated? [Non-Functional/Security, Spec §FR-4 / Assumptions]
- [X] CHK031 - Is the no-backend / local-only constraint reflected as a requireable NFR? [Non-Functional, Constitution I, Spec §Assumptions]
- [X] CHK032 - Are deploy requirements (static host, SPA rewrite, auto-deploy) specified? [Non-Functional, Spec §FR-1 / contracts §C4]
- [X] CHK033 - Is offline-capability-by-design stated as a requirement or assumption? [Non-Functional, Constitution I, Spec §Assumptions]
- [X] CHK034 - Are accessibility requirements (labels, focus, contrast) defined for login and panel UI? [Non-Functional/Accessibility, Gap, AGENTS.md]

## Dependencies & Assumptions

- [X] CHK035 - Is the dependency on a static host (Vercel) and repo connection documented? [Dependency, Spec §Dependencies / Assumptions]
- [X] CHK036 - Are the two operators' credential hashes listed as a required input (Dependency)? [Dependency, Spec §Dependencies]
- [X] CHK037 - Is the assumption "hashes exposed to client acceptable for 2-person panel" validated against the constitution? [Assumption, Spec §Assumptions / Constitution II]
- [X] CHK038 - Is cross-device sync explicitly excluded (out of scope) to avoid ambiguity? [Assumption/Scope, Spec §Assumptions]

## Ambiguities & Conflicts

- [X] CHK039 - Is the term "valores iniciales definidos por los dueños" precise enough to avoid implementation guesswork? [Ambiguity, Spec §FR-2 / Clarifications]
- [X] CHK040 - Is there any conflict between "static, no backend" and the need to validate credentials (resolved via client hashing)? [Conflict, research.md §R2]
- [X] CHK041 - Is a requirement/acceptance-criteria ID scheme established for traceability? [Traceability, Spec structure]
