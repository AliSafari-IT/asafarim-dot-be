# Freelance Toolkit UI

Modern React TypeScript frontend for the Freelance Toolkit application.

## Features

- 🎨 **Modern UI** - Built with React 18 and TypeScript
- 🎯 **Design Tokens** - Uses shared ASafariM design tokens for consistent styling
- 🔐 **Authentication** - JWT-based auth with automatic token refresh
- 📱 **Responsive** - Mobile-friendly responsive design
- 🎭 **Protected Routes** - Route-based access control
- ✉️ **Email Integration** - Send proposals and invoices to clients
- 📄 **PDF Generation** - Professional PDF exports
- ✅ **Form Validation** - Client-side validation with error boundaries
- 🎯 **Error Handling** - User-friendly error messages and recovery

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Vite** - Build tool and dev server
- **@asafarim/shared-ui-react** - Shared UI components
- **@asafarim/shared-tokens** - Design tokens

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (workspace package manager)

### Installation

```bash
# From the repository root
pnpm install

# From this directory
cd apps/freelance-toolkit-ui
pnpm dev
```

### Environment Variables

Create a `.env` file in this directory:

```env
VITE_API_URL=http://freelance-toolkit.asafarim.local:5107/api
```

### Development

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Lint code
pnpm lint
```

The app will be available at: <http://freelance-toolkit.asafarim.local:5180>

## Project Structure

```
src/
├── api/          # API client and service functions
├── components/   # Reusable React components
├── contexts/     # React context providers
├── pages/        # Page components (routes)
├── App.tsx       # Main app component with layout
├── App.css       # App-level styles
├── main.tsx      # Entry point
└── index.css     # Global styles with design tokens
```

## Feature Overview

### Dashboard

- Overview of key metrics
- Recent activity
- Quick stats

### Proposals

- Create and manage proposals with line items
- Send to clients via email with PDF attachment
- Track status (Draft, Sent, Viewed, Accepted, Rejected)
- Version history and change tracking
- PDF generation with professional templates
- Form validation with error boundaries
- Client email delivery confirmation

### Invoices

- Create invoices from proposals
- Track payment status
- Send to clients
- PDF generation
- Payment tracking

### Clients (CRM)

- Manage client contacts
- Tag and categorize
- View client details and history
- Track proposals and invoices per client

### Calendar

- Schedule meetings
- View availability
- Send booking confirmations
- Manage appointments

### Settings

- User profile
- Company branding
- Email preferences
- Calendar settings

## API Integration

The frontend communicates with the backend API at `/api` (proxied by Vite in development).

- **Authentication**: JWT tokens stored in localStorage
- **Auto-refresh**: Tokens are automatically refreshed before expiry
- **Error Handling**: Automatic redirect to login on 401 errors

## Design System

This app uses shared design tokens from `@asafarim/shared-tokens`:

```css
/* Examples */
var(--color-primary)
var(--color-background)
var(--color-text)
var(--font-family-sans)
```

All styling should use these tokens for consistency across the platform.

## Key Implementation Details

### Form Validation & Error Handling

- **FormErrorBoundary**: Reusable component for displaying validation errors
- **Field-level errors**: Visual feedback for invalid fields
- **Error messages**: Clear, actionable messages from backend validation
- **Location**: `packages/shared-ui-react/components/FormErrorBoundary`

### Email Integration

- **Proposal sending**: One-click email delivery with PDF attachment
- **Status tracking**: Real-time feedback on send success/failure
- **Error recovery**: User-friendly error messages with retry options
- **Configuration**: Backend handles SMTP configuration

### PDF Generation

- **Professional templates**: Company branding and formatting
- **Date formatting**: Proper date display in PDFs
- **Line items**: Detailed proposal/invoice breakdowns
- **Download support**: Direct PDF download from browser

## Getting Started

1. Install dependencies: `pnpm install`
2. Configure environment: Create `.env` file with API URL
3. Start backend API: `cd ../../apis/FreelanceToolkit.Api && dotnet run`
4. Start frontend: `pnpm dev`
5. Navigate to <http://freelance-toolkit.asafarim.local:5180>

## Troubleshooting

### Email not sending

- Check backend `appsettings.json` for SMTP configuration
- Verify Gmail app password (not regular password)
- Check backend logs in `logs/` directory

### PDF date formatting issues

- Ensure `CreatedAt` is properly mapped in backend DTOs
- Check date format strings in PDF templates

### Form validation errors

- Check browser console for API response details
- Verify backend validation rules in FluentValidation validators
- Ensure error boundary is properly integrated

## License

Private - ASafariM Platform
