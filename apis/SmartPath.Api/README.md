# SmartPath.Api

Backend API for SmartPath - Family Learning & Homework Tracker for children aged 9-14.

Provides comprehensive endpoints for family management, course learning, practice sessions, rewards tracking, and graph-based pathfinding.

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

API will be available at: `http://smartpath.asafarim.local:5109`

Swagger documentation: `http://smartpath.asafarim.local:5109/swagger`

### Configuration

Update `appsettings.Development.json`:

- **Database**: Connection string for PostgreSQL
- **JWT Key**: Must match Identity.Api key
- **IdentityApi URL**: `http://identity.asafarim.local:5177`
- **CORS Origins**: Include frontend URL (`http://smartpath.asafarim.local:5195`)

## Project Structure

```
SmartPath.Api/
├── Controllers/       # API endpoints (Practice, PracticeItems, PracticeDashboard, Graphs, etc.)
├── Services/          # Business logic (Practice, PracticeItem, Pathfinding, Graph, etc.)
├── Entities/          # Database models (PracticeItem, PracticeSession, Graph, etc.)
├── Data/             # DbContext and migrations
├── Middleware/       # User context middleware
├── DTOs/             # Data transfer objects
├── Exceptions/       # Custom exceptions
└── Program.cs        # Application startup
```

## API Endpoints

### Authentication

All endpoints require JWT Bearer token from Identity.Api. Token passed in `Authorization: Bearer {token}` header.

### Users

- `GET /users/me` - Get current authenticated user info

### Families

- `GET /families/my-families` - Get user's families
- `GET /families/{familyId}` - Get family details
- `POST /families` - Create family
- `PUT /families/{familyId}` - Update family
- `DELETE /families/{familyId}` - Delete family
- `POST /families/{familyId}/members/by-email` - Add member by email
- `DELETE /families/{familyId}/members/users/{targetUserId}` - Remove member
- `POST /families/delete-bulk` - Delete multiple families

### Tasks

- `GET /tasks?familyId={familyId}` - Get family tasks with filtering
- `GET /tasks/{taskId}` - Get task details
- `POST /tasks` - Create task
- `PUT /tasks/{taskId}` - Update task
- `DELETE /tasks/{taskId}` - Delete task
- `POST /tasks/{taskId}/complete` - Mark task complete
- `POST /tasks/delete-bulk` - Delete multiple tasks

### Courses

- `GET /courses` - List all courses
- `GET /courses/{courseId}` - Get course details
- `POST /courses` - Create course
- `PUT /courses/{courseId}` - Update course
- `DELETE /courses/{courseId}` - Delete course
- `GET /courses/{courseId}/chapters` - Get course chapters
- `POST /courses/{courseId}/chapters` - Add chapter
- `GET /courses/chapters/{chapterId}` - Get chapter details
- `PUT /courses/chapters/{chapterId}` - Update chapter
- `DELETE /courses/chapters/{chapterId}` - Delete chapter
- `GET /courses/chapters/{chapterId}/lessons` - Get chapter lessons
- `POST /courses/chapters/{chapterId}/lessons` - Add lesson
- `GET /courses/lessons/{lessonId}` - Get lesson details

### Progress

- `POST /progress/enrollments` - Enroll in course
- `POST /progress/lessons/{lessonId}/start` - Start lesson
- `POST /progress/lessons/{lessonId}/complete` - Complete lesson
- `GET /progress/children/{childId}/progress` - Get child progress

### Practice Sessions

- `POST /practice/sessions` - Create practice session
- `POST /practice/sessions/{sessionId}/complete` - Complete session
- `POST /practice/sessions/{sessionId}/next-item` - Get next practice item
- `POST /practice/attempts` - Submit practice attempt
- `GET /practice/children/{childId}/summary` - Get child practice summary
- `GET /practice/families/{familyId}/summary` - Get family children summaries
- `GET /practice/children/{childId}/achievements` - Get child achievements
- `GET /practice/achievements` - Get available achievements

### Practice Items (Manager Only)

