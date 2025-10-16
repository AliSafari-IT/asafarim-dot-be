# Portfolio Routes Configuration

Add these routes to your React Router configuration:

```tsx
import { Routes, Route } from 'react-router-dom';
import { 
  PortfolioPublicView, 
  PortfolioPreview, 
  PortfolioDashboard 
} from './pages/Portfolio';

// In your App.tsx or router configuration:
<Routes>
  {/* Public portfolio route - no authentication required */}
  <Route path="/u/:username" element={<PortfolioPublicView />} />
  
  {/* Private preview - requires authentication */}
  <Route path="/portfolio" element={<PortfolioPreview />} />
  
  {/* Dashboard - requires authentication */}
  <Route path="/dashboard/portfolio" element={<PortfolioDashboard />} />
</Routes>
```

## Route Descriptions

### `/u/:username` - Public Portfolio View
- **Public**: Yes (no authentication required)
- **Purpose**: Display user's public portfolio to visitors
- **Features**:
  - SEO-optimized with meta tags
  - Respects privacy settings (isPublic flag)
  - Dynamic sections based on user preferences
  - Responsive design

### `/portfolio` - Portfolio Preview
- **Public**: No (authentication required)
- **Purpose**: Allow users to preview their portfolio before making it public
- **Features**:
  - Shows preview banner
  - Quick link to dashboard
  - Displays portfolio exactly as visitors will see it

### `/dashboard/portfolio` - Portfolio Management
- **Public**: No (authentication required)
- **Purpose**: Manage portfolio settings and content
- **Features**:
  - Toggle public/private visibility
  - Configure public URL slug
  - Manage projects (CRUD operations)
  - View statistics
  - Quick preview and public page links

## Environment Variables

Add to your `.env` file:

```env
VITE_CORE_API_URL=https://core.asafarim.be/api
```

## Authentication

The portfolio service automatically includes the JWT token from localStorage:

```typescript
const token = localStorage.getItem('authToken');
```

Make sure your authentication flow stores the token with this key, or update the service accordingly.

## Navigation Examples

### Link to User's Portfolio
```tsx
<Link to={`/u/${username}`}>View Portfolio</Link>
```

### Link to Dashboard
```tsx
<Link to="/dashboard/portfolio">Manage Portfolio</Link>
```

### Link to Preview
```tsx
<Link to="/portfolio">Preview My Portfolio</Link>
```

## Current Implementation (main.tsx)

```tsx
import { createBrowserRouter } from 'react-router-dom';
import { Portfolio } from './components/Portfolio';
import { PortfolioPublicView } from './pages/Portfolio/PortfolioPublicView';
import { PortfolioDashboard } from './pages/Portfolio/PortfolioDashboard';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <CoreAppHome /> },
      { path: "portfolio", element: <Portfolio /> },
      { path: "u/:username", element: <PortfolioPublicView /> },
      { path: "dashboard/portfolio", element: <PortfolioDashboard /> },
      { path: "*", element: <NotFound /> },
    ]
  }
]);
```

## Protected Routes

If you want to protect certain routes, wrap them with your auth guard:

```tsx
import { ProtectedRoute } from './components/Auth/ProtectedRoute';

{
  path: "portfolio",
  element: (
    <ProtectedRoute>
      <Portfolio />
    </ProtectedRoute>
  )
}
```

## Route Parameters

### Public Portfolio Route
```tsx
// Access username parameter
const { username } = useParams<{ username: string }>();

// Example: /u/ali-safari
// username = "ali-safari"
```

## API Endpoints Used by Routes

### `/portfolio` (Preview)
- `GET /api/portfolio` - Fetch authenticated user's portfolio

### `/u/:username` (Public)
- `GET /api/portfolio/{username}` - Fetch public portfolio by slug

### `/dashboard/portfolio` (Dashboard)
- `GET /api/portfolio` - Fetch user's portfolio
- `GET /api/portfolio/settings` - Get settings
- `PUT /api/portfolio/settings` - Update settings
- `POST /api/portfolio/projects` - Create project
- `PUT /api/portfolio/projects/{id}` - Update project
- `DELETE /api/portfolio/projects/{id}` - Delete project

## Testing Routes

### Test Public Portfolio
```bash
# Visit in browser (no auth needed)
http://localhost:5173/u/ali-safari
```

### Test Preview
```bash
# Visit in browser (auth required)
http://localhost:5173/portfolio
```

### Test Dashboard
```bash
# Visit in browser (auth required)
http://localhost:5173/dashboard/portfolio
```
