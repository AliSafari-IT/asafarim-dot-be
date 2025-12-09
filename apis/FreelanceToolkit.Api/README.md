# ASafariM Freelance Toolkit API

## Overview

Production-ready .NET 9 WebAPI for freelance business management.

## Features

- ✅ Proposal Management (templates, versioning, PDF export, email delivery)
- ✅ Invoice Management (generation, payment tracking, email delivery)
- ✅ Client CRM (contacts, notes, tags)
- ✅ Calendar & Scheduling (booking system, meeting confirmations)
- ✅ Authentication & Authorization (JWT)
- ✅ PDF Generation (QuestPDF with professional templates)
- ✅ Email Service (MailKit with SMTP support)
- ✅ Audit Logging (Serilog with structured logging)
- ✅ Form Validation (FluentValidation with detailed error messages)

## Tech Stack

- .NET 9
- PostgreSQL
- Entity Framework Core
- AutoMapper
- FluentValidation
- Serilog
- QuestPDF
- MailKit

## Setup

### 1. Database

```bash
# Update connection string in appsettings.json
# Run migrations
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### 2. Configuration

Update `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=freelance_toolkit;Username=postgres;Password=..."
  },
  "AuthJwt": {
    "Key": "your-secret-key",
    "Issuer": "asafarim.be",
    "Audience": "asafarim.be"
  },
  "Email": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": 465,
    "SmtpUser": "your-email@gmail.com",
    "SmtpPassword": "your-app-password",
    "FromAddress": "noreply@asafarim.be",
    "FromName": "ASafariM Freelance Toolkit",
    "UseSsl": true
  },
  "Pdf": {
    "CompanyName": "ASafariM",
    "CompanyAddress": "Hasselt, Belgium",
    "CompanyEmail": "contact@asafarim.com",
    "CompanyWebsite": "https://asafarim.be"
  }
}
```

### 3. Run

```bash
dotnet run
```

API will be available at: `http://localhost:5107`

## API Endpoints

### Authentication

- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/refresh`
- POST `/api/auth/logout`

### Clients

- GET `/api/clients`
- GET `/api/clients/{id}`
- POST `/api/clients`
- PUT `/api/clients/{id}`
- DELETE `/api/clients/{id}`

### Proposals

- GET `/api/proposals`
- GET `/api/proposals/{id}`
- POST `/api/proposals`
- PUT `/api/proposals/{id}`
- DELETE `/api/proposals/{id}`
- POST `/api/proposals/{id}/send`
- GET `/api/proposals/{id}/pdf`
- GET `/api/proposals/public/{link}`

### Invoices

- GET `/api/invoices`
- GET `/api/invoices/{id}`
- POST `/api/invoices`
- PUT `/api/invoices/{id}`
- DELETE `/api/invoices/{id}`
- POST `/api/invoices/{id}/send`
- GET `/api/invoices/{id}/pdf`
- POST `/api/invoices/{id}/mark-paid`

### Calendar

- GET `/api/calendar/bookings`
- GET `/api/calendar/available-slots`
- POST `/api/calendar/book`
- PUT `/api/calendar/{id}/cancel`
- GET `/api/calendar/settings`

### Dashboard

- GET `/api/dashboard/stats`
- GET `/api/dashboard/recent-activity`

## Key Implementation Details

### Email Service

- **SMTP Configuration**: Supports port 465 (implicit TLS) and port 587 (explicit TLS)
- **Proposal Emails**: Sends proposals as PDF attachments with professional HTML body
- **Error Handling**: Logs email sending failures without blocking proposal status updates
- **Configuration**: All settings in `appsettings.json` under `Email` section

### PDF Generation

- **QuestPDF**: Professional PDF generation with custom templates
- **Proposal PDFs**: Include proposal details, line items, and company branding
- **Invoice PDFs**: Include invoice details, payment terms, and company information
- **Date Formatting**: Proper date formatting in PDF headers and content

### Form Validation

- **FluentValidation**: Server-side validation for all DTOs
- **Error Messages**: Detailed, user-friendly error messages
- **Date Validation**: ValidUntil dates must be in the future

### Logging

- **Serilog**: Structured logging with context
- **Email Logging**: Detailed logs for email sending process (connection, authentication, delivery)
- **Log Files**: Stored in `logs/` directory with daily rotation

## Next Steps

1. ✅ Email service implementation (COMPLETED)
2. ✅ PDF generation (COMPLETED)
3. ✅ Form validation (COMPLETED)
4. Invoice email delivery
5. Calendar booking confirmations
6. Add unit tests
7. Configure CI/CD
8. Performance optimization

## Frontend

React TypeScript app in: `apps/freelance-toolkit-ui`
