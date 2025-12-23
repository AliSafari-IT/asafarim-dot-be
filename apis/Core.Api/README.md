# Core API - Portfolio & Resume Management Backend

> A comprehensive ASP.NET Core Web API providing backend services for portfolio management, resume building, publications, contact forms, and job applications with JWT authentication and PostgreSQL database.

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4.svg)](https://dotnet.microsoft.com/)
[![C#](https://img.shields.io/badge/C%23-12-239120.svg)](https://docs.microsoft.com/en-us/dotnet/csharp/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![Serilog](https://img.shields.io/badge/Serilog-8.0-blue.svg)](https://serilog.net/)

## 🚀 Features

### 📋 Resume Management
- **Complete Resume System**: Full CRUD operations for resumes with multiple sections
- **Skills Management**: Technical and soft skills with proficiency levels
- **Education History**: Academic background with degrees and institutions
- **Work Experience**: Professional experience with detailed descriptions
- **Projects**: Portfolio projects with links and technologies
- **Certifications**: Professional certifications and credentials
- **Languages**: Language proficiency tracking
- **Awards & Achievements**: Recognition and accomplishments
- **References**: Professional references management
- **Social Links**: Social media and professional network links

### 📚 Portfolio Services
- **Publications Management**: Academic and professional publications
- **Research Portfolio**: Research projects and papers
- **Public Portfolio API**: Aggregated portfolio data for public display
- **Content Categorization**: Organize content by type and category

### 💼 Job Application System
- **Application Tracking**: Track job applications and status
- **Project Inquiries**: Handle project collaboration requests
- **Contact Management**: Store and manage contact form submissions
- **Email Integration**: Send emails via MailKit/MimeKit

### 🔐 Authentication & Authorization
- **JWT Bearer Authentication**: Secure API endpoints
- **Cookie-based Tokens**: HTTP-only cookie support (`atk`, `rtk`)
- **Identity API Proxy**: Proxy authentication endpoints to Identity API
- **User Isolation**: User-specific data access control
- **Role-based Authorization**: Support for role-based access

### 🗄️ Database Management
- **PostgreSQL**: Primary database with EF Core
- **Multiple Contexts**: Separate contexts for Core and Jobs data
- **Automatic Migrations**: Database migrations on startup
- **Query Optimization**: Split query behavior for performance

## 🏗️ Architecture

### Tech Stack
- **Framework**: ASP.NET Core 8.0
- **Language**: C# 12 with nullable reference types
- **Database**: PostgreSQL with Entity Framework Core 8.0
- **Authentication**: JWT Bearer tokens
- **Email**: MailKit & MimeKit
- **Logging**: Serilog with console and file sinks
- **Documentation**: Swagger/OpenAPI
- **ORM**: Entity Framework Core with Npgsql

### Project Structure
```
Core.Api/
├── Controllers/
│   ├── ResumesController.cs           # Resume CRUD
│   ├── SkillsController.cs            # Skills management
│   ├── EducationsController.cs        # Education history
│   ├── WorkExperiencesController.cs   # Work experience
│   ├── ProjectsController.cs          # Projects
│   ├── CertificatesController.cs      # Certifications
│   ├── LanguagesController.cs         # Languages
│   ├── AwardsController.cs            # Awards
│   ├── ReferencesController.cs        # References
│   ├── SocialLinksController.cs       # Social links
│   ├── PublicationsController.cs      # Publications
│   ├── PortfolioController.cs         # Portfolio aggregation
│   ├── JobApplicationsController.cs   # Job applications
│   ├── ProjectInquiriesController.cs  # Project inquiries
│   ├── ContactController.cs           # Contact form
│   ├── EmailController.cs             # Email services
│   ├── WhatIsBuildingController.cs    # Current projects
│   ├── TimelineMilestonesController.cs # Timeline
│   ├── TechnologiesController.cs      # Technologies
│   ├── UserConversationsController.cs # User messages
│   └── HealthController.cs            # Health checks
├── Models/
│   ├── Resume/                        # Resume-related models
│   │   ├── Resume.cs
│   │   ├── Skill.cs
│   │   ├── Education.cs
│   │   ├── WorkExperience.cs
│   │   ├── Project.cs
│   │   ├── Certificate.cs
│   │   ├── Language.cs
│   │   ├── Award.cs
│   │   ├── Reference.cs
│   │   └── SocialLink.cs
│   ├── Publication.cs                 # Publication model
│   ├── JobApplication.cs              # Job application model
│   ├── ProjectInquiry.cs              # Project inquiry model
│   ├── Contact.cs                     # Contact model
│   ├── TimelineMilestone.cs           # Timeline model
│   └── UserConversation.cs            # User conversation model
├── DTOs/                              # Data transfer objects
├── Data/
│   ├── CoreDbContext.cs               # Main database context
│   └── AppDbContext.cs                # Jobs database context
├── Services/
│   ├── IPortfolioService.cs           # Portfolio service interface
│   └── PortfolioService.cs            # Portfolio service implementation
├── Extensions/
│   ├── MigrationExtensions.cs         # Database migration helpers
│   └── LoggingExtensions.cs           # Structured logging setup
├── Utilities/                         # Utility classes
├── Migrations/                        # EF Core migrations
├── Program.cs                         # Application startup
├── AuthOptions.cs                     # Authentication configuration
└── appsettings.json                   # Configuration
```

## 🛠️ Installation

### Prerequisites
- .NET 8.0 SDK
- PostgreSQL 16+
- Identity API running (for authentication)
- SMTP server (for email functionality)

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
       "DefaultConnection": "Host=localhost;Database=asafarim_core;Username=postgres;Password=your_password",
       "JobsConnection": "Host=localhost;Database=asafarim_jobs;Username=postgres;Password=your_password"
     }
   }
   ```

3. **Configure JWT Authentication**:
   ```json
   {
     "AuthJwt": {
       "Issuer": "https://identity.asafarim.be",
       "Audience": "asafarim-clients",
       "Key": "your-secret-key-min-32-chars"
     }
   }
   ```

4. **Configure Identity API URL**:
   ```json
   {
     "IdentityApiUrl": "http://localhost:5101"
   }
   ```

5. **Run database migrations**:
   ```bash
   dotnet ef database update --context CoreDbContext
   dotnet ef database update --context AppDbContext
   ```

6. **Start the API**:
   ```bash
   dotnet run
   ```
   The API will be available at `http://localhost:5102`

## 🔧 Development

### Available Commands

| Command | Description |
|---------|-------------|
| `dotnet run` | Start the API server |
| `dotnet build` | Build the project |
| `dotnet test` | Run tests |
| `dotnet ef migrations add <Name> --context CoreDbContext` | Create new Core migration |
| `dotnet ef migrations add <Name> --context AppDbContext` | Create new Jobs migration |
| `dotnet ef database update --context CoreDbContext` | Apply Core migrations |
| `dotnet ef database update --context AppDbContext` | Apply Jobs migrations |
| `dotnet watch run` | Run with hot reload |

### Configuration

#### Environment Variables
```bash
# Database
ConnectionStrings__DefaultConnection="Host=localhost;Database=asafarim_core;..."
ConnectionStrings__JobsConnection="Host=localhost;Database=asafarim_jobs;..."

# Authentication
AuthJwt__Issuer="https://identity.asafarim.be"
AuthJwt__Audience="asafarim-clients"
AuthJwt__Key="your-secret-key"

# Identity API
IdentityApiUrl="http://localhost:5101"

# CORS
ALLOWED_ORIGINS="https://asafarim.be,https://www.asafarim.be"
```

#### CORS Configuration
The API automatically configures CORS based on environment:

**Development**:
- `http://web.asafarim.local:5175`
- `http://ai.asafarim.local:5173`
- `http://identity.asafarim.local:5101`
- `http://localhost:*` (various ports)

**Production**:
- `https://asafarim.be`
- `https://www.asafarim.be`
- `https://ai.asafarim.be`
- `https://core.asafarim.be`
- `https://blog.asafarim.be`
- `https://identity.asafarim.be`
- `https://*.asafarim.be` (all subdomains)

## 📡 API Endpoints

### Resume Endpoints

#### GET /api/resumes
Get all resumes for the authenticated user.

**Response**:
```json
[
  {
    "id": 1,
    "userId": "user-id",
    "fullName": "John Doe",
    "title": "Senior Software Engineer",
    "summary": "Experienced developer...",
    "email": "john@example.com",
    "phone": "+1234567890",
    "location": "New York, NY",
    "publicSlug": "john-doe-resume",
    "isPublic": true
  }
]
```

#### POST /api/resumes
Create a new resume.

#### PUT /api/resumes/{id}
Update an existing resume.

#### DELETE /api/resumes/{id}
Delete a resume.

#### GET /api/resumes/public/{slug}
Get public resume by slug (no authentication required).

### Skills Endpoints

#### GET /api/skills
Get all skills for the authenticated user.

#### POST /api/skills
Create a new skill.

**Request**:
```json
{
  "name": "C#",
  "proficiency": "Expert",
  "category": "Programming Languages",
  "yearsOfExperience": 5
}
```

#### PUT /api/skills/{id}
Update a skill.

#### DELETE /api/skills/{id}
Delete a skill.

### Education Endpoints

#### GET /api/educations
Get all education entries.

#### POST /api/educations
Create education entry.

**Request**:
```json
{
  "institution": "University of Technology",
  "degree": "Bachelor of Science",
  "fieldOfStudy": "Computer Science",
  "startDate": "2015-09-01",
  "endDate": "2019-06-01",
  "grade": "3.8 GPA",
  "description": "Focused on software engineering..."
}
```

### Work Experience Endpoints

#### GET /api/work-experiences
Get all work experiences.

#### POST /api/work-experiences
Create work experience.

**Request**:
```json
{
  "company": "Tech Corp",
  "position": "Senior Developer",
  "startDate": "2020-01-01",
  "endDate": null,
  "isCurrent": true,
  "description": "Leading development team...",
  "technologies": ["C#", "React", "PostgreSQL"]
}
```

### Projects Endpoints

#### GET /api/projects
Get all projects.

#### POST /api/projects
Create project.

**Request**:
```json
{
  "name": "E-commerce Platform",
  "description": "Full-stack e-commerce solution",
  "technologies": ["React", "Node.js", "MongoDB"],
  "link": "https://github.com/user/project",
  "startDate": "2023-01-01",
  "endDate": "2023-12-01"
}
```

### Certificates Endpoints

#### GET /api/certificates
Get all certificates.

#### POST /api/certificates
Create certificate.

### Languages Endpoints

#### GET /api/languages
Get all languages.

#### POST /api/languages
Create language.

**Request**:
```json
{
  "name": "English",
  "proficiency": "Native"
}
```

### Awards Endpoints

#### GET /api/awards
Get all awards.

#### POST /api/awards
Create award.

### References Endpoints

#### GET /api/references
Get all references.

#### POST /api/references
Create reference.

### Social Links Endpoints

#### GET /api/social-links
Get all social links.

#### POST /api/social-links
Create social link.

**Request**:
```json
{
  "platform": "LinkedIn",
  "url": "https://linkedin.com/in/johndoe",
  "username": "johndoe"
}
```

### Publications Endpoints

#### GET /api/publications
Get all publications.

**Query Parameters**:
- `contentType`: Filter by content type (e.g., "publications", "research")
- `isPublic`: Filter by public status

#### POST /api/publications
Create publication.

**Request**:
```json
{
  "title": "Machine Learning in Production",
  "authors": ["John Doe", "Jane Smith"],
  "journal": "Tech Journal",
  "year": 2024,
  "doi": "10.1234/example",
  "abstract": "This paper discusses...",
  "contentType": "publications",
  "isPublic": true
}
```

#### PUT /api/publications/{id}
Update publication.

#### DELETE /api/publications/{id}
Delete publication.

### Portfolio Endpoints

#### GET /api/portfolio
Get aggregated portfolio data (public).

**Response**:
```json
{
  "publications": [...],
  "projects": [...],
  "skills": [...],
  "experience": [...]
}
```

### Job Application Endpoints

#### GET /api/job-applications
Get all job applications.

#### POST /api/job-applications
Submit job application.

**Request**:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "position": "Senior Developer",
  "coverLetter": "I am interested in...",
  "resumeUrl": "https://example.com/resume.pdf"
}
```

### Contact Endpoints

#### POST /api/contact
Submit contact form.

**Request**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Project Inquiry",
  "message": "I would like to discuss..."
}
```

