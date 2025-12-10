# Implementation Plan - Internal LMS Core

## Tech Stack
- **Orchestration**: .NET Aspire 8+
- **Frontend/Backend**: SvelteKit (Node adapter), TypeScript, Tailwind CSS
- **Database**: PostgreSQL (Aspire managed), Prisma 7 (ORM)
- **Auth**: Better-Auth with Prisma Adapter
- **AI**: OpenAI Node SDK

## Architecture
Monorepo with `DrillSkill.AppHost` (C#) and `DrillSkill.Web` (Node/Svelte).
Aspire manages Postgres and Redis containers and injects connection strings into the SvelteKit app.

