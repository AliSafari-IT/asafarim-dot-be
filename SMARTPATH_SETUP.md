# SmartPath - Complete Setup Guide

## Project Overview

SmartPath is a full-stack family learning and homework tracker application for children aged 9-14.

**Technology Stack:**

- **Backend**: .NET 8, PostgreSQL, Entity Framework Core
- **Frontend**: React 18, TypeScript, Vite
- **Authentication**: JWT via Identity.Api
- **Design**: Shared design tokens, responsive UI

## Project Structure

```
asafarim-dot-be/
├── apis/
│   └── SmartPath.Api/          # .NET 8 Backend API
│       ├── Controllers/        # API endpoints
│       ├── Services/           # Business logic
│       ├── Entities/           # Database models
│       ├── Data/              # DbContext, migrations
│       └── Program.cs         # Startup configuration
│
└── apps/
    └── smartpath-ui/           # React Frontend
        ├── src/
        │   ├── api/           # API client
        │   ├── components/    # UI components
        │   ├── contexts/      # React contexts
        │   ├── pages/         # Page components
        │   └── App.tsx        # Main app
        └── vite.config.ts     # Vite configuration
```

## Prerequisites

### Required Software

- .NET 8 SDK
- Node.js 18+ and pnpm
- PostgreSQL 15+
- Identity.Api running (for authentication)

### URLs

**Development:**

- Backend API: `http://localhost:5109`
- Frontend: `http://smartpath.asafarim.local:5195`
- Identity API: `http://identity.asafarim.local:5177`

**Production:**

- Backend API: `https://smartpath.asafarim.be/api`
- Frontend: `https://smartpath.asafarim.be`
- Identity API: `https://identity.asafarim.be`

## Database Setup

### 1. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE smartpath;

# Grant permissions
GRANT ALL PRIVILEGES ON DATABASE smartpath TO postgres;

# Exit
\q
```

### 2. Update Connection String

Edit `apis/SmartPath.Api/appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=smartpath;Username=postgres;Password=YOUR_PASSWORD"
  }
}
```

## Backend Setup

### 1. Install Dependencies

```bash
cd D:\repos\asafarim-dot-be\apis\SmartPath.Api
dotnet restore
```

### 2. Configure JWT Authentication

Ensure JWT settings match Identity.Api in `appsettings.Development.json`:

```json
{
  "AuthJwt": {
    "Key": "0+a0ZklJy6DVL6osEj73W6P9inMk3+Ocn8KkQoUDR78=",
    "Issuer": "asafarim.local",
    "Audience": "asafarim.local"
  }
}
```

### 3. Run Migrations

```bash
# Migrations run automatically on startup
# Or manually:
dotnet ef database update
```

### 4. Start Backend

```bash
dotnet run
```

Backend will be available at `http://localhost:5109`

Swagger documentation: `http://localhost:5109/swagger`

## Frontend Setup

### 1. Install Dependencies

```bash
cd D:\repos\asafarim-dot-be\apps\smartpath-ui
pnpm install
```

### 2. Configure Environment

Verify `.env` file contains:

```env
VITE_IDENTITY_API_URL=http://identity.asafarim.local:5177
VITE_SMARTPATH_API_URL=http://localhost:5109
VITE_IS_PRODUCTION=false
```

### 3. Start Frontend

```bash
pnpm start
```

Frontend will be available at `http://smartpath.asafarim.local:5195`

## Testing the Application

### 1. Login Flow

1. Navigate to `http://smartpath.asafarim.local:5195`
2. Click "Sign In" - redirects to Identity Portal
3. Login with your credentials
4. Redirected back to SmartPath Dashboard

### 2. Create a Family

1. Go to Family page
2. Click "Create Family"
3. Enter family name
4. Add family members

### 3. Create Tasks

1. Go to Tasks page
2. Select a family
3. Click "Add Task"
4. Fill in task details
5. Assign to a child

### 4. Explore Courses

1. Go to Learning page
2. Browse available courses
3. Enroll in a course
4. Start lessons

## Database Schema

### Core Tables

**Users** - Synced from Identity.Api

- UserId (PK)
- IdentityUserId (unique)
- Email, DisplayName
- LastSyncedAt

**Families** - Family groups

- FamilyId (PK)
- FamilyName
- CreatedByUserId (FK)

**FamilyMembers** - User roles in families

- FamilyMemberId (PK)
- FamilyId, UserId (FK)
- Role (FamilyAdmin, Parent, Child)
- DateOfBirth

**Tasks** - Homework and activities

- TaskId (PK)
- FamilyId, AssignedToUserId (FK)
- Title, Description, Category
- DueDate, Status, Priority

