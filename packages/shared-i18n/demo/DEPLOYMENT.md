# Deployment Guide for @asafarim/shared-i18n Demo

## 🎯 Quick Start

### 1. Install Dependencies

From the demo directory:

```bash
cd packages/shared-i18n/demo
pnpm install
```

### 2. Run Locally

```bash
pnpm dev
```

Visit `http://localhost:5180` to see the demo.

## 📤 Deployment Options

### Option 1: GitHub Pages (Recommended)

#### Prerequisites
- GitHub repository with Pages enabled
- `gh-pages` npm package (already in devDependencies)

#### Steps

1. **Update `vite.config.ts` base path** (if needed):
   ```ts
   export default defineConfig({
     base: '/shared-i18n/', // Change to match your repo name
   });
   ```

2. **Deploy**:
   ```bash
   pnpm deploy
   ```

3. **Configure GitHub Pages**:
   - Go to your repo → Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` / `root`
   - Save

4. **Access your demo**:
   - URL: `https://<username>.github.io/shared-i18n/`

### Option 2: Separate Git Submodule (For react-themes)

When you create the `react-themes` submodule later:

1. **Create a new repository**:
   ```bash
   # On GitHub, create a new repo: react-themes
   ```

2. **Move demo to submodule**:
   ```bash
   cd packages/shared-i18n
   git submodule add https://github.com/AliSafari-IT/react-themes.git demo
   ```

3. **Update vite.config.ts**:
   ```ts
   export default defineConfig({
     base: '/react-themes/',
   });
   ```

4. **Deploy**:
   ```bash
   cd demo
   pnpm deploy
   ```

### Option 3: Netlify

1. **Build the app**:
   ```bash
   pnpm build
   ```

2. **Deploy `dist` folder** to Netlify:
   - Drag & drop the `dist` folder to Netlify
   - Or use Netlify CLI:
     ```bash
     npx netlify deploy --prod --dir=dist
     ```

### Option 4: Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   pnpm build
   vercel --prod
   ```

## 🔧 Configuration

### Environment Variables

No environment variables required for the demo. The package uses workspace dependencies.

### Base Path

Update `vite.config.ts` if deploying to a subdirectory:

```ts
export default defineConfig({
  base: '/your-path/', // e.g., '/shared-i18n/'
});
```

### Package Version

When publishing updates to `@asafarim/shared-i18n`:

1. Update package version in `../package.json`
2. Rebuild the demo:
   ```bash
   pnpm build
   ```
3. Redeploy

## 📝 Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy-demo.yml`:

```yaml
name: Deploy Demo

on:
  push:
    branches: [main]
    paths:
      - 'packages/shared-i18n/demo/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
        working-directory: packages/shared-i18n/demo
      
      - name: Build
        run: pnpm build
        working-directory: packages/shared-i18n/demo
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: packages/shared-i18n/demo/dist
```

## 🐛 Troubleshooting

### Module not found errors

The TypeScript errors you see are expected until you run `pnpm install`. The demo uses workspace dependencies (`workspace:*`), which resolve after installation.

### Build fails

1. Ensure you're in the correct directory:
   ```bash
   cd packages/shared-i18n/demo
   ```

2. Clean install:
   ```bash
   rm -rf node_modules dist
   pnpm install
   pnpm build
   ```

### Deployment fails

1. Check `base` path in `vite.config.ts` matches your deployment URL
2. Ensure `gh-pages` branch exists (created automatically on first deploy)
3. Verify GitHub Pages is enabled in repo settings

## 🚀 Next Steps

1. **Test locally**: `pnpm dev`
2. **Build**: `pnpm build`
3. **Deploy**: `pnpm deploy`
4. **Verify**: Visit your GitHub Pages URL

For the `react-themes` submodule, follow the same pattern but create a separate repository first.
