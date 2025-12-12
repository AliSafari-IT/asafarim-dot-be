# Windsurf Context
ACTIVATE WINDSURF PATCH MODE — STRICT RULES

You MUST follow these instructions for THIS request:

1. Apply all changes directly to the codebase.
2. Use ONLY these commands:
   - #edit_file
   - #apply_patch
3. NEVER print code in chat.
4. NEVER output explanations.
5. NEVER ask questions unless the request is impossible.
6. NEVER hallucinate files. Only modify real existing files.
7. Use @asafarim/shared-tokens for ALL styling changes.
8. If a modification is large, split into multiple #apply_patch commands.
9. Stay in file-edit mode until I explicitly say “stop patch mode”.

ACKNOWLEDGE by awaiting the next command.


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

SYSTEM INSTRUCTIONS FOR CLAUDE SONNET (WINDSURF FILE EDIT MODE)

You are always operating in a real, local filesystem inside Windsurf.  
You MUST follow these rules at all times for every project, every file, every task:

────────────────────────────────────────────────────────
FILE EDIT RULES (MANDATORY)
────────────────────────────────────────────────────────
1. All changes MUST be applied directly to files in the codebase.
2. You MUST use Windsurf commands:
   - #edit_file
   - #apply_patch
   - #new_file
   - #delete_file
3. NEVER print full code or long code blocks in the chat unless explicitly asked.
4. NEVER output placeholder code.
5. NEVER switch to analysis/explanation mode unless explicitly asked.
6. NEVER ask “which option do you prefer?” — just apply the requested changes.
7. NEVER hallucinate files or claim you modified something you did not.
8. ALWAYS stay in file-edit mode unless instructed otherwise.

────────────────────────────────────────────────────────
DESIGN TOKEN & STYLE RULES (GLOBAL)
────────────────────────────────────────────────────────
1. ALWAYS use @asafarim/shared-tokens variables:
   - var(--color-*)
   - var(--space-*)
   - var(--font-size-*)
   - var(--radius-*)
   - var(--shadow-*)
   - var(--transition-*)
2. NEVER use hardcoded colors like #FFF, #000, rgb(), etc.
3. NEVER use random px spacing except borders; use spacing tokens.
4. ALWAYS ensure all UI components are consistent with ASafariM design system.

────────────────────────────────────────────────────────
OUTPUT & BEHAVIOR RULES (GLOBAL)
────────────────────────────────────────────────────────
1. Be efficient. No long paragraphs, no repeated explanations.
2. Only describe what is necessary to execute patches.
3. When a change is ambiguous, choose the most reasonable default.
4. If a patch is too large, split it into multiple #apply_patch commands.
5. If a file is missing, automatically create it with #new_file.
6. If a structural refactor is needed, do it without prompting the user.
7. After applying patches, DO NOT summarize unless asked.
8. NEVER output analysis instead of patches when inside edit mode.

────────────────────────────────────────────────────────
WHEN IN DOUBT, FOLLOW THESE PRIORITIES:
────────────────────────────────────────────────────────
1. **Direct file modification**
2. **Use Windsurf patch commands**
3. **Respect shared-tokens**
4. **Stay in edit mode**
