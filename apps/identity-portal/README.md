# Identity Portal

A comprehensive identity and access management (IAM) web application built with React 18, TypeScript, and Vite. The Identity Portal provides user authentication, profile management, role-based access control (RBAC), and administrative user management capabilities for the Asafarim ecosystem.

## Overview

The Identity Portal is a modern, responsive single-page application (SPA) that serves as the central authentication and user management hub for all Asafarim applications. It provides secure login/registration, user profile management, password management, and administrative controls for managing users and roles.

**Live URL:** https://identity.asafarim.be

**Key Features:**
- 🔐 **User Authentication:** Secure login, registration, and password reset
- 👤 **Profile Management:** View and edit personal information
- 🔑 **Password Management:** Initial setup and password change functionality
- 🛡️ **Role-Based Access Control (RBAC):** Fine-grained permission management
- 👥 **Admin User Management:** Create, edit, view, and delete users
- 🎭 **Role Management:** Create and manage application roles
- 🔄 **Session Management:** Synchronized logout across multiple sessions
- 📱 **Responsive Design:** Mobile-first, works on all screen sizes
- 🌍 **Multi-Language Support:** i18n with language preferences
- 🎨 **Modern UI:** Design tokens and shared component library
- 🔔 **Toast Notifications:** Real-time user feedback
- ⚡ **Performance:** Optimized builds with code splitting
- 🔒 **Privacy Consent:** Built-in privacy consent banner

## Tech Stack

### Core Technologies
- **Frontend Framework:** React 18.3.1
- **Language:** TypeScript 5.8.3
- **Build Tool:** Vite 7.1.2
- **Routing:** React Router DOM 6.30.1
- **Package Manager:** pnpm (workspace)

### Styling & UI
- **Design System:** `@asafarim/design-tokens` v0.4.1
- **UI Components:** `@asafarim/shared-ui-react` (workspace)
- **Icons:** Lucide React 0.548.0
- **Theming:** `@asafarim/react-themes` (workspace)

### Features & Utilities
- **Notifications:** `@asafarim/toast` v1.2.0
- **Internationalization:** `@asafarim/shared-i18n` (workspace)
- **Validation:** `@asafarim/shared-validation` (workspace)
- **Logging:** `@asafarim/shared-logging` (workspace)
- **Privacy:** `@asafarim/react-privacy-consent` v1.7.2

### Development Tools
- **Linting:** ESLint 9.33.0 with TypeScript support
- **Type Checking:** TypeScript 5.8.3
- **React Plugins:** Vite React plugin, React Hooks ESLint plugin

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

1. **Clone the repository** (if not already done):
```bash
git clone https://github.com/yourusername/asafarim-dot-be.git
cd asafarim-dot-be
```

2. **Install dependencies** (from monorepo root):
```bash
pnpm install
```

3. **Configure environment variables:**
Create `.env` file in `apps/identity-portal/`:
```bash
cp apps/identity-portal/.env.example apps/identity-portal/.env
```

4. **Edit environment variables** (see Configuration section below)

### Development

Start the development server:

```bash
# From monorepo root
pnpm --filter @asafarim/identity-portal start

# Or from apps/identity-portal directory
cd apps/identity-portal
pnpm start
```

The application will be available at:
- **Local:** `http://identity.asafarim.local:5177`
- **Network:** `http://<your-ip>:5177`

**Development Features:**
- Hot Module Replacement (HMR) for instant updates
- React Fast Refresh for component state preservation
- TypeScript type checking in real-time
- ESLint integration for code quality

### Building

Build for production:

```bash
# From monorepo root
pnpm --filter @asafarim/identity-portal build

# Or from apps/identity-portal directory
cd apps/identity-portal
pnpm build
```

The optimized build output will be in the `dist/` directory.

**Build Optimizations:**
- Minified JavaScript and CSS
- Tree-shaking for smaller bundle sizes
- Code splitting for lazy-loaded routes
- Asset optimization (images, fonts)
- Source maps for debugging

