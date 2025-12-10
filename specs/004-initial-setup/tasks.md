# Tasks: First Setup

**Feature Branch**: `004-initial-setup`
**Spec**: [specs/004-initial-setup/spec.md](specs/004-initial-setup/spec.md)
**Plan**: [specs/004-initial-setup/plan.md](specs/004-initial-setup/plan.md)

## Phase 1: Setup
*Goal: Prepare the database schema for the new feature.*

- [x] T001 Update Prisma schema to include `SystemConfig` model and `User` role update in [src/DrillSkill.Web/prisma/schema.prisma](src/DrillSkill.Web/prisma/schema.prisma)
- [x] T002 Run database migration to apply schema changes (Run `npx prisma migrate dev --name init_setup` in `src/DrillSkill.Web`)

## Phase 2: Foundational
*Goal: Implement the core blocking logic that intercepts requests and enforces setup.*

- [x] T003 Implement `isAppConfigured` helper with in-memory caching in [src/DrillSkill.Web/src/lib/server/state.ts](src/DrillSkill.Web/src/lib/server/state.ts)
- [x] T004 Implement global request interception and redirection logic in [src/DrillSkill.Web/src/hooks.server.ts](src/DrillSkill.Web/src/hooks.server.ts)

## Phase 3: User Story 1 & 2 - Setup Wizard
*Goal: Allow the user to create the admin account and configure the site name.*
*Independent Test*: Run the E2E test `tests/e2e/setup.test.ts` which simulates a fresh install and verifies the wizard flow.

- [x] T005 [P] [US1] Create E2E test file for setup scenarios in [src/DrillSkill.Web/tests/e2e/setup.test.ts](src/DrillSkill.Web/tests/e2e/setup.test.ts)
- [x] T006 [US1] Implement backend service to handle admin creation and config saving in [src/DrillSkill.Web/src/lib/server/setup.ts](src/DrillSkill.Web/src/lib/server/setup.ts)
- [x] T007 [US1] Implement form action handler in [src/DrillSkill.Web/src/routes/setup/+page.server.ts](src/DrillSkill.Web/src/routes/setup/+page.server.ts)
- [x] T008 [US1] Create Setup Wizard UI component with form fields in [src/DrillSkill.Web/src/routes/setup/+page.svelte](src/DrillSkill.Web/src/routes/setup/+page.svelte)
- [x] T009 [US2] Update root layout server load to fetch Site Name in [src/DrillSkill.Web/src/routes/+layout.server.ts](src/DrillSkill.Web/src/routes/+layout.server.ts)
- [x] T010 [US2] Update root layout UI to display Site Name in [src/DrillSkill.Web/src/routes/+layout.svelte](src/DrillSkill.Web/src/routes/+layout.svelte)

## Phase 4: Polish
*Goal: Ensure a smooth user experience and proper error handling.*

- [x] T011 Ensure proper error messages are displayed in Setup Wizard in [src/DrillSkill.Web/src/routes/setup/+page.svelte](src/DrillSkill.Web/src/routes/setup/+page.svelte)

## Dependencies

1. **T001, T002** (Schema) must be done before **T003** (State) and **T006** (Service).
2. **T003** (State) must be done before **T004** (Hooks).
3. **T004** (Hooks) is required to see the wizard in the browser, but **T005** (Tests) can be written in parallel.
4. **T006** (Service) is required for **T007** (Form Action).
5. **T007** (Form Action) and **T008** (UI) can be developed in parallel but need integration.

## Parallel Execution Examples

- **Developer A**: Works on **T005** (E2E Tests) and **T008** (UI Component).
- **Developer B**: Works on **T001/T002** (Schema), **T003** (State), and **T006** (Service Logic).

## Implementation Strategy

1. **Database First**: Get the schema right so we can generate the client.
2. **Gatekeeper**: Implement the `hooks.server.ts` logic to ensure the app is locked down until setup is complete.
3. **Wizard Logic**: Build the backend service to handle the complex "create user + elevate role + save config" transaction.
4. **UI**: Build the form and connect it to the backend.
5. **Integration**: Verify the flow with E2E tests.
