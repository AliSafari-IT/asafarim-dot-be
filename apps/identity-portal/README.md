# Identity Portal

A comprehensive identity and access management (IAM) application built with React, TypeScript, and Vite. The Identity Portal provides user authentication, profile management, role-based access control, and administrative user management capabilities.

## Overview

The Identity Portal is a modern web application that serves as the central authentication and user management hub for the Asafarim ecosystem. It provides secure login/registration, user profile management, password management, and administrative controls for managing users and roles.

**Key Features:**
- User authentication (login, registration, password reset)
- User profile management (view and edit personal information)
- Password setup and change functionality
- Role-based access control (RBAC)
- Administrative user management (create, edit, view users)
- Role management interface
- Synchronized logout across multiple sessions
- Responsive design with modern UI components
- Multi-language support (i18n)
- Toast notifications and error handling

## Tech Stack

- **Frontend Framework:** React 18.3.1
- **Language:** TypeScript 5.8.3
- **Build Tool:** Vite 7.1.2
- **Routing:** React Router DOM 6.30.1
- **Styling:** Design tokens from `@asafarim/design-tokens`
- **UI Components:** Shared UI React components (`@asafarim/shared-ui-react`)
- **Icons:** Lucide React 0.548.0
- **Notifications:** Toast notifications (`@asafarim/toast`)
- **Theming:** React themes (`@asafarim/react-themes`)
- **Internationalization:** i18n support (`@asafarim/shared-i18n`)
- **Validation:** Shared validation utilities (`@asafarim/shared-validation`)
- **Logging:** Shared logging (`@asafarim/shared-logging`)

## Project Structure

```
src/
├── api/                      # API service layer
│   └── identityService.ts    # Identity API client
├── assets/                   # Static assets (images, fonts, etc.)
├── components/               # Reusable React components
│   ├── AddNewUser.tsx        # Add new user form
│   ├── AdminUsers.tsx        # Admin users list
│   ├── AuthLayout.tsx        # Authentication page layout
│   ├── ChangePasswordModal.tsx # Password change modal
│   ├── Dashboard.tsx         # User dashboard
│   ├── EditUser.tsx          # Edit user form
│   ├── LoginForm.tsx         # Login form
│   ├── LoginHero.tsx         # Login page hero section
│   ├── MeProfile.tsx         # Current user profile
│   ├── Navbar.tsx            # Navigation bar
│   ├── PasswordSetupForm.tsx # Password setup form
│   ├── ProtectedRoute.tsx    # Route protection wrapper
│   ├── RegisterForm.tsx      # Registration form
│   ├── RegisterHero.tsx      # Registration page hero section
│   └── UserProfile.tsx       # User profile view
├── contexts/                 # React context providers
│   ├── AuthContext.tsx       # Authentication context
│   ├── AuthContextCreated.tsx # Auth context creation
│   ├── AuthProvider.tsx      # Auth provider component
│   └── NotificationProvider.tsx # Notification context
├── hooks/                    # Custom React hooks
├── pages/                    # Page components
│   ├── Login.tsx             # Login page
│   ├── Register.tsx          # Registration page
│   ├── ForgotPassword.tsx    # Password reset page
│   ├── SetupPassword.tsx     # Password setup page
│   ├── DashboardPage.tsx     # User dashboard page
│   ├── MeProfilePage.tsx     # Current user profile page
│   ├── UserProfilePage.tsx   # User profile view page
│   ├── AdminUsersPage.tsx    # Admin users management
│   ├── AddNewUserPage.tsx    # Add new user page
│   ├── EditUserPage.tsx      # Edit user page
│   ├── SyncLogout.tsx        # Logout sync page
│   └── admin-area/           # Admin-specific pages
│       ├── AdminDashboard.tsx # Admin dashboard
│       └── RoleCrudOperations.tsx # Role management
├── theme/                    # Theme configuration
├── utils/                    # Utility functions
├── config.ts                 # Environment configuration
├── App.tsx                   # Main app component
├── main.tsx                  # Application entry point
├── index.css                 # Global styles
└── vite-env.d.ts            # Vite environment types
```

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Access to the Identity API backend
- Environment variables configured (see Configuration section)

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Configure environment variables (see Configuration section below)

### Development

Start the development server:

```bash
pnpm start
```

The application will be available at `http://identity.asafarim.local:5177` (or configured host/port).

### Building

Build for production:

```bash
pnpm build
```

The optimized build output will be in the `dist/` directory.

### Preview

Preview the production build locally:

```bash
pnpm preview
```

## Configuration

### Environment Variables

The application uses environment files for configuration:

**Development (.env):**
```
VITE_IDENTITY_API_URL=https://identity.asafarim.be
VITE_IS_PRODUCTION=false
VITE_TASKS_URL=https://taskmanagement.asafarim.be
```

**Production (.env.production):**
```
VITE_IDENTITY_API_URL=https://identity.asafarim.be
VITE_IS_PRODUCTION=true
VITE_TASKS_URL=https://taskmanagement.asafarim.be
```

### Key Configuration

- `VITE_IDENTITY_API_URL`: Base URL for the Identity API
- `VITE_IS_PRODUCTION`: Flag indicating production environment
- `VITE_TASKS_URL`: URL for the task management application

