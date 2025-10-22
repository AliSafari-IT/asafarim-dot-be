# Prelaunch Notice Banner - Quick Start Guide

## 🚀 Get Started in 2 Minutes

### Step 1: Import the Component

```tsx
import { PrelaunchNoticeBanner } from '@asafarim/shared-ui-react';
```

### Step 2: Add Below Your Navbar

```tsx
function App() {
  return (
    <>
      <Navbar />
      <PrelaunchNoticeBanner />  {/* Add this line */}
      <main>
        {/* Your content */}
      </main>
    </>
  );
}
```

### Step 3: Done! 🎉

The banner will automatically:

- ✅ Display a beautiful gradient banner
- ✅ Show your app version
- ✅ Link to GitHub issues
- ✅ Remember when users dismiss it
- ✅ Work on all screen sizes
- ✅ Support dark theme

## 📸 What You'll See

### Desktop View

```
┌──────────────────────────────────────────────────────────────┐
│ 🚀  Early Access Preview                    🐛 Report Issue  │
│     You're experiencing the future! New     v1.0.0      ×   │
│     features are being added daily...                        │
└──────────────────────────────────────────────────────────────┘
```

### Mobile View

```
┌────────────────────────┐
│ 🚀                  ×  │
│ Early Access Preview   │
│ You're experiencing... │
│                        │
│ 🐛 Report Issue        │
│ v1.0.0                 │
└────────────────────────┘
```

## 🎨 Customization (Optional)

### Use in Footer Instead

```tsx
import { PrelaunchNotice } from '@asafarim/shared-ui-react';

<PrelaunchNotice position="footer" />
```

### Custom Storage Key

```tsx
<PrelaunchNotice 
  position="navbar"
  storageKey="myCustomKey"
/>
```

### Change Colors

```css
.prelaunch-notice--navbar {
  background: linear-gradient(135deg, #your-color-1, #your-color-2);
}
```

## 🔧 Configuration

### Enable/Disable Globally

```typescript
// packages/shared-ui-react/configs/isPrelaunch.ts
export const isPrelaunch = true; // Set to false to hide
```

### Update Version

The version is automatically read from your `package.json`:

```json
{
  "version": "1.0.0"
}
```

## 🐛 Troubleshooting

### Banner Not Showing?

**Check 1**: Is `isPrelaunch` set to `true`?

```typescript
// configs/isPrelaunch.ts
export const isPrelaunch = true;
```

**Check 2**: Clear localStorage

```javascript
localStorage.removeItem('prelaunchBannerDismissed');
```

**Check 3**: Rebuild the package

```bash
pnpm --filter @asafarim/shared-ui-react build
```

### Styling Issues?

**Check 1**: Import CSS

```typescript
import '@asafarim/shared-ui-react/dist/index.css';
```

**Check 2**: Check z-index conflicts

```css
.prelaunch-notice {
  z-index: var(--z-sticky, 100);
}
```

## 📚 Need More Help?

- **Full Documentation**: See [README.md](./README.md)
- **Usage Examples**: See [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md)
- **Implementation Details**: See [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- **Report Issues**: <https://github.com/AliSafari-IT/asafarim-dot-be/issues>

## ✨ Features at a Glance

| Feature | Included |
|---------|----------|
| Dismissible | ✅ |
| localStorage Persistence | ✅ |
| GitHub Issue Link | ✅ |
| Version Display | ✅ |
| Responsive Design | ✅ |
| Dark Theme Support | ✅ |
| Smooth Animations | ✅ |
| Accessibility (ARIA) | ✅ |
| Keyboard Navigation | ✅ |
| TypeScript Support | ✅ |

## 🎯 Best Practices

1. **Always place below navbar** for maximum visibility
2. **Test on mobile devices** to ensure responsive design works
3. **Monitor GitHub issues** linked from the banner
4. **Update version regularly** to build user trust
5. **Test dismissal** to ensure localStorage works correctly

---

**That's it!** You now have a professional prelaunch notice banner. 🎉

For advanced usage, customization, and integration examples, check out the other documentation files.