### Project Inquiry Endpoints

#### POST /api/project-inquiries
Submit project inquiry.

### Authentication Proxy Endpoints

#### GET /auth/me
Get current authenticated user (proxied to Identity API).

#### GET /auth/token
Get current access token from cookie.

#### POST /auth/logout
Logout user (proxied to Identity API).

#### POST /auth/refresh
Refresh access token (proxied to Identity API).

### Health Endpoints

#### GET /health
General API health check.

**Response**:
```json
{
  "status": "Healthy",
  "service": "Core API",
  "version": "1.0.0",
  "environment": "Production",
  "timestamp": "2025-12-23T16:00:00Z"
}
```

## 🗄️ Database Schema

### Core Database (CoreDbContext)

**Resumes Table**:
- Resume metadata and basic information
- User-specific with `UserId` foreign key
- Public sharing via `PublicSlug`

**Skills, Education, WorkExperiences, Projects, Certificates, Languages, Awards, References, SocialLinks**:
- All linked to `ResumeId`
- User-specific data isolation

**Publications Table**:
- Academic and professional publications
- Content type categorization
- Public/private visibility control

**TimelineMilestones Table**:
- Career timeline events
- Analytics tracking

**UserConversations Table**:
- User messages and inquiries

### Jobs Database (AppDbContext)

