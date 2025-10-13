# TypeScript Process.env Fix

## Issue

When building apps (particularly `ai-ui`), TypeScript compilation failed with:

```
error TS2580: Cannot find name 'process'. Do you need to install type definitions for node?
Try `npm i --save-dev @types/node`.
```

**Location:** `/var/repos/asafarim-dot-be/packages/shared-ui-react/configs/isProduction.ts:7:12`

## Root Cause

The `isProduction.ts` file uses `process.env.NODE_ENV` to detect the environment during build time (SSR/static generation). However:

1. The shared-ui-react package has `@types/node` installed
2. Individual apps (like ai-ui, web, core-app) may **not** have `@types/node` in their dependencies
3. When these apps compile TypeScript, they also type-check imported files from shared-ui-react
4. TypeScript in these apps doesn't recognize the `process` global without `@types/node`

## Solution

Added a **global type declaration** at the top of `isProduction.ts`:

```typescript
// Declare process for TypeScript when not using @types/node
declare const process: any;
```

And wrapped the usage in a try-catch for runtime safety:

```typescript
if (typeof window === 'undefined') {
  try {
    return process?.env?.NODE_ENV === 'production';
  } catch {
    return false;
  }
}
```

## Why This Works

1. **`declare const process: any;`** tells TypeScript "trust me, this global exists" without requiring `@types/node`
2. **Optional chaining (`?.`)** ensures safe property access even if env is undefined
3. **Try-catch block** provides runtime fallback if process doesn't exist (edge cases)
4. **Type declaration is local** to this file and doesn't pollute the global namespace of consuming apps

## Alternative Solutions Considered

### Option 1: Install @types/node in all apps ❌
**Rejected because:**
- Adds unnecessary dependency to frontend apps
- Not all apps need Node.js types
- Maintenance overhead

### Option 2: Use import.meta.env instead ❌
**Rejected because:**
- Only works in Vite apps, not Docusaurus
- Would require different code paths for different bundlers
- Less universal

### Option 3: Use globalThis ❌
**Rejected because:**
- `globalThis.process` would still need type definitions
- More verbose
- Doesn't solve the TypeScript error

### Option 4: Type assertion without declaration ❌
```typescript
return (process as any).env?.NODE_ENV === 'production';
```
**Rejected because:**
- TypeScript still errors on the bare `process` reference
- Doesn't solve the compilation error

## Testing

All apps now build successfully:

```bash
# Build all apps
NODE_ENV=production pnpm build
✓ @asafarim/shared-ui-react built
✓ @asafarim/ai-ui built
✓ @asafarim/blog built
✓ @asafarim/core-app built
✓ @asafarim/identity-portal built
✓ @asafarim/jobs-ui built
✓ @asafarim/web built
```

Build logs confirm production detection:
```
🔐 shared-ui-react/hooks/useAuth.ts: isProd? true
🔐 Identity API Base: https://identity.asafarim.be/api/identity
```

## Files Modified

1. `/var/repos/asafarim-dot-be/packages/shared-ui-react/configs/isProduction.ts`
   - Added `declare const process: any;`
   - Wrapped usage in try-catch

2. `/var/repos/asafarim-dot-be/docs/deployment/PRODUCTION_ENVIRONMENT_DETECTION.md`
   - Added TypeScript compatibility note

## Future Considerations

If we ever need stricter typing, we could create a minimal type declaration:

```typescript
declare const process: {
  env: {
    NODE_ENV?: 'production' | 'development' | 'test';
    [key: string]: string | undefined;
  };
};
```

However, the current `any` type is sufficient and more flexible.

## Related Issues

- Blog icon URL showing dev URL in production
- Environment detection during static site generation
- TypeScript compatibility across monorepo apps

---

**Fixed:** October 13, 2025  
**Impact:** All frontend apps  
**Status:** Resolved ✅