### Preview

Preview the production build locally:

```bash
pnpm preview
```

The preview server will start at `http://localhost:4173`

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

| Variable | Description | Example |
|----------|-------------|----------|
| `VITE_IDENTITY_API_URL` | Base URL for the Identity API | `https://identity.asafarim.be` |
| `VITE_IS_PRODUCTION` | Flag indicating production environment | `true` or `false` |
| `VITE_TASKS_URL` | URL for the task management application | `https://taskmanagement.asafarim.be` |

**Important Notes:**
- All Vite environment variables must be prefixed with `VITE_`
- Variables are embedded at build time (not runtime)
- The app automatically switches configurations based on the build mode
- Never commit sensitive data to `.env` files
- Use `.env.local` for local overrides (git-ignored)

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
- **Secure Login:** Email and password authentication with JWT tokens
- **User Registration:** Self-service registration with email validation
- **Password Reset:** Email-based password recovery flow
- **Password Setup:** Initial password setup for admin-created users
- **Session Management:** Token-based authentication with refresh tokens
- **Auto-login:** Persistent sessions with localStorage
- **Logout:** Secure logout with token invalidation
- **Sync Logout:** Cross-tab logout synchronization

### User Profile Management
- **View Profile:** Display personal information and preferences
- **Edit Profile:** Update name, email, and other details
- **Change Password:** Secure password change with current password verification
- **Language Preferences:** Select preferred language (persisted)
- **Theme Preferences:** Light/dark theme selection (coming soon)
- **View Other Profiles:** Admin can view any user's profile

### Administrative Features
- **User Management:**
  - Create new users with email invitation
  - View all users with pagination
  - Edit user details and roles
  - Delete users (with confirmation)
  - Search and filter users
  - User status management
- **Role Management:**
  - Create custom roles
  - Assign roles to users
  - View role permissions
  - Delete unused roles
- **Admin Dashboard:** Overview of system statistics

### User Experience
- **Responsive Design:** Mobile-first, works on all devices
- **Toast Notifications:** Real-time feedback for user actions
- **Error Handling:** Graceful error messages and recovery
- **Form Validation:** Client-side validation with helpful messages
- **Loading States:** Visual feedback for async operations
- **Accessibility:** ARIA labels and keyboard navigation
- **Multi-Language:** i18n support with language switcher
- **Modern UI:** Consistent design with design tokens
- **Privacy Consent:** GDPR-compliant consent banner

## Code Quality

### Linting

Run ESLint to check code quality:

```bash
# Check for issues
pnpm lint

# Auto-fix issues
pnpm lint --fix
```

### TypeScript

The project uses TypeScript for type safety and better developer experience.

**Configuration Files:**
- `tsconfig.json` - Main TypeScript configuration
- `tsconfig.app.json` - Application-specific settings
- `tsconfig.node.json` - Build tool configuration

**Type Checking:**
```bash
# Check types without building
tsc --noEmit

# Build with type checking
pnpm build
```

### ESLint Configuration

The project uses ESLint 9 with flat config format (`eslint.config.js`):

**Enabled Rules:**
- TypeScript ESLint parser and recommended rules
- React Hooks rules for proper hook usage
- React Refresh rules for HMR compatibility
- Custom rules for code consistency

**Ignored Patterns:**
- `dist/` - Build output
- `node_modules/` - Dependencies
- `.vite/` - Vite cache

### Code Style Guidelines

- Use functional components with hooks
- Prefer `const` over `let`, avoid `var`
- Use TypeScript interfaces for props
- Follow naming conventions:
  - Components: PascalCase (`UserProfile.tsx`)
  - Hooks: camelCase with `use` prefix (`useAuth.ts`)
  - Utilities: camelCase (`formatDate.ts`)
  - Constants: UPPER_SNAKE_CASE
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use shared UI components from `@asafarim/shared-ui-react`

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

