# Web - Professional Portfolio & Resume Platform

> A comprehensive React-based web application serving as a professional portfolio, resume management system, and personal website with multilingual support.

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF.svg)](https://vitejs.dev/)

## 🚀 Features

### 🏠 Portfolio Management

- **Public Portfolio**: Showcase projects, research, and publications
- **Resume Builder**: Create and manage multiple resume versions
- **Public Resume View**: Share professional resumes with custom URLs
- **Publications Management**: Organize and display academic/professional publications
- **Project Showcase**: Highlight technical projects with descriptions and links

### 📋 Resume System

- **Multi-Section Management**: Skills, Education, Experience, Projects, Certifications, Languages, Awards, References
- **Multiple Layouts**: Professional, Modern, and Print-optimized layouts
- **PDF Export**: Generate PDF resumes with html2pdf.js
- **Public Sharing**: Share resumes via unique slugs
- **Real-time Preview**: Live preview of resume changes

### 🌐 Content Pages

- **Landing Page**: Modern, responsive homepage
- **About**: Personal and professional background
- **Contact**: Contact form with EmailJS integration
- **Showcases**: Display of technical showcases and demos
- **What's Building**: Current projects and work-in-progress

### 🔐 Admin Features

- **Protected Routes**: JWT-based authentication
- **Entity Management**: CRUD operations for all resume sections
- **Content Management**: Manage publications and portfolio items
- **User-specific Data**: Multi-user support with data isolation

### 🌍 Internationalization

- **Multi-language Support**: English and Dutch (expandable)
- **i18n Integration**: Powered by @asafarim/shared-i18n
- **Language Switching**: Seamless language transitions

## 🏗️ Architecture

### Tech Stack

- **Frontend Framework**: React 18.3 with TypeScript
- **Build Tool**: Vite 7.1
- **Routing**: React Router DOM 6.30
- **Styling**: CSS with Design Tokens (@asafarim/design-tokens)
- **Icons**: Lucide React
- **PDF Generation**: html2pdf.js
- **Email**: EmailJS Browser
- **UI Components**: Shared UI library (@asafarim/shared-ui-react)
- **Theming**: React Themes (@asafarim/react-themes)
- **Notifications**: Custom Toast system (@asafarim/toast)
- **Logging**: Shared Logging (@asafarim/shared-logging)

### Project Structure

```
web/
├── src/
│   ├── api/                  # API client utilities
│   ├── components/           # Reusable UI components
│   │   ├── ProtectedRoute.tsx
│   │   └── ...
│   ├── pages/                # Route pages
│   │   ├── LandingPage.tsx
│   │   ├── About.tsx
│   │   ├── Contact.tsx
│   │   ├── Portfolio.tsx
│   │   ├── admin/            # Admin pages
│   │   │   ├── resume/       # Resume management
│   │   │   │   ├── ResumeForm.tsx
│   │   │   │   ├── SkillsManagement.tsx
│   │   │   │   ├── EducationsManagement.tsx
│   │   │   │   ├── ExperiencesManagement.tsx
│   │   │   │   ├── ProjectsManagement.tsx
│   │   │   │   ├── CertificatesManagement.tsx
│   │   │   │   ├── LanguagesManagement.tsx
│   │   │   │   ├── AwardsManagement.tsx
│   │   │   │   ├── ReferencesManagement.tsx
│   │   │   │   ├── SocialLinksManagement.tsx
│   │   │   │   └── layouts/
│   │   │   │       ├── PrintLayout.tsx
│   │   │   │       ├── ModernLayout.tsx
│   │   │   │       └── ProfessionalLayout.tsx
│   │   │   └── EntityManagement.tsx
│   │   └── portfolio/        # Portfolio pages
│   │       ├── resume/
│   │       │   ├── Resume.tsx
│   │       │   └── PublicResumeView.tsx
│   │       ├── publications/
│   │       │   ├── Documents.tsx
│   │       │   ├── manage.tsx
│   │       │   ├── new.tsx
│   │       │   ├── edit.tsx
│   │       │   └── view.tsx
│   │       └── Research.tsx
│   ├── services/             # Business logic services
│   ├── hooks/                # Custom React hooks
│   ├── theme/                # Theme configuration
│   ├── locales/              # i18n translations
│   │   ├── web-en.json
│   │   └── web-nl.json
│   ├── utils/                # Utility functions
│   ├── config/               # Configuration files
│   ├── App.tsx               # Main application component
│   └── main.tsx              # Application entry point
├── public/                   # Static assets
│   ├── CV_Dec2025_AliSafari.pdf
│   ├── logo.svg
│   └── img/
├── dist/                     # Production build output
└── vite.config.ts            # Vite configuration
```

## 🛠️ Installation

### Prerequisites

- Node.js 18+ and pnpm
- Access to Core API backend (see `/apis/Core.Api`)
- Access to Identity API for authentication

### Setup

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Configure environment variables**:
   Create a `.env` file in the root directory:

   ```env
   VITE_CORE_API_BASE=http://core.asafarim.local:5102
   VITE_IDENTITY_API_URL=http://identity.asafarim.local:5101/api
   VITE_IS_PRODUCTION=false
   ```

3. **Start development server**:

   ```bash
   pnpm dev
   # or
   pnpm start  # Runs on web.asafarim.local:5175
   ```

4. **Build for production**:

   ```bash
   pnpm build
   ```

5. **Preview production build**:

   ```bash
   pnpm preview
   ```

## 🔧 Development

### Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server on default port |
| `pnpm start` | Start development server on web.asafarim.local:5175 |
| `pnpm build` | Build for production (TypeScript + Vite) |
| `pnpm lint` | Run ESLint |
| `pnpm preview` | Preview production build |
| `pnpm clean` | Remove node_modules |
| `pnpm app` | Run monorepo app command |
| `pnpm app:web` | Run web-specific app command |

### Code Quality

- **TypeScript**: Strict type checking enabled
- **ESLint**: Configured with React and TypeScript rules
- **Code Style**: Follows React best practices

## 🌐 API Integration

The application communicates with multiple backend APIs:

### Core API Endpoints

- **Resumes**: `GET/POST/PUT/DELETE /api/resumes`
- **Skills**: `GET/POST/PUT/DELETE /api/skills`
- **Education**: `GET/POST/PUT/DELETE /api/educations`
- **Experience**: `GET/POST/PUT/DELETE /api/work-experiences`
- **Projects**: `GET/POST/PUT/DELETE /api/projects`
- **Certificates**: `GET/POST/PUT/DELETE /api/certificates`
- **Languages**: `GET/POST/PUT/DELETE /api/languages`
- **Awards**: `GET/POST/PUT/DELETE /api/awards`
- **References**: `GET/POST/PUT/DELETE /api/references`
- **Social Links**: `GET/POST/PUT/DELETE /api/social-links`
- **Publications**: `GET/POST/PUT/DELETE /api/publications`
- **Portfolio**: `GET /api/portfolio`
- **Contact**: `POST /api/contact`

### Identity API Endpoints

- `POST /auth/login` - User authentication
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user
- `POST /auth/refresh` - Refresh token

## 🎨 Theming

The application uses a comprehensive design token system:

- **Colors**: Semantic color scales (primary, success, warning, danger, info, neutral)
- **Typography**: Font families (Inter, JetBrains Mono), sizes, weights, line heights
- **Spacing**: Consistent spacing scale (0-16)
- **Motion**: Standardized transitions and animations
- **Shadows**: Elevation system for depth
- **Radius**: Border radius tokens

Theme switching is handled automatically based on system preferences or user selection.

## 📦 Workspace Dependencies

This application is part of a monorepo and uses shared workspace packages:

- `@asafarim/design-tokens` - Design system tokens
- `@asafarim/react-themes` - Theme provider and utilities
- `@asafarim/shared-ui-react` - Shared React components
- `@asafarim/shared-i18n` - Internationalization utilities
- `@asafarim/shared-logging` - Logging utilities
- `@asafarim/toast` - Toast notification system

## 🚢 Deployment

### Production Build

```bash
pnpm build
```

The build output will be in the `dist/` directory.

### Deployment Script

The monorepo includes a selective deployment script:

```bash
pnpm sd  # Select and deploy specific apps
```

### Environment Configuration

For production deployment:

```env
VITE_IS_PRODUCTION=true
VITE_CORE_API_BASE=https://core.asafarim.be/api
VITE_IDENTITY_API_URL=https://identity.asafarim.be/api
```

### Nginx Configuration

The application is served via Nginx at `/var/www/asafarim-dot-be/apps/web`

## 🔐 Authentication

The application uses JWT-based authentication:

- Tokens are stored in HTTP-only cookies (`atk` for access, `rtk` for refresh)
- Protected routes require valid authentication
- Integration with Identity API for user management
- Automatic token refresh on expiration

## 📱 Responsive Design

The application is fully responsive:

- **Mobile-first approach**
- **Breakpoints**: xs, sm, md, lg, xl, 2xl
- **Adaptive layouts**: Different layouts for different screen sizes
- **Touch-friendly**: Optimized for touch interactions

## 🖨️ PDF Export

Resume PDF export features:

- **html2pdf.js**: Client-side PDF generation
- **Multiple layouts**: Choose from different resume templates
- **Print optimization**: Special CSS for print media
- **High quality**: Vector-based rendering

## 📧 Contact Form

Contact form integration:

- **EmailJS**: Client-side email sending
- **Validation**: Form validation before submission
- **Success/Error handling**: User feedback on submission
- **Spam protection**: Basic validation and rate limiting

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Verify Core API backend is running on port 5102
   - Check environment variables
   - Ensure CORS is properly configured

2. **Build Errors**
   - Clear `node_modules` and reinstall: `pnpm install`
   - Clear Vite cache: `rm -rf node_modules/.vite`
   - Rebuild workspace packages: `pnpm -r build`

3. **Authentication Issues**
   - Verify Identity API is running
   - Check JWT configuration matches Identity API
   - Clear browser cookies and try again

4. **Large Bundle Size Warning**
   - The application uses html2pdf.js which is large
   - Consider code-splitting for production optimization
   - Use dynamic imports for heavy libraries

## 📄 License

Part of the asafarim.be monorepo. All rights reserved.

## 🤝 Contributing

This is a private monorepo project. For internal development guidelines, see the main repository documentation.

## 📞 Support

For issues or questions, contact the development team or create an issue in the repository.

---

**Version**: 0.6.2  
**Port**: 5175  
**Last Updated**: December 2025
