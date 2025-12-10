# DrillSkill LMS

DrillSkill is an internal Learning Management System (LMS) built with .NET Aspire and SvelteKit.

## Prerequisites

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (for Postgres and Redis)

## Getting Started

1.  **Clone the repository**

    ```bash
    git clone <repository-url>
    cd DrillSkill
    ```

2.  **Install dependencies**

    ```bash
    cd src/DrillSkill.Web
    npm install
    cd ../..
    ```

3.  **Run the application**

    You can run the application using Visual Studio or the .NET CLI.

    **Using .NET CLI:**

    ```bash
    dotnet run --project src/DrillSkill.AppHost
    ```

    This will start the Aspire dashboard, which orchestrates the following resources:
    -   **Postgres**: Database for application data.
    -   **Redis**: Cache and session store.
    -   **DrillSkill.Web**: The SvelteKit frontend and API.

4.  **Access the application**

    -   **Aspire Dashboard**: Check the console output for the URL (usually `https://localhost:17188`).
    -   **Web App**: Click the endpoint link in the Aspire Dashboard (usually `https://localhost:5173`).

## Project Structure

-   `src/DrillSkill.AppHost`: .NET Aspire orchestration project.
-   `src/DrillSkill.ServiceDefaults`: Shared service defaults for .NET projects.
-   `src/DrillSkill.Web`: SvelteKit application (Frontend & Backend).
    -   `src/routes`: Application routes and API endpoints.
    -   `src/lib/server`: Server-side logic (Auth, DB, AI).
    -   `prisma`: Database schema and migrations.

## Features

-   **User Authentication**: Registration and Login.
-   **Course Management**: Create courses with AI assistance.
-   **Learning Experience**: Structured content with prerequisite gating.
-   **Assessments**: Exams and grading.
-   **Results Dashboard**: Track student progress.

## Configuration

-   **AI Generation**: To enable AI course generation, set `PUBLIC_ENABLE_AI=true` in `src/DrillSkill.Web/.env` and provide an `OPENAI_API_KEY`.