The app automatically switches between development and production configurations based on the environment.

## Routing

The application uses React Router with the following route structure:

### Public Routes (Unauthenticated)
- `/login` - User login page
- `/register` - User registration page
- `/forgot-password` - Password reset request
- `/setup-password` - Initial password setup

### Protected Routes (Authenticated)
- `/dashboard` - User dashboard
- `/me` - Current user profile
- `/admin-area` - Admin dashboard
- `/admin-area/users` - User management
- `/admin-area/users/add` - Add new user
- `/admin-area/roles` - Role management
- `/admin-area/user-profile/:id` - View user profile
- `/admin-area/edit-user/:id` - Edit user

### Special Routes
- `/logout` - Clear authentication and redirect to login
- `/sync-logout` - Synchronize logout across sessions
- `/` - Redirects to `/login`

## Authentication

The application implements a robust authentication system:

### Authentication Flow

1. **Login/Register:** Users provide credentials which are validated against the Identity API
2. **Token Storage:** Authentication tokens are stored in localStorage
3. **Protected Routes:** Routes are protected using the `ProtectedRoute` component
4. **Auto-login:** On app load, the auth context checks for stored tokens and user info
5. **Logout:** Clears stored tokens and redirects to login page

### Auth Context

The `AuthContext` provides:
- Current user information
- Authentication state (loading, error)
- Login/register/logout functions
- Password setup and change functions
- Password setup requirement state

### Protected Route Component

The `ProtectedRoute` component:
- Checks authentication status
- Redirects unauthenticated users to login
- Redirects authenticated users away from public routes
- Handles loading states during auth initialization

## Features

### User Authentication
- Secure login with email and password
- User registration with validation
- Password reset via email
- Initial password setup for new users
- Session management with token-based authentication

### User Profile Management
- View personal profile information
- Edit profile details
- Change password
- View other user profiles (admin)

### Administrative Features
- User management (create, read, update, delete)
- Role management (create, read, update, delete)
- User search and filtering
- Bulk user operations
- User status management

### User Experience
- Responsive design for all screen sizes
- Toast notifications for user feedback
- Error handling and validation messages
- Loading states for async operations
- Multi-language support (i18n)
- Modern UI with design tokens

## Code Quality

### Linting

Run ESLint to check code quality:

```bash
pnpm lint
```

### TypeScript

The project uses TypeScript for type safety. Configuration files:
- `tsconfig.json` - Main TypeScript configuration
- `tsconfig.app.json` - Application-specific settings
- `tsconfig.node.json` - Build tool configuration

### ESLint Configuration

The project uses ESLint with TypeScript support. Configuration is in `eslint.config.js` with:
- TypeScript parser and rules
- React hooks rules
- React refresh rules
- Global ignore patterns

## Shared Packages

The application uses several shared packages from the monorepo:

- `@asafarim/design-tokens` - Design system tokens (colors, spacing, typography)
- `@asafarim/react-themes` - Theme provider and theme utilities
- `@asafarim/shared-ui-react` - Reusable UI components
- `@asafarim/shared-i18n` - Internationalization support
- `@asafarim/shared-validation` - Form validation utilities
- `@asafarim/shared-logging` - Logging utilities
- `@asafarim/toast` - Toast notification system
- `@asafarim/react-privacy-consent` - Privacy consent banner

## Development Workflow

### Adding New Pages

1. Create a new component in `src/pages/`
2. Create supporting components in `src/components/` if needed
3. Add the route to `App.tsx`
4. Wrap with `ProtectedRoute` if authentication is required

### Adding New Components

1. Create the component in `src/components/`
2. Use shared UI components from `@asafarim/shared-ui-react`
3. Apply design tokens for styling
4. Export from component index if needed

### API Integration

Use the `identityService` from `src/api/identityService.ts` for all API calls:

```typescript
import { identityService } from '../api/identityService';

// Example: Login
const response = await identityService.login(email, password);
```

## Performance Optimization

- **Code Splitting:** Routes are lazy-loaded where appropriate
- **Dependency Optimization:** Vite's optimizeDeps pre-bundles dependencies
- **Deduplication:** React and React-DOM are deduplicated
- **Build Optimization:** Production builds are minified and optimized

## Browser Support

The application supports modern browsers with ES2020+ support:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# The start script automatically kills the port
pnpm start
```

**Module Resolution Issues:**
- Clear `node_modules` and reinstall: `pnpm install`
- Clear Vite cache: `rm -rf dist .vite`

**Authentication Issues:**
- Check environment variables are correctly set
- Verify Identity API is accessible
- Check browser console for detailed error messages

**Build Failures:**
- Ensure TypeScript compilation succeeds: `tsc -b`
- Check for missing dependencies: `pnpm install`
- Clear build cache: `rm -rf dist`

## Contributing

When contributing to the Identity Portal:

1. Follow the existing code structure and naming conventions
2. Use TypeScript for type safety
3. Apply design tokens for consistent styling
4. Write meaningful commit messages
5. Test changes in both development and production builds
6. Update documentation as needed

## License

This project is part of the Asafarim ecosystem and follows the project's licensing terms.
