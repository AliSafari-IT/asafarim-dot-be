# Remove Duplicate Auth Logic from Admin Pages

All admin pages are now wrapped with `ProtectedRoute` in `main.tsx`, which handles authentication centrally.

## Files that need the duplicate auth logic removed:

### Core Admin Pages
1. `/apps/web/src/pages/admin/EntityManagement.tsx`
2. `/apps/web/src/pages/admin/EditEntity.tsx`
3. `/apps/web/src/pages/admin/ViewEntity.tsx`
4. `/apps/web/src/pages/admin/EntityTableView.tsx`

### Resume Section Pages
5. `/apps/web/src/pages/admin/resume/ResumeSectionManagement.tsx`
6. `/apps/web/src/pages/admin/resume/ResumeSectionItemsView.tsx`

### Resume Form Pages (13 files)
7. `/apps/web/src/pages/admin/resume/ProjectForm.tsx`
8. `/apps/web/src/pages/admin/resume/LanguageForm.tsx`
9. `/apps/web/src/pages/admin/resume/CertificateForm.tsx`
10. `/apps/web/src/pages/admin/resume/AwardForm.tsx`
11. `/apps/web/src/pages/admin/resume/EducationForm.tsx`
12. `/apps/web/src/pages/admin/resume/SocialLinkForm.tsx`
13. `/apps/web/src/pages/admin/resume/SkillForm.tsx`
14. `/apps/web/src/pages/admin/resume/ReferenceForm.tsx`
15. `/apps/web/src/pages/admin/resume/ExperienceForm.tsx`

## Pattern to Remove

Remove this useEffect block:
```typescript
useEffect(() => {
  if (!authLoading && !isAuthenticated) {
    window.location.href = `http://identity.asafarim.local:5177/login?returnUrl=${encodeURIComponent(
      window.location.href
    )}`;
  }
}, [authLoading, isAuthenticated]);
```

Also remove:
- `authLoading` from useAuth destructuring
- `isAuthenticated` from useAuth destructuring (unless used elsewhere)
- Any conditional rendering based on `!isAuthenticated`

## Already Fixed
✅ `/apps/web/src/pages/admin/resume/ViewResume.tsx`
✅ `/apps/web/src/pages/admin/resume/ResumeList.tsx`
