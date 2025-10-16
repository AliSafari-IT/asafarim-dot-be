# Portfolio Showcase Frontend - Implementation Guide

## 🎯 Overview

Complete React + TypeScript frontend implementation for the Portfolio Showcase feature. Built with pure CSS using CSS variables, Zustand for state management, and React Router for navigation.

## 📁 Project Structure

```
src/
├── types/
│   └── portfolio.types.ts              # TypeScript interfaces
├── services/
│   └── portfolioService.ts             # API integration layer
├── stores/
│   └── portfolioStore.ts               # Zustand state management
├── utils/
│   └── seo.ts                          # SEO utilities
├── components/
│   └── Portfolio/
│       ├── PortfolioHeader/            # User header with avatar & contact
│       ├── PortfolioOverview/          # Main layout with dynamic sections
│       ├── ProjectCard/                # Project showcase card
│       ├── ProjectDetail/              # Project modal with full details
│       ├── ExperienceCard/             # Work experience display
│       ├── PublicationCard/            # Publication/research preview
│       ├── SkillsSection/              # Categorized technology tags
│       └── PortfolioSkeleton/          # Loading state
└── pages/
    └── Portfolio/
        ├── PortfolioPublicView.tsx     # Public route (/u/:username)
        ├── PortfolioPreview.tsx        # Private preview (/portfolio)
        └── PortfolioDashboard.tsx      # Management panel (/dashboard/portfolio)
```

## 🔌 API Integration

### Base Configuration
```typescript
// Automatically strips /core suffix if present
const API_BASE_URL = (import.meta.env.VITE_CORE_API_URL || 'https://core.asafarim.be/api').replace(/\/core$/, '');
```

### Available Endpoints
- `GET /api/portfolio/{slug}` - Public portfolio (no auth)
- `GET /api/portfolio` - My portfolio (auth required)
- `GET /api/portfolio/settings` - Get settings (auth required)
- `PUT /api/portfolio/settings` - Update settings (auth required)
- `POST /api/portfolio/projects` - Create project (auth required)
- `PUT /api/portfolio/projects/{id}` - Update project (auth required)
- `DELETE /api/portfolio/projects/{id}` - Delete project (auth required)

## 🏪 State Management (Zustand)

### Store Structure
```typescript
interface PortfolioStore {
  portfolio: PublicPortfolio | null;
  loading: boolean;
  error: string | null;
  currentLanguage: string;
  
  // Actions
  fetchPublicPortfolio: (slug: string) => Promise<void>;
  fetchMyPortfolio: () => Promise<void>;
  updateSettings: (settings: Partial<PortfolioSettings>) => Promise<void>;
  createProject: (project: CreateProjectDto) => Promise<void>;
  updateProject: (id: string, project: Partial<CreateProjectDto>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setLanguage: (lang: string) => void;
  clearError: () => void;
  reset: () => void;
}
```

### Usage Example
```tsx
import { usePortfolioStore } from '../../stores/portfolioStore';

const MyComponent = () => {
  const { portfolio, loading, fetchPublicPortfolio } = usePortfolioStore();
  
  useEffect(() => {
    fetchPublicPortfolio('ali-safari');
  }, []);
  
  if (loading) return <PortfolioSkeleton />;
  if (!portfolio) return null;
  
  return <PortfolioOverview portfolio={portfolio} />;
};
```

## 🎨 Styling with CSS Variables

All components use CSS variables from `base.css`:

```css
/* Colors */
--color-primary
--color-surface
--color-background
--color-border
--color-text-primary
--color-text-secondary

/* Typography */
--font-size-xs
--font-size-sm
--font-size-base
--font-size-lg
--font-size-xl
--font-size-xxl
--font-weight-normal
--font-weight-medium
--font-weight-semibold
--font-weight-bold

/* Spacing */
--spacing-xs
--spacing-sm
--spacing-md
--spacing-lg
--spacing-xl
--spacing-xxl

/* Border Radius */
--border-radius-sm
--border-radius-md
--border-radius-lg
```

## 🛣️ Routing Setup

Add these routes to your React Router configuration:

```tsx
import { Routes, Route } from 'react-router-dom';
import { 
  PortfolioPublicView, 
  PortfolioPreview, 
  PortfolioDashboard 
} from './pages/Portfolio';

<Routes>
  {/* Public portfolio */}
  <Route path="/u/:username" element={<PortfolioPublicView />} />
  
  {/* Private preview */}
  <Route path="/portfolio" element={<PortfolioPreview />} />
  
  {/* Dashboard */}
  <Route path="/dashboard/portfolio" element={<PortfolioDashboard />} />
</Routes>
```

## 🔐 Authentication

The service layer automatically includes JWT tokens:

```typescript
const token = localStorage.getItem('authToken');
```

Ensure your auth flow stores tokens with this key, or update `portfolioService.ts` accordingly.

## 📊 Data Flow

```
1. Component mounts
   ↓
2. useEffect triggers store action
   ↓
3. Store calls service method
   ↓
4. Service makes API request with auth token
   ↓
5. Response updates store state
   ↓
6. Components re-render with new data
```

## 🎯 Key Features

### Dynamic Section Ordering
Sections render based on `settings.sectionOrder`:
```typescript
settings.sectionOrder.map(renderSection)
// Example: ["projects", "skills", "experience", "publications"]
```

### Featured Projects
Projects with `isFeatured: true` display with special styling and appear first.

### Responsive Design
All components are mobile-responsive with breakpoints at 768px and 1400px.