1. **Create page component** in `src/pages/`:
```typescript
// src/pages/NewPage.tsx
import { FC } from 'react';

export const NewPage: FC = () => {
  return (
    <div>
      <h1>New Page</h1>
    </div>
  );
};
```

2. **Create supporting components** in `src/components/` if needed

3. **Add route** to `App.tsx`:
```typescript
import { NewPage } from './pages/NewPage';

// In routes:
<Route path="/new-page" element={
  <ProtectedRoute>
    <NewPage />
  </ProtectedRoute>
} />
```

4. **Add navigation link** if needed in `Navbar.tsx`

### Adding New Components

1. **Create component** in `src/components/`:
```typescript
// src/components/MyComponent.tsx
import { FC } from 'react';
import { Button } from '@asafarim/shared-ui-react';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export const MyComponent: FC<MyComponentProps> = ({ title, onAction }) => {
  return (
    <div>
      <h2>{title}</h2>
      <Button onClick={onAction}>Action</Button>
    </div>
  );
};
```

2. **Use shared UI components** from `@asafarim/shared-ui-react`
3. **Apply design tokens** for consistent styling
4. **Export** from component index if creating a library

### API Integration

Use the `identityService` from `src/api/identityService.ts` for all API calls:

```typescript
import { identityService } from '../api/identityService';
import { useAuth } from '../contexts/AuthContext';

// Example: Login
const handleLogin = async (email: string, password: string) => {
  try {
    const response = await identityService.login(email, password);
    // Handle success
  } catch (error) {
    // Handle error
    console.error('Login failed:', error);
  }
};

// Example: Get current user
const { user } = useAuth();

// Example: Update user profile
const updateProfile = async (data: UpdateProfileData) => {
  try {
    await identityService.updateProfile(data);
    // Show success toast
  } catch (error) {
    // Show error toast
  }
};
```

**Available API Methods:**
- `login(email, password)` - Authenticate user
- `register(userData)` - Register new user
- `logout()` - Logout current user
- `refreshToken(refreshToken)` - Refresh access token
- `getCurrentUser()` - Get current user profile
- `updateProfile(data)` - Update user profile
- `changePassword(oldPassword, newPassword)` - Change password
- `setupPassword(token, password)` - Setup initial password
- `forgotPassword(email)` - Request password reset
- `resetPassword(token, newPassword)` - Reset password
- `getUsers(page, pageSize)` - Get all users (admin)
- `getUserById(id)` - Get user by ID (admin)
- `createUser(userData)` - Create new user (admin)
- `updateUser(id, userData)` - Update user (admin)
- `deleteUser(id)` - Delete user (admin)
- `getRoles()` - Get all roles
- `createRole(name)` - Create new role (admin)
- `deleteRole(id)` - Delete role (admin)

## Performance Optimization

### Build-Time Optimizations
- **Code Splitting:** Routes are lazy-loaded for smaller initial bundle
- **Tree Shaking:** Unused code is eliminated from production builds
- **Minification:** JavaScript and CSS are minified
- **Asset Optimization:** Images and fonts are optimized
- **Dependency Pre-bundling:** Vite's optimizeDeps pre-bundles dependencies
- **Deduplication:** React and React-DOM are deduplicated across workspace

### Runtime Optimizations
- **React.memo:** Prevent unnecessary re-renders
- **useMemo/useCallback:** Memoize expensive computations
- **Lazy Loading:** Components loaded on-demand
- **Virtual Scrolling:** For large lists (if implemented)
- **Debouncing:** Search and input handlers
- **Image Lazy Loading:** Native lazy loading for images

### Performance Monitoring
```bash
# Analyze bundle size
pnpm build
# Check dist/ folder size and composition

# Use Vite's built-in analyzer
pnpm build --mode analyze
```

### Performance Best Practices
- Keep component render functions pure
- Avoid inline function definitions in JSX
- Use proper key props in lists
- Minimize context re-renders
- Optimize images before importing
- Use CSS variables for theming (faster than JS)

## Browser Support