- `GET /practice-items/lessons/{lessonId}` - Get items for lesson
- `POST /practice-items` - Create practice item (familyManager, admin)
- `PUT /practice-items/{itemId}` - Update practice item (familyManager, admin)
- `DELETE /practice-items/{itemId}` - Soft delete practice item (familyManager, admin)

### Practice Dashboard (Manager Only)

- `GET /practice-dashboard/families/{familyId}` - Get family practice dashboard with child analytics

### Graphs & Pathfinding

- `GET /graphs` - List all graphs
- `GET /graphs/{graphId}` - Get graph details
- `POST /graphs` - Create graph
- `PUT /graphs/{graphId}` - Update graph
- `DELETE /graphs/{graphId}` - Delete graph
- `POST /graphs/{graphId}/find-path` - Find shortest path (A* or Dijkstra)

## Database Schema

### Core Tables

- **Users** - User accounts (synced from Identity.Api)
- **Families** - Family groups
- **FamilyMembers** - User roles in families (familyManager, familyMember)
- **Tasks** - Homework and activities with status tracking
- **Courses** - Educational courses with metadata
- **Chapters** - Course chapters
- **Lessons** - Individual lessons within chapters
- **LessonProgress** - Learning progress tracking per lesson

### Practice & Rewards Tables

- **PracticeItems** - Question/answer items for lessons (created by managers)
  - Properties: Id, LessonId, CreatedByUserId, QuestionText, ExpectedAnswer, Points, Difficulty, IsActive, CreatedAt, UpdatedAt
  - Soft-deleted via IsActive flag
- **PracticeSessions** - Practice session instances for children
  - Properties: Id, FamilyId, ChildUserId, LessonId, StartedAt, EndedAt, TotalPoints, Status
- **PracticeAttempts** - Individual attempt records
  - Properties: AttemptId, SessionId, ChildUserId, PracticeItemId, LessonId, Answer, IsCorrect, TimeSpentSeconds, HintsUsed, SelfRating, AttemptedAt
  - SessionId tracks which practice session each attempt belongs to (prevents cross-session item reuse)
- **Achievements** - Badge definitions and reward criteria
- **UserAchievements** - Earned achievements per user
- **Streaks** - Study streak tracking per user

### Graph & Pathfinding Tables

- **Graphs** - Graph definitions for pathfinding
- **GraphNodes** - Nodes within graphs (with X, Y coordinates)
- **GraphEdges** - Edges connecting nodes (with weight and direction)
- **PathRuns** - Pathfinding execution results

### Key Relationships

- Family → FamilyMembers (one-to-many)
- Course → Chapters (one-to-many)
- Chapter → Lessons (one-to-many)
- User → LessonProgress (one-to-many)
- Lesson → PracticeItems (one-to-many)
- PracticeSession → PracticeAttempts (one-to-many)
- User → PracticeAttempts (one-to-many)
- Graph → GraphNodes (one-to-many)
- Graph → GraphEdges (one-to-many)
- Graph → PathRuns (one-to-many)

## Authorization & RBAC

### Family Roles

- **familyManager** - Can manage family data, create/edit practice items, view practice dashboard
- **familyMember** - Read-only access to family data, can participate in practice sessions
- **admin** (global) - Can override family-level restrictions, manage all resources

### Authorization Rules

- Non-admin users can only add members as `familyMember`
- Non-admin users can only remove `familyMember` members
- Admin users can add/remove both roles
- Family managers can manage their own families
- Practice item CRUD restricted to `familyManager` and `admin` roles
- Practice dashboard analytics restricted to `familyManager` and `admin` roles
- Children can create practice sessions and submit attempts for lessons in their family

### Practice Item Management

- Only family managers and admins can create, edit, or delete practice items
- Practice items are soft-deleted (IsActive flag)
- Items are indexed by (LessonId, IsActive) for efficient querying
- Answer normalization (lowercase, trimmed) for case-insensitive comparison
- Points awarded based on item configuration

## Development

