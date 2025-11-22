# @asafarim/shared-i18n Demo

Interactive demo application showcasing the features of `@asafarim/shared-i18n` package.

## 🚀 Live Demo

Visit the live demo at: [https://alisafari-it.github.io/shared-i18n/](https://alisafari-it.github.io/shared-i18n/)

## 📦 Features Demonstrated

- ✅ Multi-language support (English & Dutch)
- ✅ Cookie-based language persistence
- ✅ `useLanguage` hook for language management
- ✅ `useTranslation` hook for translations
- ✅ Automatic language detection
- ✅ Real-time language switching
- ✅ Code examples and usage patterns

## 🛠️ Development

### Prerequisites

- Node.js 18+ 
- pnpm 8+

### Install Dependencies

```bash
pnpm install
```

### Run Development Server

```bash
pnpm dev
```

The demo will be available at `http://localhost:5180`

### Build for Production

```bash
pnpm build
```

### Preview Production Build

```bash
pnpm preview
```

## 📤 Deployment

### Deploy to GitHub Pages

```bash
pnpm deploy
```

This will:
1. Build the production bundle
2. Deploy to the `gh-pages` branch
3. Make it available at your GitHub Pages URL

### Manual Deployment

1. Build the app:
   ```bash
   pnpm build
   ```

2. The `dist` folder contains the static files ready for deployment to any static hosting service (Netlify, Vercel, etc.)

## 📁 Project Structure

```
demo/
├── src/
│   ├── components/
│   │   ├── Hero.tsx           # Hero section
│   │   ├── Features.tsx       # Features grid
│   │   ├── DemoSection.tsx    # Interactive demo
│   │   ├── CodeExamples.tsx   # Code snippets
│   │   ├── LanguageSwitcher.tsx # Language toggle
│   │   └── Footer.tsx         # Footer
│   ├── locales/
│   │   ├── en/
│   │   │   └── demo.json      # English translations
│   │   └── nl/
│   │       └── demo.json      # Dutch translations
│   ├── App.tsx                # Main app component
│   ├── App.css                # App styles
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🔗 Links

- **Package**: [@asafarim/shared-i18n](https://www.npmjs.com/package/@asafarim/shared-i18n)
- **Source Code**: [GitHub](https://github.com/AliSafari-IT/asafarim-dot-be/tree/main/packages/shared-i18n)
- **Documentation**: [README](https://github.com/AliSafari-IT/asafarim-dot-be/blob/main/packages/shared-i18n/README.md)

## 📝 License

MIT © ASafariM