**JobApplications Table**:
- Job application submissions
- Status tracking

**ProjectInquiries Table**:
- Project collaboration requests

**Contacts Table**:
- Contact form submissions

## 🔐 Authentication

The API uses JWT Bearer authentication with cookie support:

1. **Token Sources**:
   - Authorization header: `Bearer <token>`
   - HTTP-only cookie: `atk` (access token)
   - HTTP-only cookie: `rtk` (refresh token)

2. **Token Validation**:
   - Issuer validation
   - Audience validation
   - Signature validation
   - Lifetime validation
   - 30-second clock skew tolerance

3. **User Claims**:
   - `sub` or `NameIdentifier`: User ID
   - Additional claims from Identity API

4. **Protected Endpoints**:
   - Most endpoints require `[Authorize]` attribute
   - Public endpoints: `/api/resumes/public/{slug}`, `/api/portfolio`, `/health`

## 📧 Email Integration

Email functionality using MailKit/MimeKit:
- SMTP configuration in appsettings
- HTML and plain text email support
- Attachment support
- Template-based emails

## 📊 Logging

Structured logging with Serilog:
- **Console Sink**: Development logging
- **File Sink**: Production logging to `/var/log/asafarim/core-api/`
- **Log Levels**: Information, Warning, Error
- **Request Logging**: HTTP request/response logging
- **Error Tracking**: Exception logging with stack traces

