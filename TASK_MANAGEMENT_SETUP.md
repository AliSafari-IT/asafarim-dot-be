# Task Management Application - Setup & Implementation Guide

## Overview

A complete full-stack Task Management Application built with React + TypeScript (frontend) and ASP.NET Core 8 (backend), integrated with the existing ASafariM infrastructure.

## Project Structure

### Backend: `apis/Tasks.Api`

**Technology Stack:**
- ASP.NET Core 8
- Entity Framework Core 8
- PostgreSQL
- JWT Authentication

**Key Components:**

1. **Models** (`Models/`)
   - `Task.cs` - Core task entity
   - `TaskProject.cs` - Project entity
   - `ProjectMember.cs` - User-project relationship with roles
   - `TaskAssignment.cs` - Task-user assignment
   - `TaskComment.cs` - Comments on tasks
   - `TaskAttachment.cs` - File attachments
   - Enums: `TaskStatus`, `TaskPriority`, `ProjectRole`

2. **DTOs** (`DTOs/`)
   - `TaskDto.cs` - Task data transfer objects
   - `ProjectDto.cs` - Project DTOs
   - `ProjectMemberDto.cs` - Member management DTOs
   - `TaskCommentDto.cs` - Comment DTOs
   - `TaskAttachmentDto.cs` - Attachment DTOs

3. **Services** (`Services/`)
   - `ITaskService` / `TaskService` - Task business logic
   - `IProjectService` / `ProjectService` - Project management
   - `IPermissionService` / `PermissionService` - Role-based access control

4. **Controllers** (`Controllers/`)
   - `TasksController` - Task CRUD with filtering/sorting
   - `ProjectsController` - Project management
   - `ProjectMembersController` - Member role management
   - `TaskCommentsController` - Comment management
   - `HealthController` - Health check endpoint

5. **Database** (`Data/`)
   - `TasksDbContext.cs` - EF Core DbContext
   - Migrations in `Migrations/` folder

**Configuration Files:**
- `Program.cs` - Startup configuration, CORS, JWT auth
- `appsettings.json` - Production settings
- `appsettings.Development.json` - Development settings
- `Tasks.Api.csproj` - Project file with dependencies

**API Endpoints:**

```
POST   /api/tasks                          - Create task
GET    /api/tasks/{id}                     - Get task
GET    /api/tasks/project/{projectId}     - List project tasks (with filtering)
PUT    /api/tasks/{id}                     - Update task
PATCH  /api/tasks/{id}/status              - Update task status
DELETE /api/tasks/{id}                     - Delete task

GET    /api/projects/{id}                  - Get project
GET    /api/projects/my-projects           - Get user's projects
GET    /api/projects/shared                - Get shared projects
POST   /api/projects                       - Create project
PUT    /api/projects/{id}                  - Update project
DELETE /api/projects/{id}                  - Delete project

GET    /api/projects/{projectId}/members   - List project members
POST   /api/projects/{projectId}/members   - Add member
PUT    /api/projects/{projectId}/members/{memberId} - Update member role
DELETE /api/projects/{projectId}/members/{memberId} - Remove member

GET    /api/tasks/{taskId}/comments        - List comments
POST   /api/tasks/{taskId}/comments        - Add comment
PUT    /api/tasks/{taskId}/comments/{commentId} - Update comment
DELETE /api/tasks/{taskId}/comments/{commentId} - Delete comment

GET    /api/health                         - Health check
```

### Frontend: `apps/tasks-ui`

**Technology Stack:**
- React 19.1.1
- TypeScript
- React Router v6
- Vite
- Pure CSS with shared design tokens

**Project Structure:**

```
src/
├── api/
│   ├── taskService.ts      - Task API client
│   └── projectService.ts   - Project API client
├── config/
│   └── api.ts              - API configuration
├── pages/
│   ├── Dashboard.tsx       - Overview page
│   ├── Dashboard.css
│   ├── ProjectList.tsx     - Projects listing
│   ├── ProjectList.css
│   ├── ProjectDetail.tsx   - Project detail (placeholder)
│   └── TaskDetail.tsx      - Task detail (placeholder)
├── App.tsx                 - Main app component
├── App.css                 - App styles
├── main.tsx                - Entry point
├── index.css               - Global styles
└── vite-env.d.ts           - Vite type definitions
```

**Key Features:**

1. **Authentication**
   - Integrated with ASafariM Identity API
   - Cookie-based JWT authentication
   - Shared `useAuth` hook from `@asafarim/shared-ui-react`
   - Automatic sign-in/sign-out flow

2. **Dashboard**
   - Overview of user's projects
   - Quick statistics (total projects, tasks)
   - Project cards with task/member counts

3. **Project Management**
   - List all projects (owned + shared)
   - View project details
   - Create new projects
   - Manage project members

4. **Task Management**
   - Create tasks within projects
   - Update task status, priority, due date
   - Assign tasks to users
   - Filter and sort tasks
   - Add comments to tasks

5. **Responsive Design**
   - Mobile-first approach
   - Breakpoints: 480px, 768px, 1024px
   - Touch-friendly interface

**Configuration:**

Development:
- API: `http://tasks.asafarim.local:5103/api`
- Identity: `http://identity.asafarim.local:5101`
- Port: 5176

Production:
- API: `https://tasks.asafarim.be/api`
- Identity: `https://identity.asafarim.be`

## Database Schema

**Tables:**

1. `Projects` - Project records
   - Id (UUID, PK)
   - Name, Description
   - UserId (Owner)
   - IsPrivate
   - CreatedAt, UpdatedAt

