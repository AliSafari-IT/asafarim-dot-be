# Authentication Flickering - Complete Fix Guide

## Problem
Flickering between `asafarim.be/admin/...` and `identity.asafarim.be/login` even when already authenticated.

## Root Cause
**Duplicate authentication checks** in individual admin pages racing with the centralized `useAuth` hook:
1. `ProtectedRoute` wraps admin routes and checks auth
2. Individual pages ALSO check auth in their own `useEffect`
3. Race condition: Page's useEffect fires before ProtectedRoute completes → premature redirect
4. Result: Endless redirect loop

## Solution Implemented

### 1. Created Centralized ProtectedRoute ✅
**File**: `/apps/web/src/components/ProtectedRoute.tsx`

- Single source of truth for authentication
- Shows loading state while checking auth
- Only redirects after loading completes
- Prevents race conditions

### 2. Updated Router Configuration ✅
**File**: `/apps/web/src/main.tsx`

- Wrapped ALL 40+ admin routes with `<ProtectedRoute>`
- Centralized auth at routing level

### 3. Removed Duplicate Auth Logic

**Already Fixed**:
- ✅ `/apps/web/src/pages/admin/resume/ViewResume.tsx`
- ✅ `/apps/web/src/pages/admin/resume/ResumeList.tsx`
- ✅ `/apps/web/src/pages/admin/EntityManagement.tsx`

**Still Need Fixing** (15 files):

#### Core Admin Pages
1. `apps/web/src/pages/admin/EditEntity.tsx`
2. `apps/web/src/pages/admin/ViewEntity.tsx`
3. `apps/web/src/pages/admin/EntityTableView.tsx`
4. `apps/web/src/pages/admin/AddNewEntity.tsx`

#### Resume Section Pages
5. `apps/web/src/pages/admin/resume/ResumeSectionManagement.tsx`
6. `apps/web/src/pages/admin/resume/ResumeSectionItemsView.tsx`

#### Resume Form Pages
7. `apps/web/src/pages/admin/resume/ProjectForm.tsx`
8. `apps/web/src/pages/admin/resume/LanguageForm.tsx`
9. `apps/web/src/pages/admin/resume/CertificateForm.tsx`
10. `apps/web/src/pages/admin/resume/AwardForm.tsx`
11. `apps/web/src/pages/admin/resume/EducationForm.tsx`
12. `apps/web/src/pages/admin/resume/SocialLinkForm.tsx`
13. `apps/web/src/pages/admin/resume/SkillForm.tsx`
14. `apps/web/src/pages/admin/resume/ReferenceForm.tsx`
15. `apps/web/src/pages/admin/resume/ExperienceForm.tsx`

## What to Remove from Each File

### Pattern 1: Remove useEffect Auth Redirect
```typescript
// DELETE THIS:
useEffect(() => {
  if (!authLoading && !isAuthenticated) {
    window.location.href = `http://identity.asafarim.local:5177/login?returnUrl=${encodeURIComponent(
      window.location.href
    )}`;
  }
}, [authLoading, isAuthenticated]);
```

### Pattern 2: Remove Conditional Render
```typescript
// DELETE THIS:
if (!isAuthenticated) {
  return (
    <div className="...">
      <div className="...">
        <p>Redirecting to login...</p>
      </div>
    </div>
  );
}
```

### Pattern 3: Update useAuth Destructuring
```typescript
// BEFORE:
const { isAuthenticated, loading: authLoading, signIn } = useAuth();

// AFTER (only keep what's actually used):
const { user } = useAuth();  // or remove entirely if not needed
```

### Pattern 4: Remove isAuthenticated from useEffect Dependencies
```typescript
// BEFORE:
useEffect(() => {
  if (isAuthenticated) {
    loadData();
  }
}, [isAuthenticated]);

// AFTER:
useEffect(() => {
  loadData();
}, []);
```

## Quick Fix Command

For each file, run this sed command to remove the useEffect block:

```bash
# Example for one file
sed -i '/\/\/ Redirect if not authenticated/,/}, \[authLoading, isAuthenticated\]);/d' \
  apps/web/src/pages/admin/EditEntity.tsx
```

## Testing After Fix

1. **Build**: `pnpm run build:web` - should have no TypeScript errors
2. **Deploy**: `pnpm run sd` - select web app
3. **Test**: Navigate to `/admin/entities/resumes` while logged in
4. **Verify**: No flickering, page loads immediately

## Why This Works

**Before**: 
- ProtectedRoute checks auth (loading=true)
- Page also checks auth → sees loading=false, isAuthenticated=false → redirects
- Race condition → flicker

**After**:
- ProtectedRoute checks auth (loading=true) → shows "Checking authentication..."
- Auth completes → ProtectedRoute renders page
- Page has no auth logic → just renders content
- No race condition → no flicker

## Additional Benefits

✅ Cleaner code - pages don't need auth logic  
✅ Consistent UX - same loading state everywhere  
✅ Maintainable - auth changes in one place  
✅ Testable - easier to mock ProtectedRoute  
✅ Performance - fewer redundant auth checks