## 🚢 Deployment

### Production Configuration

1. **Database**:
   ```bash
   export ConnectionStrings__DefaultConnection="Host=prod-db;Database=asafarim_core;..."
   export ConnectionStrings__JobsConnection="Host=prod-db;Database=asafarim_jobs;..."
   ```

2. **Authentication**:
   ```bash
   export AuthJwt__Issuer="https://identity.asafarim.be"
   export AuthJwt__Audience="asafarim-clients"
   export AuthJwt__Key="production-secret-key"
   ```

3. **Identity API**:
   ```bash
   export IdentityApiUrl="https://identity.asafarim.be"
   ```

4. **Build and Run**:
   ```bash
   dotnet publish -c Release -o ./publish
   cd publish
   dotnet Core.Api.dll
   ```

### Systemd Service
```ini
[Unit]
Description=Core API Service
After=network.target postgresql.service

[Service]
Type=notify
WorkingDirectory=/var/www/core-api
ExecStart=/usr/bin/dotnet /var/www/core-api/Core.Api.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=core-api
User=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production

[Install]
WantedBy=multi-user.target
```

### Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name core.asafarim.be;
    
    location / {
        proxy_pass http://localhost:5102;
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

1. **Database Connection Errors**
   ```bash
   # Check connection string
   dotnet ef database update --context CoreDbContext
   # Verify PostgreSQL is running
   systemctl status postgresql
   ```

2. **Authentication Failures**
   - Verify JWT configuration matches Identity API
   - Check token expiration
   - Ensure cookie domain is correct
   - Verify Identity API is accessible

3. **CORS Issues**
   - Verify allowed origins in configuration
   - Check request headers include credentials
   - Review browser console for CORS errors

4. **Migration Issues**
   - Ensure database exists
   - Check user permissions
   - Review migration history: `dotnet ef migrations list`

## 📄 License

Part of the asafarim.be monorepo. All rights reserved.

## 🤝 Contributing

This is a private monorepo project. For internal development guidelines, see the main repository documentation.

## 📞 Support

For issues or questions, contact the development team or create an issue in the repository.

---

**Version**: 1.0.0  
**Port**: 5102  
**Last Updated**: December 2025
