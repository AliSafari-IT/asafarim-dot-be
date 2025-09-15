# ASafariM Monorepo

Overview
This repository hosts multiple frontend applications, backend APIs, and shared packages used across the ASafariM ecosystem. It is organized as a polyrepo-style monorepo for easier development, shared components, and consistent tooling.

Repository Structure
The workspace includes the following folders (see asafarim-dot-be.code-workspace):

- Apps
  - apps/ai-ui
  - apps/blog
  - apps/core-app
  - apps/jobs-ui
  - apps/identity-portal
  - apps/web
- APIs
  - apis/Ai.Api
  - apis/Core.Api
  - apis/Identity.Api
- Packages
  - packages/shared-ui-react
  - packages/shared-tokens

Apps

- ai-ui
  - Description: AI-related UI application (React-based).
  - Tech: React 19.x and modern toolchain (e.g., Vite/Next.js; see the app’s package.json).
  - Dev: npm install && npm run dev (from apps/ai-ui).
  - Notes: Ensure React versions are consistent across the monorepo.

- blog
  - Description: ASafariM blog.
  - Tech: Docusaurus with TypeScript.
  - Important: Configuration files should use TypeScript extensions (.ts), e.g., docusaurus.config.ts and sidebars.ts.
  - Dev: npm install && npm run start (from apps/blog).
  - Initial setup command used: npx create-docusaurus@latest asafarim-blog classic --typescript.
  - Docs/Content: Use /docs, /blog, and /static per Docusaurus conventions.

- core-app
  - Description: Core web application for end-user experiences.
  - Tech: React 19.x.
  - Dev: npm install && npm run dev (from apps/core-app).
  - Shared UI: Integrates shared-ui-react for common UI primitives and notifications.

- jobs-ui
  - Description: Job listings and management UI.
  - Tech: Web framework as configured (React/Angular depending on package.json; prior work integrated React components and web components).
  - Dev: npm install && npm run dev (from apps/jobs-ui).
  - Integration Note: If consuming React components or web components, ensure a single React instance is used and types are properly configured (see Shared Packages section).

- identity-portal
  - Description: Identity and access management portal.
  - Tech: As configured in the app (Angular/React depending on package.json).
  - Dev: npm install && npm run dev (from apps/identity-portal).
  - Integration Note: If embedding React components, make sure all apps resolve to the same React version and that any web components are properly encapsulated.

- web
  - Description: Public-facing website shell or landing experience.
  - Tech: As configured (often React or static site tooling).
  - Dev: npm install && npm run dev (from apps/web).

APIs

- Ai.Api
  - Description: Backend API for AI-related endpoints.
  - Tech: .NET (typical).
  - Dev (from apis/Ai.Api):
    - dotnet restore
    - dotnet build
    - dotnet run

- Core.Api
  - Description: Backend API for core domain services.
  - Tech: .NET (typical).
  - Dev (from apis/Core.Api):
    - dotnet restore
    - dotnet build
    - dotnet run

- Identity.Api
  - Description: Backend API for identity, authentication, and authorization.
  - Tech: .NET (typical).
  - Dev (from apis/Identity.Api):
    - dotnet restore
    - dotnet build
    - dotnet run

Shared Packages

- shared-ui-react
  - Purpose: Shared React UI components and utilities for consistent UX across apps.
  - Key Features:
    - Notification system with NotificationProvider, NotificationContainer, and useNotifications hook for consistent app-wide notifications.
  - Versioning:
    - Peer dependency on React 19.1.1 to ensure consistency and avoid invalid hook calls.
    - All consumer apps must align to the same React version to prevent multiple React instances.
  - Usage:
    - Install peer dependencies in the consuming app.
    - Wrap your root component with the NotificationProvider and render the NotificationContainer near the app root.

- shared-tokens
  - Purpose: Centralized design tokens (colors, spacing, typography, etc.) for consistent theming and style across apps.
  - Usage:
    - Import tokens in component styles or theme definitions within each app.

