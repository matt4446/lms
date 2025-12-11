# Research: First Setup

**Feature**: First Setup
**Status**: Complete

## Decisions

### 1. Admin User Creation
- **Decision**: Use `better-auth`'s `signUpEmail` API to create the user, then immediately update the `role` to `admin` via Prisma.
- **Rationale**: `better-auth` handles password hashing and session creation securely. Direct DB insertion would bypass these. Elevating privileges via Prisma is safe because we ensure this only runs when no users exist.
- **Alternatives**:
    - *Direct DB Insert*: Risky, need to replicate hashing logic.
    - *Better-Auth Admin Plugin*: Overkill for just the initial setup, and might require an existing admin to invoke.

### 2. Global Redirects
- **Decision**: Implement a global interceptor in `hooks.server.ts`.
- **Rationale**: Centralized place to protect the entire application.
- **Implementation Details**:
    - Check `isAppConfigured()` (cached in memory).
    - Whitelist `/setup`, `/api/auth`, and static assets.
    - Redirect unconfigured apps to `/setup`.
    - Redirect configured apps away from `/setup`.

### 3. System Configuration Storage
- **Decision**: Add a `SystemConfig` model to Prisma.
- **Rationale**: Keeps configuration with the data. Type-safe.
- **Schema**:
    ```prisma
    model SystemConfig {
      id        String   @id @default("default") // Singleton
      siteName  String   @default("DrillSkill")
      isSetup   Boolean  @default(false)
      updatedAt DateTime @updatedAt
    }
    ```

## Unknowns Resolved

- **How to detect setup?**: Check `SystemConfig.isSetup` (or existence of `SystemConfig` row).
- **How to create admin?**: `auth.api.signUpEmail` + Prisma update.