**Courses/Chapters/Lessons** - Educational content

- CourseId, ChapterId, LessonId (PK)
- Hierarchical structure
- Grade levels, learning objectives

**LessonProgress** - Learning tracking

- ProgressId (PK)
- ChildUserId, LessonId (FK)
- MasteryLevel, SelfAssessmentScore
- NextReviewDate

**PracticeAttempts** - Practice history

- AttemptId (PK)
- ChildUserId, PracticeItemId (FK)
- IsCorrect, TimeSpentSeconds

**Achievements** - Badges and rewards

- AchievementId (PK)
- Name, Description, Category

**Streaks** - Study streak tracking

- StreakId (PK)
- UserId (FK)
- CurrentStreak, LongestStreak

## API Endpoints

### Authentication

All endpoints require JWT Bearer token from Identity.Api

### Families

- `GET /families/my-families` - Get user's families
- `GET /families/{id}` - Get family details
- `POST /families` - Create family
- `POST /families/{id}/members` - Add member

### Tasks

- `GET /tasks?familyId={id}` - Get family tasks
- `GET /tasks/{id}` - Get task details
- `POST /tasks` - Create task
- `PUT /tasks/{id}` - Update task
- `POST /tasks/{id}/complete` - Mark complete
- `DELETE /tasks/{id}` - Delete task

### Courses

- `GET /courses` - List all courses
- `GET /courses/{id}` - Get course details
- `GET /courses/{id}/chapters` - Get chapters
- `GET /courses/chapters/{id}/lessons` - Get lessons
- `GET /courses/lessons/{id}` - Get lesson details

### Progress

- `POST /progress/enrollments` - Enroll in course
- `GET /progress/children/{id}/enrollments` - Get enrollments
- `POST /progress/lessons/{id}/start` - Start lesson
- `POST /progress/lessons/{id}/complete` - Complete lesson
- `GET /progress/children/{id}/progress` - Get progress
- `POST /progress/practice-items/{id}/attempt` - Record attempt

## Troubleshooting

### Backend Issues

**Problem**: Database migration fails

```bash
# Solution: Drop and recreate database
psql -U postgres -c "DROP DATABASE smartpath;"
psql -U postgres -c "CREATE DATABASE smartpath;"
dotnet ef database update
```

**Problem**: 401 Unauthorized errors

- Check JWT key matches Identity.Api
- Verify token is present in localStorage
- Check CORS configuration

### Frontend Issues

**Problem**: Cannot connect to backend

- Verify backend is running on port 5109
- Check `.env` configuration
- Verify CORS allows your frontend URL

**Problem**: Login redirect loop

- Clear localStorage
- Check Identity.Api is running
- Verify callback URL configuration

### Common Errors

**"User not found"**

- User sync failed from Identity.Api
- Check Identity.Api is accessible
- Verify service account token

**"Family not found"**

- Create a family first
- Check user is family member

**"CORS policy error"**

- Add frontend URL to CORS policy in backend
- Restart backend after CORS changes

## Production Deployment

### Backend Deployment

1. Update `appsettings.json` with production values
2. Set secure JWT key (match Identity.Api)
3. Configure production database connection
4. Build: `dotnet publish -c Release`
5. Deploy to server
6. Run migrations: `dotnet ef database update`
7. Configure systemd service (Linux) or Windows Service

### Frontend Deployment

1. Build: `pnpm build`
2. Deploy `dist/` folder to web server
3. Configure reverse proxy (Nginx/Apache)
4. Set up SSL certificates
5. Configure SPA routing

### Nginx Configuration Example

```nginx
server {
    listen 443 ssl http2;
    server_name smartpath.asafarim.be;

    # Frontend
    root /var/www/smartpath-ui/dist;
    index index.html;

    # API proxy
    location /api/ {
        proxy_pass http://localhost:5109/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Development Workflow

### Making Changes

1. **Backend changes**: Edit C# files, changes auto-reload with `dotnet watch run`
2. **Frontend changes**: Edit TypeScript/React files, Vite HMR updates instantly
3. **Database changes**: Create migration with `dotnet ef migrations add MigrationName`

### Adding New Features

1. Create backend entity and add to DbContext
2. Create migration and update database
3. Add service interface and implementation
4. Create controller endpoints
5. Add frontend API client methods
6. Create/update React components
7. Test end-to-end functionality

## Support

For issues or questions:

- Check backend logs: `logs/smartpath-api-*.log`
- Check browser console for frontend errors
- Verify all services are running
- Check database connectivity

## License

MIT