### SEO Optimization
- Dynamic meta tags via `updatePageMeta()`
- Structured data (JSON-LD) via `generatePersonSchema()`
- Semantic HTML with proper heading hierarchy

### Accessibility
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus management in modals
- Alt text on images

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install zustand
# or
pnpm add zustand
```

### 2. Configure Environment
```env
VITE_CORE_API_URL=https://core.asafarim.be/api
# or
VITE_CORE_API_URL=https://core.asafarim.be/api/core
# (The service will automatically strip /core suffix)
```

### 3. Add Routes
Import and configure the three main pages in your router.

### 4. Test the Flow
1. Visit `/dashboard/portfolio` to configure settings
2. Preview at `/portfolio`
3. Make public and share `/u/your-username`

## 📱 Component Usage Examples

### Display Public Portfolio
```tsx
import { PortfolioPublicView } from './pages/Portfolio';

// In your routes
<Route path="/u/:username" element={<PortfolioPublicView />} />
```

### Manage Portfolio
```tsx
import { PortfolioDashboard } from './pages/Portfolio';

// Protected route
<Route path="/dashboard/portfolio" element={<ProtectedRoute><PortfolioDashboard /></ProtectedRoute>} />
```

### Custom Component Integration
```tsx
import { ProjectCard } from './components/Portfolio';

const MyComponent = () => {
  const project = { /* project data */ };
  
  return (
    <ProjectCard 
      project={project}
      onClick={() => console.log('Project clicked')}
    />
  );
};
```

## 🔧 Customization

### Add Custom Sections
Extend the `renderSection` function in `PortfolioOverview.tsx`:

```typescript
case 'custom-section':
  return <CustomSection key="custom" data={portfolio.customData} />;
```

### Modify Styling
Override CSS variables in your theme:

```css
:root {
  --color-primary: #your-color;
  --font-base: 'Your Font', sans-serif;
}
```

### Add Translations
Use the `preferredLanguage` field with your i18n library:

```tsx
const lang = portfolio?.preferredLanguage || 'en';
const t = useTranslation(lang);
```

## 📋 Checklist

- [x] Install Zustand
- [x] Configure API base URL
- [x] Add routes to router
- [x] Test authentication flow
- [ ] Verify CSS variables are defined
- [ ] Test responsive design
- [ ] Verify SEO meta tags
- [ ] Test accessibility features
- [ ] Add error boundaries
- [ ] Configure production build

## 🐛 Troubleshooting

### API Errors
- Check `VITE_CORE_API_URL` is correct
- Verify JWT token is stored in localStorage
- Check CORS configuration on backend

### Styling Issues
- Ensure CSS variables are defined in `base.css`
- Check component CSS imports
- Verify CSS module configuration

### State Not Updating
- Check Zustand store actions
- Verify API responses match TypeScript types
- Use React DevTools to inspect state

## 📚 Component Details

### 1. PortfolioHeader
Displays user information at the top of the portfolio.

**Props:**
```typescript
interface PortfolioHeaderProps {
  portfolio: PublicPortfolio;
}
```

**Features:**
- Avatar image with fallback
- Name and headline
- Bio text
- Contact information (email, phone, location)
- Respects `showContactInfo` setting

### 2. PortfolioOverview
Main container that renders all portfolio sections.

**Props:**
```typescript
interface PortfolioOverviewProps {
  portfolio: PublicPortfolio;
}
```

**Features:**
- Dynamic section ordering
- Projects grid
- Skills categorization
- Work experience timeline
- Publications list

### 3. ProjectCard
Individual project display card.

**Props:**
```typescript
interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}
```

**Features:**
- Featured badge
- Project thumbnail
- Technology tags
- GitHub and demo links
- Hover effects

### 4. ProjectDetail
Full-screen modal for project details.

**Props:**
```typescript
interface ProjectDetailProps {
  project: Project;
  onClose: () => void;
}
```

**Features:**
- Image gallery
- Full description
- Technology list
- External links
- Keyboard navigation (ESC to close)

### 5. ExperienceCard
Work experience display.

**Props:**
```typescript
interface ExperienceCardProps {
  experience: WorkExperience;
}
```

**Features:**
- Company and position
- Date range
- Location
- Description

### 6. PublicationCard
Research publication display.

**Props:**
```typescript
interface PublicationCardProps {
  publication: Publication;
}
```

**Features:**
- Title with external link
- Journal name
- Publication year
- DOI/URL link

### 7. SkillsSection
Technology skills grouped by category.

**Props:**
```typescript
interface SkillsSectionProps {
  technologies: Technology[];
}
```

**Features:**
- Automatic grouping by category
- Interactive tags
- Hover effects

### 8. PortfolioSkeleton
Loading state placeholder.

**Features:**
- Animated shimmer effect
- Matches layout structure
- Responsive design

## 🎉 Next Steps

1. **Add Project Creation Form**: Build a form component for creating/editing projects
2. **Image Upload**: Integrate image upload functionality
3. **Drag & Drop Reordering**: Allow users to reorder projects visually
4. **Analytics**: Track portfolio views and interactions
5. **Export Options**: Add PDF export functionality
6. **Themes**: Implement multiple color themes
7. **Templates**: Create portfolio layout templates

## 📖 Additional Documentation

- `PORTFOLIO_API_MAPPING.md` - API response structure and component mapping
- `PORTFOLIO_ROUTES_EXAMPLE.md` - Routing configuration examples
- `PORTFOLIO_MIGRATION_SUMMARY.md` - Migration from old to new portfolio
