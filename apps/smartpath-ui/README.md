# SmartPath UI

Frontend application for SmartPath - Family Learning & Homework Tracker for children aged 9-14.

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm package manager
- SmartPath.Api running (backend)
- Identity.Api running (authentication)

### Installation

```bash
cd D:\repos\asafarim-dot-be\apps\smartpath-ui
pnpm install
```

### Run Development

```bash
pnpm start
```

Application will be available at: `http://smartpath.asafarim.local:5195`

### Configuration

Update `.env` file:

- **VITE_IDENTITY_API_URL**: Identity Portal URL for authentication
- **VITE_SMARTPATH_API_URL**: SmartPath backend API URL

## Project Structure

```
smartpath-ui/
├── src/
│   ├── api/              # API client services
│   ├── components/       # Reusable components (Navbar, AddMemberModal, ProtectedRoute)
│   ├── contexts/         # React contexts (Auth)
│   ├── hooks/            # Custom hooks (useAuth)
│   ├── pages/            # Page components
│   ├── theme/            # Theme configuration
│   ├── App.tsx           # Main app component
│   ├── index.css         # Global styles with design tokens
│   └── main.tsx          # Entry point
├── public/               # Static assets
└── index.html            # HTML template
```

## Features

### Pages

- **Dashboard** - Overview with quick access cards and family list
- **Tasks** - Homework and activity management with family filtering
- **Learning** - Course catalog and lessons with enrollment
- **Progress** - Learning progress tracking
- **Family** - Family member management with add/remove functionality
- **Forms** - Task, Course, Chapter, and Family creation/editing

### Authentication

- SSO integration with Identity Portal
- JWT token-based authentication with automatic refresh
- Cookie-based token storage (`auth_token`, `refresh_token`)
- Protected routes with loading states
- Automatic redirect to login on 401

### API Integration

- Axios client with request/response interceptors
- Automatic Bearer token injection from localStorage
- Token refresh on 401 with retry logic
- Centralized error handling
- Consistent API endpoint structure

### Design System

Uses shared design tokens from `@asafarim/design-tokens`:

- CSS variables for theming (--asm-* tokens)
- Consistent color palette with light/dark mode support
- Typography scale with Lato font family
- Spacing system (--asm-space-*)
- Border radius tokens (--asm-radius-*)
- Shadow effects (--asm-effect-shadow-*)
- Motion tokens (--asm-motion-duration-*, --asm-motion-easing-*)

### Testing

- Comprehensive `data-testid` attributes on all pages and components
- Test IDs for:
  - Page containers (dashboard-page, tasks-page, family-page, etc.)
  - Headers and navigation elements
  - Form inputs and buttons
  - List items with dynamic IDs (task-card-{id}, family-card-{id}, course-card-{id})
  - Modal components and overlays
  - Loading and empty states

## Development

```bash
# Start dev server
pnpm start

# Build for production
pnpm build

# Preview production build
pnpm preview

# Lint code
pnpm lint
```

## Key Components

### Navbar
- Navigation menu with dashboard, tasks, learning, progress, and family links
- User display with logout functionality
- Theme toggle integration

### AddMemberModal
- Email-based member invitation
- Role selection for admins (familyMember, familyManager)
- Error handling and success feedback

### ProtectedRoute
- Authentication guard for protected pages
- Loading state while checking auth
- Automatic redirect to login if not authenticated

## API Integration Details

### Token Management
- Access token stored as `auth_token` in localStorage
- Refresh token stored as `refresh_token` in localStorage
- Automatic token refresh on 401 response
- Tokens cleared on logout

### Family Roles
- `familyManager` - Can add/remove family members
- `familyMember` - Read-only access to family data
- Admin users can override family-level restrictions

### Endpoints
- `GET /families/my-families` - Get user's families
- `POST /families/{id}/members/by-email` - Add member by email
- `DELETE /families/{id}/members/users/{userId}` - Remove member
- `GET /users/me` - Get current user info
- `GET /courses` - List all courses
- `POST /tasks` - Create task
- And more...

## Workspace Integration

Integrates with monorepo shared packages:

- `@asafarim/shared-ui-react` - Shared UI components (ButtonComponent, etc.)
- `@asafarim/design-tokens` - Design tokens CSS
- `@asafarim/shared-i18n` - Internationalization
- `@asafarim/react-themes` - Theme provider

## Production Build

```bash
# Build
pnpm build

# Output in dist/ folder
# Deploy dist/ to web server
# Configure reverse proxy for /api routes
```

## Environment Variables

### Development (.env)

- **VITE_IDENTITY_API_URL**: `http://identity.asafarim.local:5177`
- **VITE_SMARTPATH_API_URL**: `http://smartpath.asafarim.local:5109`

### Production (.env.production)

- **VITE_IDENTITY_API_URL**: `https://identity.asafarim.be`
- **VITE_SMARTPATH_API_URL**: `https://smartpath.asafarim.be/api`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Recent Updates

### Design System Refactor
- Migrated from hardcoded colors to `--asm-*` design tokens
- Removed `@asafarim/shared-tokens/styles.css` imports
- Centralized design tokens in `@asafarim/design-tokens/css`
- Updated all CSS files to use token-based styling

### Testing Infrastructure
- Added comprehensive `data-testid` attributes to all pages and components
- Test IDs follow consistent naming conventions
- Dynamic test IDs for list items with entity IDs

### Authentication Improvements
- Consistent token key usage (`auth_token`, `refresh_token`)
- Improved token refresh flow with retry logic
- Better error handling for authentication failures

### UI/UX Enhancements
- Responsive design with mobile-first approach
- Improved form layouts with better spacing
- Enhanced empty states with helpful messages
- Better loading states with spinners

## License

MIT