2. `ProjectMembers` - User-project relationships
   - Id (UUID, PK)
   - ProjectId, UserId
   - Role (Admin, Manager, Member)
   - JoinedAt
   - Unique constraint: (ProjectId, UserId)

3. `Tasks` - Task records
   - Id (UUID, PK)
   - ProjectId (FK)
   - Title, Description
   - Status (ToDo, InProgress, Done, Blocked, Archived)
   - Priority (Low, Medium, High, Critical)
   - DueDate
   - CreatedBy, CreatedAt, UpdatedAt
   - Indexes: ProjectId, Status, DueDate

4. `TaskAssignments` - User-task assignments
   - Id (UUID, PK)
   - TaskId, UserId
   - AssignedAt
   - Unique constraint: (TaskId, UserId)

5. `TaskComments` - Comments on tasks
   - Id (UUID, PK)
   - TaskId (FK)
   - UserId, Content
   - CreatedAt, UpdatedAt

6. `TaskAttachments` - File attachments
   - Id (UUID, PK)
   - TaskId (FK)
   - FileName, FileUrl, FileSize, ContentType
   - UploadedBy, UploadedAt

## Authentication & Authorization

**JWT Configuration:**

Development:
- Issuer: `http://identity.asafarim.local:5101`
- Audience: `asafarim-api`
- Key: `dev-secret-key-change-in-production-12345678901234567890`

Production:
- Issuer: `https://identity.asafarim.be`
- Audience: `asafarim-api`
- Key: (from environment variable)

**Role-Based Access Control:**

- **Admin**: Full control - manage all projects, tasks, users
- **Manager**: Can add/remove collaborators, manage all tasks in project
- **Member**: Can create and manage own tasks in shared projects
- **Owner**: Project owner (implicit Admin role)

**Permission Rules:**

- Only project owner or admin can delete projects
- Only project owner or admin can manage members
- Only task creator, project admin, or manager can edit tasks
- Only task creator or admin can delete tasks
- All project members can view and comment on tasks
- Private projects: only members can access

## Setup Instructions

### Backend Setup

1. **Prerequisites:**
   - .NET 8 SDK
   - PostgreSQL 12+

2. **Database Setup:**
   ```bash
   # Create database
   createdb asafarim_tasks_dev

   # Run migrations
   cd apis/Tasks.Api
   dotnet ef database update
   ```

3. **Configuration:**
   - Update `appsettings.Development.json` with your database connection string
   - Ensure Identity API is running on `http://identity.asafarim.local:5101`

4. **Run Development Server:**
   ```bash
   cd apis/Tasks.Api
   dotnet watch run
   # API will be available at http://localhost:5103
   ```

### Frontend Setup

1. **Prerequisites:**
   - Node.js 18+
   - pnpm (recommended)

2. **Install Dependencies:**
   ```bash
   cd apps/tasks-ui
   pnpm install
   ```

3. **Run Development Server:**
   ```bash
   pnpm dev
   # App will be available at http://localhost:5176
   ```

4. **Build for Production:**
   ```bash
   pnpm build
   ```

## Development Workflow

### Adding a New Feature

1. **Backend:**
   - Add model/entity if needed
   - Create/update DTOs
   - Implement service logic
   - Add controller endpoint
   - Create migration: `dotnet ef migrations add FeatureName`

2. **Frontend:**
   - Add API service methods
   - Create page/component
   - Add route in App.tsx
   - Style with CSS using shared tokens

### Testing API

Use the provided `.http` files or tools like Postman:

```bash
# Get project tasks
GET http://localhost:5103/api/tasks/project/{projectId}

# Create task
POST http://localhost:5103/api/tasks
Content-Type: application/json

{
  "projectId": "...",
  "title": "Task Title",
  "description": "Task description",
  "status": 0,
  "priority": 1,
  "dueDate": "2025-12-31T23:59:59Z",
  "assignedUserIds": ["user-id"]
}
```

## Deployment

### Backend Deployment

1. Build Docker image or publish to server
2. Set environment variables:
   - `ConnectionStrings__DefaultConnection`
   - `AuthJwt__Key`
   - `ALLOWED_ORIGINS`
3. Run migrations on startup
4. Configure reverse proxy (nginx/IIS)

### Frontend Deployment

1. Build: `pnpm build`
2. Deploy `dist/` folder to Netlify/Vercel
3. Configure environment for production API endpoints
4. Set up SSL certificate

## Monitoring & Maintenance

- Monitor API health: `GET /api/health`
- Check database migrations: `dotnet ef migrations list`
- Review logs for authentication issues
- Monitor task/project creation rates

## Future Enhancements

- [ ] Kanban board view with drag-and-drop
- [ ] Real-time updates via WebSockets
- [ ] File upload for attachments
- [ ] Email notifications
- [ ] Task templates
- [ ] Recurring tasks
- [ ] Time tracking
- [ ] Advanced filtering and search
- [ ] Export to CSV/PDF
- [ ] Mobile app (React Native)

## Troubleshooting

**401 Unauthorized:**
- Verify JWT token is valid
- Check cookie domain matches (.asafarim.local)
- Ensure Identity API is running

**CORS Errors:**
- Verify frontend origin is in `allowedOrigins` in Program.cs
- Check credentials: 'include' is set in fetch requests

**Database Connection:**
- Verify PostgreSQL is running
- Check connection string in appsettings
- Run migrations: `dotnet ef database update`

**Module Not Found (Frontend):**
- Run `pnpm install` to install dependencies
- Clear node_modules and reinstall if issues persist

## Support & Documentation

- Backend API docs: Swagger UI at `/swagger`
- Frontend README: `apps/tasks-ui/README.md`
- Architecture docs: `docs/architecture/`
