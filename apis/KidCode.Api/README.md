# KidCode API 🚀

> Backend service for KidCode Studio - powering cloud saves, challenges, and progress tracking.

[![.NET](https://img.shields.io/badge/.NET-8-purple)](https://dotnet.microsoft.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

## 📋 Overview

The KidCode API provides backend services for the KidCode Studio application, including:

- **Project Management** - Save and sync creative projects
- **Progress Tracking** - Monitor achievements and unlocked levels
- **Challenge System** - Daily coding challenges for kids
- **User Authentication** - Secure JWT-based auth

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|----------|
| .NET | 8.0 | Web API framework |
| Entity Framework Core | 8.0 | ORM & migrations |
| PostgreSQL | 14+ | Database |
| JWT | - | Authentication |

## 🚀 Quick Start

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [PostgreSQL 14+](https://www.postgresql.org/download/)
- Database credentials

### Setup

1. **Configure Database**

Update `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=kidcode;Username=postgres;Password=YOUR_PASSWORD"
  },
  "Jwt": {
    "Key": "your-secret-key-min-32-chars",
    "Issuer": "KidCodeApi",
    "Audience": "KidCodeStudio"
  }
}
```

2. **Apply Migrations**

```bash
dotnet ef database update
```

3. **Run the API**

```bash
# From apis/KidCode.Api directory
dotnet run

# Or using pnpm (from monorepo root)
pnpm --filter @asafarim/kidcode-api start
```

API available at: `http://localhost:5190`

## 📡 API Endpoints

### Projects

Manage user creative projects.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/projects` | List user's projects | ✅ |
| `GET` | `/api/projects/{id}` | Get project by ID | ✅ |
| `POST` | `/api/projects` | Create new project | ✅ |
| `PUT` | `/api/projects/{id}` | Update project | ✅ |
| `DELETE` | `/api/projects/{id}` | Delete project | ✅ |

**Example Request:**

```json
POST /api/projects
{
  "title": "My Rainbow Drawing",
  "mode": "Drawing",
  "blocksJson": "[...]",
  "assets": {}
}
```

### Progress

Track user achievements and unlocked content.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/progress` | Get current user progress | ✅ |
| `GET` | `/api/progress/{userId}` | Get user progress by ID | ✅ |
| `POST` | `/api/progress/update` | Update progress | ✅ |

**Example Response:**

```json
{
  "userId": "user-123",
  "totalStickers": 7,
  "badges": ["FirstCircle", "RainbowArtist"],
  "unlockedLevels": [1, 2, 3],
  "completedChallenges": ["daily-001"]
}
```

### Challenges

Daily and progressive coding challenges.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/challenges` | List challenges | ❌ |
| `GET` | `/api/challenges/daily` | Get today's challenge | ❌ |

**Query Parameters:**

- `mode` - Filter by mode (Drawing, Story, Puzzle, Music)
- `level` - Filter by difficulty level (1-5)

**Example:**

```
GET /api/challenges?mode=Drawing&level=1
```

### Health

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/health` | API health check | ❌ |

## 🗄️ Database Schema

### Projects Table

| Column | Type | Description |
|--------|------|-------------|
| `Id` | GUID | Primary key |
| `Title` | string(200) | Project name |
| `Mode` | enum | Drawing, Story, Puzzle, Music |
| `BlocksJson` | JSONB | Serialized blocks |
| `Assets` | JSONB | Images, sounds, etc. |
| `UserId` | string | Owner ID |
| `CreatedAt` | DateTime | Creation timestamp |
| `UpdatedAt` | DateTime | Last modified |

### Progress Table

| Column | Type | Description |
|--------|------|-------------|
| `Id` | GUID | Primary key |
| `UserId` | string | User ID (unique) |
| `UnlockedLevelsJson` | JSONB | Array of unlocked levels |
| `BadgesJson` | JSONB | Array of earned badges |
| `CompletedChallengesJson` | JSONB | Array of challenge IDs |
| `TotalStickers` | int | Sticker count |
| `UpdatedAt` | DateTime | Last update |

### Challenges Table

| Column | Type | Description |
|--------|------|-------------|
| `Id` | GUID | Primary key |
| `Title` | string(200) | Challenge name |
| `Mode` | enum | Drawing, Story, Puzzle, Music |
| `Prompt` | string | Instructions for kids |
| `StarterBlocksJson` | JSONB | Pre-filled blocks |
| `SuccessCriteria` | string | Completion rules |
| `Level` | int | Difficulty (1-5) |
| `RewardSticker` | string | Sticker ID |
| `IsDaily` | bool | Daily challenge flag |
| `CreatedAt` | DateTime | Creation timestamp |

## 🔧 Development

### Database Migrations

```bash
# Create new migration
dotnet ef migrations add MigrationName

# Apply migrations
dotnet ef database update

# Rollback migration
dotnet ef database update PreviousMigrationName

# Remove last migration (if not applied)
dotnet ef migrations remove
```

### Build & Test

```bash
# Build project
dotnet build

# Run tests
dotnet test

# Watch mode (auto-reload)
dotnet watch run
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ConnectionStrings__DefaultConnection` | PostgreSQL connection string | ✅ |
| `Jwt__Key` | JWT signing key (min 32 chars) | ✅ |
| `Jwt__Issuer` | JWT issuer | ✅ |
| `Jwt__Audience` | JWT audience | ✅ |

## 🔐 Authentication

The API uses JWT Bearer tokens for authentication.

**Login Flow:**

1. User authenticates via Identity API
2. Receives JWT token
3. Includes token in requests: `Authorization: Bearer {token}`

**Protected Endpoints:**
All `/api/projects` and `/api/progress` endpoints require authentication.

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:5190/health
```

**Response:**

```json
{
  "status": "Healthy",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🚢 Deployment

### Production Checklist

- [ ] Update connection string in production config
- [ ] Set strong JWT secret key (min 32 characters)
- [ ] Apply database migrations
- [ ] Configure CORS for frontend domain
- [ ] Enable HTTPS
- [ ] Set up logging and monitoring
- [ ] Configure backup strategy

### Docker (Optional)

```bash
# Build image
docker build -t kidcode-api .

# Run container
docker run -p 5190:8080 \
  -e ConnectionStrings__DefaultConnection="Host=db;..." \
  kidcode-api
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Related Projects

- [KidCode Studio](../../apps/kidcode-studio) - Frontend application
- [Identity API](../Identity.Api) - Authentication service

---

**Part of the ASafariM monorepo**