The application targets modern browsers with ES2020+ support:

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 90+ | Fully supported |
| Edge | 90+ | Fully supported |
| Firefox | 88+ | Fully supported |
| Safari | 14+ | Fully supported |
| Opera | 76+ | Fully supported |
| Samsung Internet | 15+ | Fully supported |

**Not Supported:**
- Internet Explorer (all versions)
- Legacy Edge (pre-Chromium)
- Browsers without ES2020 support

**Required Browser Features:**
- ES2020 JavaScript features
- CSS Grid and Flexbox
- CSS Custom Properties (variables)
- Fetch API
- LocalStorage
- Modern DOM APIs

## Deployment

### Production Build

1. **Set production environment variables** in `.env.production`

2. **Build the application:**
```bash
pnpm build
```

3. **Test the production build:**
```bash
pnpm preview
```

### Deployment Options

#### Static Hosting (Recommended)

Deploy the `dist/` folder to any static hosting service:

**Netlify:**
```bash
# Install Netlify CLI
pnpm add -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

**Vercel:**
```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel --prod
```

**Nginx:**
```nginx
server {
    listen 443 ssl http2;
    server_name identity.asafarim.be;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    root /var/www/identity-portal/dist;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

**Apache:**
```apache
<VirtualHost *:443>
    ServerName identity.asafarim.be
    DocumentRoot /var/www/identity-portal/dist

    SSLEngine on
    SSLCertificateFile /path/to/cert.pem
    SSLCertificateKeyFile /path/to/key.pem

    <Directory /var/www/identity-portal/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        # SPA fallback
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

### Environment-Specific Builds

```bash
# Development build
pnpm build --mode development

# Production build
pnpm build --mode production

# Staging build (if configured)
pnpm build --mode staging
```

### Post-Deployment Checklist

- [ ] Verify all environment variables are set correctly
- [ ] Test authentication flow (login, register, logout)
- [ ] Test admin features (if applicable)
- [ ] Check browser console for errors
- [ ] Verify API connectivity
- [ ] Test on multiple browsers and devices
- [ ] Check SSL certificate validity
- [ ] Verify CORS configuration
- [ ] Test password reset flow
- [ ] Monitor application logs

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# The start script automatically kills the port
pnpm start

# Or manually kill the port
npx kill-port 5177
```

#### Module Resolution Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules
pnpm install

# Clear Vite cache
rm -rf dist .vite node_modules/.vite

# Rebuild from monorepo root
cd ../../
pnpm install
pnpm build
```

#### Authentication Issues

**Symptoms:** Cannot login, token errors, 401 responses

**Solutions:**
1. Check environment variables are correctly set:
   ```bash
   cat .env
   # Verify VITE_IDENTITY_API_URL is correct
   ```

2. Verify Identity API is accessible:
   ```bash
   curl https://identity.asafarim.be/health
   ```

3. Check browser console for detailed error messages

4. Clear localStorage and try again:
   ```javascript
   // In browser console
   localStorage.clear();
   location.reload();
   ```

5. Verify CORS is configured on the API

6. Check network tab for failed requests

#### Build Failures

**TypeScript Errors:**
```bash
# Check types without building
tsc --noEmit

# Fix type errors and rebuild
pnpm build
```

**Missing Dependencies:**
```bash
# Reinstall dependencies
pnpm install

# Check for peer dependency warnings
pnpm install --force
```

**Cache Issues:**
```bash
# Clear all caches
rm -rf dist .vite node_modules/.vite
pnpm build
```

#### Runtime Errors

**White Screen / Blank Page:**
1. Check browser console for errors
2. Verify build completed successfully
3. Check that `index.html` exists in `dist/`
4. Verify server is serving the correct directory
5. Check for JavaScript errors in production build

**API Connection Errors:**
1. Verify `VITE_IDENTITY_API_URL` is correct
2. Check API is running and accessible
3. Verify CORS configuration on API
4. Check network tab for failed requests
5. Verify SSL certificates if using HTTPS

**Routing Issues (404 on Refresh):**
1. Configure server for SPA routing (see Deployment section)
2. Verify `try_files` directive in Nginx
3. Check `.htaccess` rewrite rules in Apache
4. Ensure `index.html` fallback is configured

### Debug Mode

Enable debug logging:

```typescript
// In src/config.ts or main.tsx
if (import.meta.env.DEV) {
  console.log('Debug mode enabled');
  console.log('API URL:', import.meta.env.VITE_IDENTITY_API_URL);
}
```

### Getting Help

If you encounter issues:

1. Check this README's troubleshooting section
2. Review browser console errors
3. Check API logs for backend issues
4. Review Vite documentation: https://vitejs.dev
5. Review React Router documentation: https://reactrouter.com
6. Contact support: ali@asafarim.com

## Contributing

When contributing to the Identity Portal:

### Code Standards
1. **Follow existing code structure** and naming conventions
2. **Use TypeScript** for all new code with proper types
3. **Apply design tokens** for consistent styling
4. **Use shared components** from `@asafarim/shared-ui-react`
5. **Write meaningful commit messages** following conventional commits
6. **Test changes** in both development and production builds
7. **Update documentation** for significant changes
8. **Add comments** for complex logic

### Pull Request Process
1. Create a feature branch from `main`
2. Make your changes with clear, atomic commits
3. Test thoroughly in development mode
4. Build and test production build
5. Update README if needed
6. Submit pull request with description
7. Address review feedback

### Commit Message Format
```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Example:**
```
feat(auth): add password strength indicator

Added visual password strength indicator to registration
and password change forms using zxcvbn library.

Closes #123
```

## Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Register new user
- [ ] Logout
- [ ] Password reset flow
- [ ] Password setup flow
- [ ] Token refresh
- [ ] Session persistence

**User Profile:**
- [ ] View profile
- [ ] Edit profile
- [ ] Change password
- [ ] Update language preference

**Admin Features:**
- [ ] View users list
- [ ] Create new user
- [ ] Edit user
- [ ] Delete user
- [ ] Manage roles
- [ ] View user profile

**UI/UX:**
- [ ] Responsive design on mobile
- [ ] Responsive design on tablet
- [ ] Toast notifications appear
- [ ] Loading states display
- [ ] Error messages are clear
- [ ] Navigation works correctly

### Browser Testing

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Security Considerations

### Authentication Security
- JWT tokens stored in localStorage (consider httpOnly cookies for enhanced security)
- Tokens automatically refreshed before expiration
- Logout invalidates refresh tokens on server
- Password strength requirements enforced
- HTTPS required in production

### Data Protection
- No sensitive data logged to console in production
- API keys and secrets in environment variables
- CORS properly configured on API
- XSS protection via React's built-in escaping
- CSRF protection via token-based auth

### Best Practices
- Keep dependencies updated
- Regular security audits: `pnpm audit`
- Use HTTPS in production
- Implement Content Security Policy (CSP)
- Enable security headers (see Nginx config)
- Regular backups of user data
- Monitor for suspicious activity

## License

ISC License - Copyright (c) ASafariM

This project is part of the Asafarim ecosystem.

## Support & Contact

- **Email:** ali@asafarim.com
- **Website:** https://asafarim.be
- **Documentation:** https://docs.asafarim.be
- **API Documentation:** https://identity.asafarim.be/swagger

## Acknowledgments

- React team for the amazing framework
- Vite team for the blazing-fast build tool
- All contributors to the Asafarim ecosystem
- Open source community

## Version History

### v0.7.0 (Current)
- Enhanced user profile management
- Improved admin dashboard
- Language preference support
- Performance optimizations
- Updated dependencies
- Improved error handling

### v0.6.0
- Role management interface
- User search and filtering
- Toast notification system
- Privacy consent banner
- Multi-language support

### v0.5.0
- Initial admin user management
- Password setup flow
- Responsive design improvements
- Design token integration

See git history for detailed changelog.
