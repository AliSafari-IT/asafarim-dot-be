# Tasks UI - Task Management Application

A modern React + TypeScript frontend for the ASafariM Task Management Application.

## Features

- **Dashboard**: Overview of tasks and projects
- **Project Management**: Create, view, and manage projects
- **Task Management**: Create, update, and track tasks
- **Role-Based Access**: Admin, Manager, and Member roles
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Shared Design System**: Uses @asafarim/shared-tokens for consistent styling

## Tech Stack

- **React 19.1.1** - UI framework
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Vite** - Build tool
- **Pure CSS** - No Tailwind, uses shared design tokens

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

### Environment Configuration

The app uses the following API endpoints:

- **Development**: `http://taskmanagement.asafarim.local:5104/api`
- **Production**: `https://taskmanagement.asafarim.be/api`

Authentication is handled via the Identity API:

- **Development**: `http://identity.asafarim.local:5101`
- **Production**: `https://identity.asafarim.be`

## Project Structure

```
src/
├── api/              # API service layer
│   ├── taskService.ts
│   └── projectService.ts
├── config/           # Configuration files
│   └── api.ts
├── pages/            # Page components
│   ├── Dashboard.tsx
│   ├── ProjectList.tsx
│   ├── ProjectDetail.tsx
│   └── TaskDetail.tsx
├── App.tsx           # Main app component
├── main.tsx          # Entry point
└── index.css         # Global styles
```

## Authentication

The app integrates with the ASafariM Identity API for authentication. Users must be logged in to access the application. The authentication state is managed via cookies and the shared `useAuth` hook from `@asafarim/shared-ui-react`.

## API Integration

All API calls use the `taskService` and `projectService` modules which handle:

- Authentication via JWT tokens in cookies
- Error handling
- Type-safe request/response contracts

## Styling

The application uses shared design tokens from `@asafarim/shared-tokens`:

- CSS custom properties for colors, spacing, and typography
- Automatic light/dark theme support
- Responsive design with mobile-first approach

## Development

### Hot Module Replacement (HMR)

The Vite configuration includes automatic HMR for workspace packages:

```bash
# Edit shared-ui-react components
# Changes automatically reflect in the dev server
```

### Adding New Pages

1. Create a new component in `src/pages/`
2. Add a route in `App.tsx`
3. Add navigation link in the navbar

## Building

```bash
# Development build
pnpm build

# Production build (optimized)
pnpm build
```

## Testing

```bash
# Run tests (when configured)
pnpm test
```

## Deployment

The app is deployed to Netlify. Push to the main branch to trigger automatic deployment.

## Contributing

Follow the existing code patterns and ensure:

- TypeScript strict mode compliance
- Responsive design for all screen sizes
- Accessibility best practices
- Use of shared design tokens

## License

Proprietary - ASafariM
