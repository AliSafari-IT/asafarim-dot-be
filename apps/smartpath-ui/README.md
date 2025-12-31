# SmartPath UI

Frontend application for SmartPath - Family Learning & Homework Tracker for children aged 9-14.

Provides comprehensive UI for family management, course learning, practice sessions, rewards tracking, and graph-based pathfinding visualization.

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
- **VITE_SMARTPATH_API_URL**: SmartPath.Api base URL

## Project Structure

```
smartpath-ui/
├── src/
│   ├── api/              # API client services (practiceApi, graphService, smartpathService)
│   ├── components/       # Reusable components (Navbar, GraphCanvas, PathfindingPanel, ProtectedRoute)
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
- **Practice** - Practice session interface for children with next-item flow and attempt submission
- **Practice Manager** - Manager page for creating and managing practice items by lesson
- **Practice Dashboard** - Analytics dashboard showing child performance, streaks, accuracy, and weak lessons
- **Rewards** - Achievement and reward tracking with badges and streaks
- **Graphs** - Graph visualization and management with pathfinding capabilities
- **Graph Editor** - Interactive graph editor with node/edge management and pathfinding visualization
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
- Practice API client with session, attempt, item, and dashboard endpoints
- Graph service for graph management and pathfinding

### Design System

Uses shared design tokens from `@asafarim/shared-tokens`:

- CSS variables for theming (--color-*, --space-*, --radius-*, etc.)
- Consistent color palette with light/dark mode support
- Typography scale with Lato font family
- Spacing system (--space-*)
- Border radius tokens (--radius-*)
- Shadow effects (--shadow-*)
- Motion tokens (--duration-*, --easing-*)

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

- Navigation menu with dashboard, tasks, learning, progress, family, practice, rewards, practice manager, practice dashboard, and graphs links
- User display with logout functionality
- Theme toggle integration
- Icons for all navigation items (Lucide icons)

### AddMemberModal

- Email-based member invitation
- Role selection for admins (familyMember, familyManager)
- Error handling and success feedback

### ProtectedRoute

- Authentication guard for protected pages
- Loading state while checking auth
- Automatic redirect to login if not authenticated

### GraphCanvas

- Interactive graph visualization with draggable nodes
- Node creation, selection, and deletion
- Edge visualization with weights
- Canvas-based rendering for performance

### PathfindingPanel

- Algorithm selection (A*, Dijkstra)
- Start/end node selection
- Pathfinding execution and result display
- Step-by-step path visualization with cost tracking

## API Integration Details

### Token Management

- Access token stored as `auth_token` in localStorage
- Refresh token stored as `refresh_token` in localStorage
- Automatic token refresh on 401 response
- Tokens cleared on logout

### Family Roles

- `familyManager` - Can add/remove family members, create/edit practice items, view practice dashboard
- `familyMember` - Read-only access to family data, can participate in practice sessions
- Admin users can override family-level restrictions

### Practice Endpoints

- `POST /practice/sessions` - Create practice session
- `POST /practice/sessions/{sessionId}/complete` - Complete session
- `POST /practice/sessions/{sessionId}/next-item` - Get next practice item
- `POST /practice/attempts` - Submit practice attempt
- `GET /practice/children/{childId}/summary` - Get child practice summary
- `GET /practice/families/{familyId}/summary` - Get family children summaries
- `GET /practice/achievements` - Get available achievements

### Practice Item Endpoints (Manager Only)

- `GET /practice-items/lessons/{lessonId}` - Get items for lesson
- `POST /practice-items` - Create practice item
- `PUT /practice-items/{itemId}` - Update practice item
- `DELETE /practice-items/{itemId}` - Soft delete practice item

### Practice Dashboard Endpoint

- `GET /practice-dashboard/families/{familyId}` - Get family practice dashboard with child analytics

### Graph Endpoints

- `GET /graphs` - List all graphs
- `GET /graphs/{graphId}` - Get graph details
- `POST /graphs` - Create graph
- `PUT /graphs/{graphId}` - Update graph
- `DELETE /graphs/{graphId}` - Delete graph
- `POST /graphs/{graphId}/find-path` - Find shortest path

### Core Endpoints

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
- `@asafarim/shared-tokens` - Design tokens CSS
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

### Practice Session Loop Fix (Latest)

- **Session-Scoped Attempts**: Frontend properly tracks attempts within each session
- **Session Completion**: When all practice items in a session are attempted, frontend receives error and completes the session
- **Completion Screen**: Shows "Session Complete!" with total points and attempts count
- **Error Handling**: Improved error messages for missing practice items with guidance to create items in Practice Manager
- **Backend SessionId**: API now tracks attempts per session (SessionId in PracticeAttempt) preventing cross-session item reuse

### Practice Content & Manager Dashboard

- **Practice Sessions**: Children can start practice sessions for lessons
- **Practice Items**: Managers create/edit/delete practice items with questions, answers, points, and difficulty
- **Next Item Flow**: Dynamic next-item selection excluding already attempted items in current session
- **Answer Scoring**: Automatic answer normalization and scoring based on item configuration
- **Practice Dashboard**: Managers view child performance with:
  - Total points earned
  - Current streak days
  - Accuracy percentage
  - Recent attempts with results
  - Weak lessons (low accuracy areas)
- **Soft Delete**: Practice items use IsActive flag for soft deletion
- **Timestamps**: Auto-updated CreatedAt/UpdatedAt on practice items

### Graph Pathfinding MVP

- **Graph Management**: Create, edit, delete graphs with interactive visualization
- **Node Management**: Add, position, and delete nodes with X, Y coordinates
- **Edge Management**: Create weighted, directed/undirected edges between nodes
- **Pathfinding Algorithms**: A* and Dijkstra implementations with step-by-step visualization
- **Path Visualization**: Interactive display of shortest paths with cost tracking
- **Graph Canvas**: Draggable nodes, edge visualization, and interactive editing

### Rewards & Achievements

- **Achievement Tracking**: Badge system with earned achievements per user
- **Streak Tracking**: Current and best streak days with freeze mechanics
- **Rewards Page**: Display achievements, streaks, and practice statistics

### UI/UX Improvements

- **Design Tokens**: Consistent styling using shared-tokens CSS variables
- **Responsive Design**: Mobile-friendly layouts for all pages
- **Loading States**: Skeleton loaders and spinners for async operations
- **Error Handling**: User-friendly error messages and recovery options
- **Empty States**: Clear messaging when no data is available
- **Modal Components**: Reusable modals for create/edit operations

### Testing

- Comprehensive test coverage for all pages and components
- Test IDs on all interactive elements
- Mock API responses for isolated testing
- Component and integration tests with Vitest

## Development Workflow

```bash
# Install dependencies
pnpm install

# Start development server with hot reload
pnpm start

# Run tests
pnpm test

# Build for production
pnpm build

# Preview production build
pnpm preview

# Lint and format code
pnpm lint
```

## Troubleshooting

### API Connection Issues

- Verify `VITE_SMARTPATH_API_URL` in `.env` matches running SmartPath.Api
- Verify `VITE_IDENTITY_API_URL` in `.env` matches running Identity.Api
- Check CORS configuration in both APIs includes frontend URL
- Clear browser cache and localStorage if tokens are stale

### Authentication Issues

- Ensure Identity.Api is running and accessible
- Check JWT key matches between Identity.Api and SmartPath.Api
- Verify cookies are enabled in browser
- Clear auth tokens and re-login if session is corrupted

### Graph Visualization Issues

- Ensure browser supports HTML5 Canvas
- Check graph data is properly formatted with valid node/edge references
- Verify node coordinates are within reasonable bounds

## License

MIT