```bash
# Build
dotnet build

# Run development server
dotnet run

# Run with hot reload
dotnet watch run

# Run tests
dotnet test

# Create migration
dotnet ef migrations add MigrationName

# Update database
dotnet ef database update

# View migration status
dotnet ef migrations list
```

## Token Management

### Token Keys

- **Access Token**: Stored as `auth_token` in localStorage
- **Refresh Token**: Stored as `refresh_token` in localStorage

### Token Refresh Flow

1. Frontend sends request with `Authorization: Bearer {auth_token}`
2. API validates token
3. If token expired (401), frontend sends refresh request with `refresh_token`
4. API validates refresh token and returns new `auth_token`
5. Frontend retries original request with new token

## Error Handling

### Standard Error Responses

- **400 Bad Request** - Invalid input or validation error
- **401 Unauthorized** - Missing or invalid authentication
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **409 Conflict** - Resource already exists or state conflict
- **500 Internal Server Error** - Unexpected server error

## Production Deployment

1. Update `appsettings.json` with production values
2. Ensure JWT key matches Identity.Api
3. Configure HTTPS/reverse proxy
4. Set up database backups and replication
5. Configure CORS for production frontend URL
6. Enable logging and monitoring
7. Set up health check endpoint monitoring
8. Configure rate limiting if needed

## Environment Variables

- `ASPNETCORE_ENVIRONMENT` - Development/Production
- `ConnectionStrings:DefaultConnection` - PostgreSQL connection string
- `Jwt:Key` - JWT signing key (must match Identity.Api)
- `Jwt:Issuer` - JWT issuer (must match Identity.Api)
- `Jwt:Audience` - JWT audience (must match Identity.Api)
- `IdentityApiUrl` - Identity.Api base URL
- `AllowedOrigins` - CORS allowed origins (comma-separated)

## Recent Updates

### Practice Session Loop Fix (Latest)

- **SessionId Tracking**: Added SessionId to PracticeAttempt entity to track attempts per session
- **Session-Scoped Items**: GetNextItemAsync now tracks attempted items per session, preventing infinite loops
- **Session Completion**: When all items in a session are attempted, API returns "No more practice items available for this session"
- **Frontend Session Handling**: Frontend properly completes session and shows completion screen when no more items available
- **Migration**: Added migration to add SessionId column and foreign key relationship to PracticeSessions table

### Practice Content & Manager Dashboard

- **Practice Items**: Managers can create/edit/delete practice items with questions, expected answers, points, and difficulty levels
- **Practice Sessions**: Children can start practice sessions for lessons and receive next items dynamically
- **Answer Scoring**: Automatic answer normalization and scoring based on item configuration
- **Practice Dashboard**: Managers can view child performance analytics including:
  - Total points earned
  - Current streak days
  - Accuracy percentage
  - Recent attempts with results
  - Weak lessons (low accuracy areas)
- **Soft Delete**: Practice items use IsActive flag for soft deletion
- **Timestamps**: Auto-updated CreatedAt/UpdatedAt on practice items

### Graph Pathfinding MVP

- **Graph Management**: Create, edit, delete graphs with nodes and edges
- **Pathfinding Algorithms**: A* and Dijkstra implementations
- **Path Visualization**: Step-by-step path reconstruction with cost tracking
- **Graph Persistence**: Full CRUD operations with cascade delete

### Authentication & Authorization

- Consistent token key usage (`auth_token`, `refresh_token`)
- Improved token refresh flow with retry logic
- Centralized RBAC methods in IFamilyService
- Better error messages for authorization failures

### API Improvements

- Standardized endpoint naming and parameter usage
- Consistent error response format
- Improved validation and error handling
- Added bulk operations (delete-bulk)

### Database

- Proper foreign key relationships with cascade delete
- Indexes on frequently queried columns (LessonId, IsActive)
- Automatic migration on startup
- Timestamp auto-update in DbContext SaveChanges override

### Code Quality

- Service-based architecture for business logic
- DTOs for API contracts
- Middleware for user context extraction
- Comprehensive error handling
- Serilog structured logging throughout

## License

MIT
