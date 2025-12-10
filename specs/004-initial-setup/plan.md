# Implementation Plan: First Setup

**Branch**: `004-initial-setup` | **Date**: 2025-12-10 | **Spec**: [specs/004-initial-setup/spec.md](specs/004-initial-setup/spec.md)
**Input**: Feature specification from `specs/004-initial-setup/spec.md`

## Summary

Implement a "First Setup" wizard that intercepts all requests on a fresh installation. This wizard will allow the System Owner to create the initial Super Admin account and configure basic system settings (Site Name). This ensures the system is secure and personalized from the start.

## Technical Context

**Language/Version**: TypeScript 5.9, Node.js (v22+ implied)
**Primary Dependencies**: SvelteKit 2.x, Better-Auth 1.4, TailwindCSS 4
**Storage**: PostgreSQL (via Prisma 6.x)
**Testing**: Playwright (E2E), Vitest (Unit - implied)
**Target Platform**: Web (Containerized via Aspire)
**Project Type**: Web Application (SvelteKit)
**Performance Goals**: Setup is a one-time event; performance is not critical, but reliability is.
**Constraints**: Must be secure; race conditions during setup must be handled.
**Scale/Scope**: Single screen wizard, minimal data volume.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Library-First**: N/A (Feature is app-specific logic).
- **CLI Interface**: N/A (UI-driven feature).
- **Test-First**: Mandatory. E2E tests for the setup flow are critical.
- **Integration Testing**: Essential for database and auth interactions.
- **Observability**: Standard logging for setup events.

**Status**: PASSED

## Project Structure

### Documentation (this feature)

```text
specs/004-initial-setup/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/DrillSkill.Web/
├── prisma/
│   └── schema.prisma    # Update: Add SystemConfig model
├── src/
│   ├── hooks.server.ts  # Update: Add redirect logic for setup
│   ├── lib/
│   │   ├── server/
│   │   │   └── setup.ts # New: Setup service logic
│   │   └── state/       # New: Global state/config cache
│   └── routes/
│       └── setup/       # New: Setup Wizard UI
│           ├── +page.svelte
│           └── +page.server.ts
```

**Structure Decision**: Standard SvelteKit route structure. Logic encapsulated in `lib/server/setup.ts`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | | |
