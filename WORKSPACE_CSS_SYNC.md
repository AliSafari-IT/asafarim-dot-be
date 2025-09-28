# Workspace CSS Synchronization Guide

## Problem

When developing in a monorepo, changes to CSS in `@asafarim/shared-ui-react` are not automatically reflected in consuming apps like `@asafarim/ai-ui`, `@asafarim/core-app`, `@asafarim/web`, etc.

## Solutions

### Solution 1: Automatic CSS Synchronization (Recommended)

**All frontend apps now have proper workspace configuration:**

- ✅ `@asafarim/ai-ui` - Vite with workspace aliases
- ✅ `@asafarim/core-app` - Vite with workspace aliases  
- ✅ `@asafarim/web` - Vite with workspace aliases
- ✅ `@asafarim/identity-portal` - Vite with workspace aliases
- ✅ `@asafarim/blog` - Docusaurus with workspace dependencies
- ⚠️ `@asafarim/jobs-ui` - Angular app (different build system)

**What this provides:**

- Direct workspace aliases ensure no caching issues
- CSS changes automatically reflect across all apps
- No manual rebuilds needed during development
- Hot Module Replacement (HMR) works seamlessly

### Solution 2: Manual Workspace Rebuild

**When you make changes to shared-ui-react:**

```bash
# From root workspace
pnpm --filter @asafarim/shared-ui-react build

# Then restart the dev server for the app you're working on
pnpm dev:ai      # for ai-ui
pnpm dev:core    # for core-app
pnpm dev:web     # for web
pnpm dev:blog    # for blog
pnpm dev:identity-portal  # for identity-portal
```

### Solution 3: Use the Main Dev Script

**Start all apps with CSS synchronization:**

```bash
# From root workspace - starts all frontend apps
pnpm dev

# Or start specific app
pnpm dev:ai
pnpm dev:core
pnpm dev:web
pnpm dev:blog
pnpm dev:identity-portal
```

## Current Setup

**All apps import CSS via:**

```css
/* apps/*/src/index.css or similar */
@import url("@asafarim/shared-ui-react/index.css");
```

**Vite apps include workspace configuration:**

```typescript
resolve: {
  alias: {
    '@asafarim/shared-ui-react': resolve(__dirname, '../../packages/shared-ui-react'),
    '@asafarim/shared-tokens': resolve(__dirname, '../../packages/shared-tokens'),
  },
},
optimizeDeps: {
  include: ['@asafarim/shared-ui-react', '@asafarim/shared-tokens'],
},
```

## Best Practices

1. **Use `pnpm dev` to start all apps with proper workspace linking**
2. **Make CSS changes in shared-ui-react while apps are running**
3. **Changes automatically reflect across all consuming apps**
4. **No manual rebuilds needed during development**

## Troubleshooting

**If CSS changes don't reflect:**

1. Verify you're using the updated Vite configurations
2. Check that workspace linking is working
3. Clear Vite cache: `rm -rf node_modules/.vite`
4. Restart the dev server

**For production builds:**
Always run `pnpm build` from root to ensure all workspace packages are built in the correct order.

## App-Specific Notes

- **Vite Apps** (ai-ui, core-app, web, identity-portal): Full CSS synchronization with HMR
- **Docusaurus App** (blog): CSS synchronization via workspace dependencies
- **Angular App** (jobs-ui): Limited CSS synchronization due to different build system
