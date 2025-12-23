# FreelanceToolkit API - Freelance Business Management Backend

> A production-ready ASP.NET Core 9 Web API for comprehensive freelance business management. Provides proposal management, invoice tracking, client CRM, calendar scheduling, PDF generation, and email delivery with JWT authentication.

[![.NET](https://img.shields.io/badge/.NET-9.0-512BD4.svg)](https://dotnet.microsoft.com/)
[![C#](https://img.shields.io/badge/C%23-13-239120.svg)](https://docs.microsoft.com/en-us/dotnet/csharp/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![QuestPDF](https://img.shields.io/badge/QuestPDF-2024.3-blue.svg)](https://www.questpdf.com/)
[![MailKit](https://img.shields.io/badge/MailKit-4.3-blue.svg)](https://www.mimekit.net/)

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

## 🏗️ Architecture

### Tech Stack
- **Framework**: ASP.NET Core 9.0
- **Language**: C# 13 with nullable reference types
- **Database**: PostgreSQL 16 with Entity Framework Core 9.0
- **PDF Generation**: QuestPDF 2024.3
- **Email Service**: MailKit 4.3
- **Validation**: FluentValidation 11.3
- **Mapping**: AutoMapper 12.0
- **Logging**: Serilog 8.0
- **Documentation**: Swagger/OpenAPI

### Project Structure
```
FreelanceToolkit.Api/
├── Controllers/
│   ├── AuthController.cs              # Authentication & authorization
│   ├── ClientsController.cs           # Client CRM management
│   ├── ProposalsController.cs         # Proposal CRUD & operations
│   ├── InvoicesController.cs          # Invoice CRUD & operations
│   ├── CalendarController.cs          # Calendar & booking management
│   └── DashboardController.cs         # Dashboard metrics & analytics
├── Services/
│   ├── ProposalService.cs             # Proposal business logic
│   ├── InvoiceService.cs              # Invoice business logic
│   ├── EmailService.cs                # Email delivery
│   ├── PdfService.cs                  # PDF generation
│   ├── CalendarService.cs             # Calendar operations
│   └── DashboardService.cs            # Dashboard calculations
├── Models/
│   ├── Client.cs
│   ├── Proposal.cs
│   ├── ProposalLineItem.cs
│   ├── Invoice.cs
│   ├── InvoiceLineItem.cs
│   ├── Booking.cs
│   └── User.cs
├── DTOs/
│   ├── ClientDto.cs
│   ├── ProposalDto.cs
│   ├── InvoiceDto.cs
│   ├── BookingDto.cs
│   └── DashboardStatsDto.cs
├── Validators/
│   ├── CreateProposalValidator.cs
│   ├── CreateInvoiceValidator.cs
│   ├── CreateClientValidator.cs
│   └── CreateBookingValidator.cs
├── Mappings/
│   ├── ClientMappingProfile.cs
│   ├── ProposalMappingProfile.cs
│   ├── InvoiceMappingProfile.cs
│   └── BookingMappingProfile.cs
├── Data/
│   └── ApplicationDbContext.cs
├── BackgroundServices/
│   └── EmailQueueService.cs
└── Program.cs
```

## 🛠️ Installation

### Prerequisites
- .NET 9.0 SDK
- PostgreSQL 16+
- Identity API running (for JWT validation)
- SMTP server (Gmail, SendGrid, etc.)

### Setup

1. **Restore dependencies**:
   ```bash
   dotnet restore
   ```

2. **Configure database**:
   Update `appsettings.json` or use environment variables:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Database=freelance_toolkit;Username=postgres;Password=your_password"
     }
   }
   ```

3. **Configure JWT Authentication**:
   ```json
   {
     "AuthJwt": {
       "Key": "your-secret-key-min-32-chars",
       "Issuer": "https://identity.asafarim.be",
       "Audience": "freelance-toolkit-client"
     }
   }
   ```

4. **Configure Email Service**:
   ```json
   {
     "Email": {
       "SmtpHost": "smtp.gmail.com",
       "SmtpPort": 465,
       "SmtpUser": "your-email@gmail.com",
       "SmtpPassword": "your-app-password",
       "FromAddress": "noreply@asafarim.be",
       "FromName": "ASafariM Freelance Toolkit",
       "UseSsl": true
     }
   }
   ```

5. **Configure PDF Settings**:
   ```json
   {
     "Pdf": {
       "CompanyName": "ASafariM",
       "CompanyAddress": "Hasselt, Belgium",
       "CompanyEmail": "contact@asafarim.be",
       "CompanyWebsite": "https://asafarim.be",
       "CompanyLogo": "https://asafarim.be/logo.png"
     }
   }
   ```

6. **Run database migrations**:
   ```bash
   dotnet ef database update
   ```

7. **Start the API**:
   ```bash
   dotnet run
   ```
   The API will be available at `http://localhost:5107`

## 🔧 Development

### Available Commands

| Command | Description |
|---------|-------------|
| `dotnet run` | Start the API server on port 5107 |
| `dotnet build` | Build the project |
| `dotnet test` | Run tests |
| `dotnet ef migrations add <Name>` | Create new migration |
| `dotnet ef database update` | Apply migrations |
| `dotnet watch run` | Run with hot reload |

### Configuration

#### Environment Variables
```bash
# Database
ConnectionStrings__DefaultConnection="Host=localhost;Database=freelance_toolkit;..."

# JWT Authentication
AuthJwt__Key="your-secret-key-min-32-chars"
AuthJwt__Issuer="https://identity.asafarim.be"
AuthJwt__Audience="freelance-toolkit-client"

# Email Service
Email__SmtpHost="smtp.gmail.com"
Email__SmtpPort="465"
Email__SmtpUser="your-email@gmail.com"
Email__SmtpPassword="your-app-password"
Email__FromAddress="noreply@asafarim.be"
Email__FromName="ASafariM Freelance Toolkit"
Email__UseSsl="true"

# PDF Settings
Pdf__CompanyName="ASafariM"
Pdf__CompanyAddress="Hasselt, Belgium"
Pdf__CompanyEmail="contact@asafarim.be"
Pdf__CompanyWebsite="https://asafarim.be"
```

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | User logout |

### Clients (CRM)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/clients` | Get all clients |
| GET | `/api/clients/{id}` | Get client details |
| POST | `/api/clients` | Create new client |
| PUT | `/api/clients/{id}` | Update client |
| DELETE | `/api/clients/{id}` | Delete client |

### Proposals

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/proposals` | Get all proposals |
| GET | `/api/proposals/{id}` | Get proposal details |
| POST | `/api/proposals` | Create new proposal |
| PUT | `/api/proposals/{id}` | Update proposal |
| DELETE | `/api/proposals/{id}` | Delete proposal |
| POST | `/api/proposals/{id}/send` | Send proposal via email |
| GET | `/api/proposals/{id}/pdf` | Download proposal PDF |
| GET | `/api/proposals/public/{link}` | View public proposal |

### Invoices

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | Get all invoices |
| GET | `/api/invoices/{id}` | Get invoice details |
| POST | `/api/invoices` | Create new invoice |
| PUT | `/api/invoices/{id}` | Update invoice |
| DELETE | `/api/invoices/{id}` | Delete invoice |
| POST | `/api/invoices/{id}/send` | Send invoice via email |
| GET | `/api/invoices/{id}/pdf` | Download invoice PDF |
| POST | `/api/invoices/{id}/mark-paid` | Mark invoice as paid |

### Calendar & Bookings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/calendar/bookings` | Get all bookings |
| GET | `/api/calendar/available-slots` | Get available time slots |
| POST | `/api/calendar/book` | Create new booking |
| PUT | `/api/calendar/{id}/cancel` | Cancel booking |
| GET | `/api/calendar/settings` | Get calendar settings |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get dashboard statistics |
| GET | `/api/dashboard/recent-activity` | Get recent activity |

## 🔐 Authentication

The API uses JWT Bearer authentication:

1. **Token Sources**:
   - Authorization header: `Bearer <token>`
   - Generated by Identity API

2. **Token Validation**:
   - Issuer validation
   - Audience validation
   - Signature validation
   - Lifetime validation

3. **Protected Endpoints**:
   - Most endpoints require `[Authorize]` attribute
   - Public endpoints: `/api/proposals/public/{link}`

## 📧 Email Service

Email functionality using MailKit:
- **SMTP Configuration**: Supports port 465 (implicit TLS) and port 587 (explicit TLS)
- **Proposal Emails**: Sends proposals as PDF attachments with professional HTML body
- **Invoice Emails**: Sends invoices with payment instructions
- **Error Handling**: Logs email failures without blocking operations
- **Retry Logic**: Automatic retry on transient failures

## 📄 PDF Generation

PDF generation with QuestPDF:
- **Professional Templates**: Company branding and formatting
- **Proposal PDFs**: Include proposal details, line items, and terms
- **Invoice PDFs**: Include invoice details, payment terms, and company info
- **Date Formatting**: Proper date display in PDFs
- **Custom Styling**: Professional design with company colors

## ✅ Form Validation

Server-side validation with FluentValidation:
- **Detailed Error Messages**: User-friendly validation messages
- **Date Validation**: ValidUntil dates must be in the future
- **Amount Validation**: Positive amounts required
- **Email Validation**: Valid email format required
- **Required Fields**: All mandatory fields validated

## 📊 Logging

Structured logging with Serilog:
- **Console Sink**: Development logging
- **File Sink**: Production logging to `/logs/` directory
- **Daily Rotation**: Automatic log file rotation
- **Structured Data**: Context-aware logging
- **Email Logging**: Detailed email service logs

## 🚢 Deployment

### Production Configuration

1. **Database**:
   ```bash
   export ConnectionStrings__DefaultConnection="Host=prod-db;Database=freelance_toolkit;..."
   ```

2. **Authentication**:
   ```bash
   export AuthJwt__Key="production-secret-key"
   export AuthJwt__Issuer="https://identity.asafarim.be"
   export AuthJwt__Audience="freelance-toolkit-client"
   ```

3. **Email Service**:
   ```bash
   export Email__SmtpHost="smtp.gmail.com"
   export Email__SmtpPort="465"
   export Email__SmtpUser="production-email@gmail.com"
   export Email__SmtpPassword="production-app-password"
   ```

4. **Build and Run**:
   ```bash
   dotnet publish -c Release -o ./publish
   cd publish
   dotnet FreelanceToolkit.Api.dll
   ```

### Systemd Service
```ini
[Unit]
Description=FreelanceToolkit API Service
After=network.target postgresql.service

[Service]
Type=notify
WorkingDirectory=/var/www/freelance-toolkit-api
ExecStart=/usr/bin/dotnet /var/www/freelance-toolkit-api/FreelanceToolkit.Api.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=freelance-toolkit-api
User=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production

[Install]
WantedBy=multi-user.target
```

### Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name freelance-toolkit.asafarim.be;
    
    location / {
        proxy_pass http://localhost:5107;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Email Not Sending**
   - Verify SMTP credentials in `appsettings.json`
   - Check Gmail app password (not regular password)
   - Review logs in `logs/` directory
   - Ensure firewall allows SMTP port

2. **PDF Generation Errors**
   - Verify QuestPDF license (if using commercial version)
   - Check company branding settings
   - Review PDF template configuration

3. **Database Connection Errors**
   - Verify PostgreSQL is running
   - Check connection string format
   - Ensure database exists
   - Verify user permissions

4. **Authentication Failures**
   - Verify JWT configuration matches Identity API
   - Check token expiration
   - Ensure user has required roles

## 📄 License

Part of the asafarim.be monorepo. All rights reserved.

## 🤝 Contributing

This is a private monorepo project. For internal development guidelines, see the main repository documentation.

## 📞 Support

For issues or questions, contact the development team or create an issue in the repository.

---

**Version**: 1.0.0  
**Port**: 5107  
**Last Updated**: December 2025
