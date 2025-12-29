# SmartPath.Api

Backend API for SmartPath - Family Learning & Homework Tracker for children aged 9-14.

## Quick Start

### Prerequisites

- .NET 8 SDK
- PostgreSQL 15+
- Identity.Api running (for authentication)

### Database Setup

```bash
# Create database
psql -U postgres -c "CREATE DATABASE smartpath;"

# Migrations run automatically on startup
```

### Run Development

```bash
cd D:\repos\asafarim-dot-be\apis\SmartPath.Api
dotnet run
```

API will be available at: `http://localhost:5109`

Swagger documentation: `http://localhost:5109/swagger`

### Configuration

Update `appsettings.Development.json`:

- **Database**: Connection string for PostgreSQL
- **JWT Key**: Must match Identity.Api key
- **IdentityApi URL**: `http://identity.asafarim.local:5177`

## Project Structure

```
SmartPath.Api/
├── Controllers/       # API endpoints
├── Services/          # Business logic
├── Entities/          # Database models
├── Data/             # DbContext and migrations
├── Middleware/       # User context middleware
└── Program.cs        # Application startup
```

## API Endpoints

### Authentication

All endpoints require JWT Bearer token from Identity.Api

### Families

- `GET /families/my-families` - Get user's families
- `POST /families` - Create family
- `POST /families/{id}/members` - Add family member

### Tasks

- `GET /tasks?familyId={id}` - Get family tasks
- `POST /tasks` - Create task
- `POST /tasks/{id}/complete` - Mark complete

### Courses

- `GET /courses` - List courses
- `GET /courses/{id}/chapters` - Get chapters
- `GET /courses/chapters/{id}/lessons` - Get lessons

### Progress

- `POST /progress/enrollments` - Enroll in course
- `POST /progress/lessons/{id}/start` - Start lesson
- `POST /progress/lessons/{id}/complete` - Complete lesson
- `GET /progress/children/{id}/progress` - Get child progress

## Database Schema

- **Users** - Synced from Identity.Api
- **Families** - Family groups
- **FamilyMembers** - User roles in families
- **Tasks** - Homework and activities
- **Courses/Chapters/Lessons** - Educational content
- **LessonProgress** - Learning tracking
- **PracticeAttempts** - Practice history
- **Achievements** - Badges and rewards
- **Streaks** - Study streak tracking

## Development

```bash
# Build
dotnet build

# Run tests (when added)
dotnet test

# Create migration
dotnet ef migrations add MigrationName

# Update database
dotnet ef database update
```

## Production Deployment

1. Update `appsettings.json` with production values
2. Ensure JWT key matches Identity.Api
3. Configure HTTPS/reverse proxy
4. Set up database backups
5. Configure CORS for production frontend URL

## Environment Variables

- `ASPNETCORE_ENVIRONMENT` - Development/Production
- Connection strings in appsettings.json
- JWT configuration shared with Identity.Api