Prerequisites

- Node.js (LTS recommended)
- npm, pnpm, or yarn (use the same package manager consistently across the repo)
- .NET SDK (for APIs)

Getting Started

- Clone the repo
  - git clone [asafarim-dot-be](https://github.com/AliSafari-IT/asafarim-dot-be.git)
  - Open in your editor using the workspace file [asafarim-dot-be.code-workspace](https://github.com/AliSafari-IT/asafarim-dot-be/blob/main/readme.md)

- Install dependencies
  - Per app (example):
    - cd apps/ai-ui
    - npm install
  - Repeat for each frontend app you plan to work on.
  - For shared packages, run install at consumer app level; if using a workspace manager (e.g., npm workspaces/pnpm), follow the root setup if available in package.json.

- Run a frontend app
  - From the app directory, run:
    - npm run dev
  - Or the framework-specific command specified in that app’s package.json (e.g., npm run start for Docusaurus in apps/blog).

- Run an API
  - From the API directory, run:
    - dotnet restore
    - dotnet build
    - dotnet run
  - APIs typically expose Swagger UI in development; check console output for the local URL.

- Running multiple services
  - Use separate terminals for each app/API.
  - Ensure ports do not conflict; adjust your app configuration or .env files if needed.

Conventions and Best Practices

- React Version Consistency
  - Ensure all React-based apps and shared packages resolve to the same React version (19.1.1 recommended in shared-ui-react).
  - Mismatched React versions can cause “Invalid hook call” errors.

- Type Declarations for Integrations
  - If a non-React app consumes React-based web components, ensure TypeScript declarations are available.
  - Include minimal ambient declarations where necessary and configure tsconfig include paths for types.

- Web Components and Shadow DOM
  - When embedding React UI via web components, prefer shadow DOM for style encapsulation.
  - Use property binding rather than attribute binding when interacting with components across frameworks.

- Docusaurus (Blog)
  - Keep configuration files in TypeScript: docusaurus.config.ts and sidebars.ts.
  - Follow Docusaurus project structure for docs/blog/static assets.

- Notifications
  - Prefer the shared notification system from shared-ui-react to ensure consistency across apps.

Environment Configuration

- Use .env files (not committed) per app/API for environment-specific settings (e.g., API base URLs, keys).
- For .NET APIs, use appsettings.json and appsettings.Development.json.
- Document required variables in each app/API README if they exist.

Scripts and Tooling

- Each application may have its own scripts in package.json, such as:
  - dev, build, start, test, lint, format
- APIs use standard .NET CLI commands for build/run/test.
- If a root-level task runner (e.g., Nx/Turborepo) is added, document commands here.

Testing

- Frontend apps: use the configured test runner (e.g., Vitest/Jest/React Testing Library).
- APIs: use dotnet test.
- Add CI integration to run tests and lint checks on pull requests.

Contribution Guidelines

- Branching: feature/<name>, fix/<name>, chore/<name>
- Commits: meaningful messages; consider Conventional Commits if desired.
- Code Style: run lint and format before committing.
- Pull Requests: include screenshots or short clips for UI changes; link to issues.

Troubleshooting

- Invalid hook call (React)
  - Verify a single React instance and matching versions across apps and shared-ui-react (19.1.1).
  - Ensure node_modules are hoisted or de-duplicated appropriately by your package manager.

- TypeScript errors with React 19.x
  - If @types are incomplete for latest React, consider minimal ambient declarations or upgrade TS settings per app.
  - Ensure tsconfig includes declaration paths.

- Web component styling or props not applied
  - Use shadow DOM-aware styles.
  - Bind properties (not attributes) for complex data in Angular/other frameworks.

License

- MIT License

Acknowledgements

- Built with React, Docusaurus, and .NET Core.
- Shared UI and tokens enable consistency across the ecosystem.
