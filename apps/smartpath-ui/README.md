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
│   ├── components/       # Reusable components
│   ├── contexts/         # React contexts (Auth)
│   ├── pages/            # Page components
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── public/               # Static assets
└── index.html            # HTML template
```

## Features

### Pages

- **Dashboard** - Overview with quick access cards
- **Tasks** - Homework and activity management
- **Learning** - Course catalog and lessons
- **Progress** - Learning progress tracking
- **Family** - Family member management

### Authentication

- SSO integration with Identity Portal
- JWT token-based authentication
- Automatic token refresh
- Protected routes

### API Integration

- Axios client with interceptors
- Automatic token injection
- Error handling
- Token refresh on 401

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

## Design System

Uses shared design tokens from `@asafarim/shared-tokens`:

- CSS variables for theming
- Consistent color palette
- Typography scale
- Spacing system
- Border radius and shadows

## Workspace Integration

Integrates with monorepo shared packages:

- `@asafarim/shared-ui-react` - Shared UI components
- `@asafarim/shared-tokens` - Design tokens
- `@asafarim/shared-i18n` - Internationalization

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

- Backend: `http://localhost:5109`
- Frontend: `http://smartpath.asafarim.local:5195`

### Production (.env.production)

- Backend: `https://smartpath.asafarim.be/api`
- Frontend: `https://smartpath.asafarim.be`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
