# Freelance Toolkit UI - Freelance Business Management Dashboard

> A modern, professional React TypeScript frontend for comprehensive freelance business management. Provides proposal management, invoice tracking, client CRM, calendar scheduling, and PDF generation with JWT authentication and responsive design.

[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF.svg)](https://vitejs.dev/)
[![React Router](https://img.shields.io/badge/React%20Router-6.20-CA4245.svg)](https://reactrouter.com/)

## 🚀 Features

### 📊 Dashboard & Analytics

- **Key Metrics**: Overview of proposals, invoices, and revenue
- **Recent Activity**: Track recent proposals, invoices, and bookings
- **Quick Stats**: At-a-glance business metrics
- **Performance Tracking**: Monitor business growth and trends

### 💼 Proposal Management

- **Create & Edit**: Build proposals with line items and descriptions
- **Professional Templates**: Pre-designed proposal layouts
- **Version Control**: Track proposal changes and history
- **Status Tracking**: Monitor proposal status (Draft, Sent, Viewed, Accepted, Rejected)
- **Email Integration**: Send proposals directly to clients with PDF attachment
- **Public Links**: Share proposals via public links
- **PDF Export**: Download proposals as professional PDFs

### 📄 Invoice Management

- **Create from Proposals**: Generate invoices from existing proposals
- **Payment Tracking**: Monitor payment status and due dates
- **Email Delivery**: Send invoices to clients with payment instructions
- **PDF Export**: Professional invoice PDFs with company branding
- **Payment Status**: Mark invoices as paid, pending, or overdue
- **Recurring Invoices**: Set up recurring billing

### 👥 Client CRM

- **Contact Management**: Store and organize client information
- **Client History**: View all proposals and invoices per client
- **Tags & Categories**: Organize clients by type or project
- **Notes**: Add internal notes and communication history
- **Client Details**: Email, phone, address, and custom fields

### 📅 Calendar & Scheduling

- **Meeting Scheduling**: Book meetings and consultations
- **Availability Management**: Set available time slots
- **Booking Confirmations**: Automated confirmation emails
- **Calendar Integration**: View all bookings in calendar view
- **Appointment Reminders**: Automatic reminder notifications

### ⚙️ Settings & Configuration

- **User Profile**: Manage account settings
- **Company Branding**: Customize company details and logo
- **Email Preferences**: Configure email templates and settings
- **Calendar Settings**: Set working hours and availability
- **Notification Preferences**: Control notification types and frequency

### 🎨 User Experience

- **Dark Mode**: Full dark mode support with system preference detection
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Accessibility**: WCAG compliant with proper contrast and keyboard navigation
- **Modern UI**: Clean, professional design inspired by modern SaaS apps
- **Error Handling**: User-friendly error messages and recovery options
- **Form Validation**: Real-time client-side validation with helpful feedback

## 🏗️ Architecture

### Tech Stack

- **Framework**: React 18.2 with TypeScript 5.2
- **Build Tool**: Vite 5.0
- **Routing**: React Router DOM 6.20
- **HTTP Client**: Axios 1.6
- **Styling**: CSS with Design Tokens (@asafarim/design-tokens)
- **UI Components**: Shared UI library (@asafarim/shared-ui-react)
- **Theming**: React Themes (@asafarim/react-themes)
- **Calendar**: Booking Calendar (@asafarim/booking-calendar)
- **State Management**: React Hooks
- **Package Manager**: pnpm

### Project Structure

```
freelance-toolkit-ui/
├── src/
│   ├── pages/
│   │   ├── Dashboard.tsx              # Main dashboard
│   │   ├── ProposalsPage.tsx          # Proposals list & management
│   │   ├── ProposalDetail.tsx         # Proposal details & editing
│   │   ├── InvoicesPage.tsx           # Invoices list & management
│   │   ├── InvoiceDetail.tsx          # Invoice details & editing
│   │   ├── ClientsPage.tsx            # Clients CRM
│   │   ├── ClientDetail.tsx           # Client details
│   │   ├── CalendarPage.tsx           # Calendar & bookings
│   │   ├── SettingsPage.tsx           # User settings
│   │   └── LoginPage.tsx              # Authentication
│   ├── components/
│   │   ├── ProposalForm.tsx           # Proposal creation/editing
│   │   ├── InvoiceForm.tsx            # Invoice creation/editing
│   │   ├── ClientForm.tsx             # Client creation/editing
│   │   ├── LineItemsTable.tsx         # Line items editor
│   │   ├── StatusBadge.tsx            # Status indicator
│   │   ├── PDFPreview.tsx             # PDF preview
│   │   └── FormErrorBoundary.tsx      # Error boundary
│   ├── api/
│   │   ├── client.ts                  # API client wrapper
│   │   ├── proposals.ts               # Proposal API calls
│   │   ├── invoices.ts                # Invoice API calls
│   │   ├── clients.ts                 # Client API calls
│   │   ├── calendar.ts                # Calendar API calls
│   │   └── dashboard.ts               # Dashboard API calls
│   ├── contexts/
│   │   ├── AuthContext.tsx            # Authentication context
│   │   └── ThemeContext.tsx           # Theme context
│   ├── layouts/
│   │   └── MainLayout.tsx             # Main layout wrapper
│   ├── types/
│   │   ├── Proposal.ts                # Type definitions
│   │   ├── Invoice.ts
│   │   ├── Client.ts
│   │   └── Booking.ts
│   ├── styles/
│   │   ├── variables.css              # CSS variables
│   │   ├── components.css             # Component styles
│   │   └── pages.css                  # Page styles
│   ├── utils/
│   │   ├── formatters.ts              # Data formatters
│   │   ├── validators.ts              # Form validators
│   │   └── auth.ts                    # Auth utilities
│   ├── App.tsx                        # Main app component
│   └── main.tsx                       # Entry point
├── public/                            # Static assets
├── dist/                              # Production build
└── vite.config.ts                     # Vite configuration
```

## 🛠️ Installation

### Prerequisites

- Node.js 18+
- pnpm 8+
- FreelanceToolkit.Api running on port 5107
- Identity API running (for JWT authentication)

### Setup

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Configure environment**:
   Create a `.env` file in the root directory:

   ```env
   VITE_API_URL=http://localhost:5107/api
   VITE_IDENTITY_URL=http://localhost:5101
   ```

3. **Start development server**:

   ```bash
   pnpm dev
   # or
   pnpm start  # Runs on freelance-toolkit.asafarim.local:5180
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
| `pnpm start` | Start development server on freelance-toolkit.asafarim.local:5180 |
| `pnpm build` | Build for production (TypeScript + Vite) |
| `pnpm lint` | Run ESLint |
| `pnpm preview` | Preview production build |

### Configuration

#### Environment Variables

```bash
# API Configuration
VITE_API_URL=http://localhost:5107/api              # FreelanceToolkit.Api URL
VITE_IDENTITY_URL=http://localhost:5101             # Identity.Api URL

# Feature Flags
VITE_ENABLE_DARK_MODE=true                          # Enable dark mode
VITE_ENABLE_ANALYTICS=true                          # Enable analytics
```

## 🌐 API Integration

The UI integrates with FreelanceToolkit.Api:

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### Clients

- `GET /api/clients` - Get all clients
- `GET /api/clients/{id}` - Get client details
- `POST /api/clients` - Create new client
- `PUT /api/clients/{id}` - Update client
- `DELETE /api/clients/{id}` - Delete client

### Proposals

- `GET /api/proposals` - Get all proposals
- `GET /api/proposals/{id}` - Get proposal details
- `POST /api/proposals` - Create new proposal
- `PUT /api/proposals/{id}` - Update proposal
- `DELETE /api/proposals/{id}` - Delete proposal
- `POST /api/proposals/{id}/send` - Send proposal via email
- `GET /api/proposals/{id}/pdf` - Download proposal PDF
- `GET /api/proposals/public/{link}` - View public proposal

### Invoices

- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/{id}` - Get invoice details
- `POST /api/invoices` - Create new invoice
- `PUT /api/invoices/{id}` - Update invoice
- `DELETE /api/invoices/{id}` - Delete invoice
- `POST /api/invoices/{id}/send` - Send invoice via email
- `GET /api/invoices/{id}/pdf` - Download invoice PDF
- `POST /api/invoices/{id}/mark-paid` - Mark invoice as paid

### Calendar

- `GET /api/calendar/bookings` - Get all bookings
- `GET /api/calendar/available-slots` - Get available time slots
- `POST /api/calendar/book` - Create new booking
- `PUT /api/calendar/{id}/cancel` - Cancel booking
- `GET /api/calendar/settings` - Get calendar settings

### Dashboard

- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-activity` - Get recent activity

## 🔐 Authentication

The application uses JWT-based authentication:

- Tokens are obtained from Identity API
- Tokens are stored in localStorage
- Protected routes require valid authentication
- Automatic token refresh on expiration

## 🎨 Design System

The application uses design tokens from `@asafarim/design-tokens`:

- **Colors**: Semantic color scales (primary, success, warning, danger, info, neutral)
- **Typography**: Font families, sizes, weights, line heights
- **Spacing**: Consistent spacing scale
- **Motion**: Standardized transitions and animations
- **Shadows**: Elevation system for depth
- **Radius**: Border radius tokens

Theme switching is handled automatically based on system preferences or user selection.

## 📱 Pages & Features

### Dashboard (`/dashboard`)

- Key metrics and statistics
- Recent activity feed
- Quick action buttons
- Performance charts

### Proposals (`/proposals`)

- List all proposals with filters
- Create new proposals
- Edit existing proposals
- Send proposals via email
- Download proposal PDFs
- Track proposal status

### Proposal Details (`/proposals/:id`)

- View proposal details
- Edit proposal content
- Add/edit line items
- Preview PDF
- Send to client
- Track status changes

### Invoices (`/invoices`)

- List all invoices with filters
- Create new invoices
- Create from proposals
- Edit existing invoices
- Send invoices via email
- Download invoice PDFs
- Mark as paid

### Invoice Details (`/invoices/:id`)

- View invoice details
- Edit invoice content
- Add/edit line items
- Preview PDF
- Send to client
- Track payment status

### Clients (`/clients`)

- List all clients
- Create new clients
- Edit client information
- View client history
- Track proposals and invoices

### Client Details (`/clients/:id`)

- View client details
- Edit client information
- View all proposals
- View all invoices
- Add notes and tags

### Calendar (`/calendar`)

- View calendar with bookings
- Schedule new meetings
- Set availability
- Send booking confirmations
- Manage appointments

### Settings (`/settings`)

- User profile management
- Company branding
- Email preferences
- Calendar settings
- Notification preferences

## ✅ Form Validation

Client-side validation with helpful feedback:

- **Real-time validation**: Immediate feedback as user types
- **Field-level errors**: Visual indicators for invalid fields
- **Error messages**: Clear, actionable error messages
- **Error Boundary**: Graceful error handling and recovery

## 📧 Email Integration

Email functionality:

- **Proposal sending**: One-click email delivery with PDF attachment
- **Invoice sending**: Send invoices with payment instructions
- **Status tracking**: Real-time feedback on send success/failure
- **Error recovery**: User-friendly error messages with retry options
- **Configuration**: Backend handles SMTP configuration

## 📄 PDF Generation

PDF features:

- **Professional templates**: Company branding and formatting
- **Proposal PDFs**: Include proposal details, line items, and terms
- **Invoice PDFs**: Include invoice details, payment terms, and company info
- **Date formatting**: Proper date display in PDFs
- **Download support**: Direct PDF download from browser

## 🚢 Deployment

### Production Build

```bash
pnpm build
```

The build output will be in the `dist/` directory.

### Environment Configuration

For production deployment:

```env
VITE_API_URL=https://freelance-toolkit.asafarim.be/api
VITE_IDENTITY_URL=https://identity.asafarim.be
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name freelance-toolkit.asafarim.be;
    
    root /var/www/freelance-toolkit-ui;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:5107;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Verify FreelanceToolkit.Api is running on port 5107
   - Check environment variables
   - Ensure CORS is properly configured

2. **Email Not Sending**
   - Verify SMTP credentials in backend `appsettings.json`
   - Check Gmail app password (not regular password)
   - Review backend logs in `logs/` directory

3. **PDF Generation Errors**
   - Verify QuestPDF is properly configured
   - Check company branding settings
   - Review PDF template configuration

4. **Authentication Issues**
   - Verify Identity API is running
   - Check JWT configuration
   - Clear browser localStorage and try again

5. **Build Errors**
   - Clear `node_modules` and reinstall: `pnpm install`
   - Clear Vite cache: `rm -rf node_modules/.vite`
   - Rebuild workspace packages: `pnpm -r build`

## 📊 Performance Optimization

- **Code Splitting**: Dynamic imports for heavy components
- **Lazy Loading**: Routes loaded on demand
- **Memoization**: React.memo for expensive components
- **Virtual Scrolling**: For large proposal/invoice lists
- **Debouncing**: Search and filter inputs

## 📄 License

Part of the asafarim.be monorepo. All rights reserved.

## 🤝 Contributing

This is a private monorepo project. For internal development guidelines, see the main repository documentation.

## 📞 Support

For issues or questions, contact the development team or create an issue in the repository.

---

**Version**: 1.1.0  
**Port**: 5180  
**Last Updated**: December 2025
