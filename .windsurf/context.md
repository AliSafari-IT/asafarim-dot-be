# Windsurf Context

## Project Overview

- ASafariM is a monorepo containing multiple frontend apps and backend APIs
- The project uses a shared authentication system across all apps
- Frontend apps use React with TypeScript
- Backend APIs use .NET Core
- Use pnpm for package and workspace management

## Authentication System

- Central login system is implemented in `shared-ui-react` with a `useAuth` hook
- Authentication is cookie-based with domain `.asafarim.local` (dev) or `.asafarim.be` (prod)
- Identity server runs at `identity.asafarim.local:5177` (dev) or `identity.asafarim.be` (prod)
- Identity API runs at `api.asafarim.local:5101` (dev) or via `/api/identity` (prod)
- All apps should use the shared `useAuth` hook from `shared-ui-react` for consistent auth state

## Development Environment

- Local domains use `.asafarim.local` suffix (e.g., `identity.asafarim.local`, `web.asafarim.local`)
- APIs run on localhost with specific ports (Identity: 5101, Core: 5102, AI: 5103)
- Frontend apps run on local domains with specific ports (Identity: 5177, Web: 5175, etc.)

## Production Environment

- Production domains use `.asafarim.be` suffix
- APIs are accessed via `/api/{service-name}` paths
- Frontend apps are deployed to their respective subdomains

## Code Standards

- Use TypeScript for all new code
- Follow existing patterns for hooks, contexts, and components
- Ensure consistent authentication state across components
- Use shared UI components from `shared-ui-react` package
- Avoid duplicating functionality that exists in shared packages

## Common Issues & Solutions

- Authentication state mismatch: Use shared `useAuth` hook consistently
- "Invalid hook call" errors: Ensure consistent React versions across packages
- CORS issues: Check API configuration and allowed origins
- Cookie issues: Verify domain settings match between frontend and API

## When Requesting Help

- Specify which app or API you're working with
- Include relevant error messages
- Mention if the issue occurs in development or production
- Describe what you've already tried
- Provide code snippets of relevant files when possible
