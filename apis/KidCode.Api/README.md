# KidCode API - Educational Creative Platform Backend

> A production-ready ASP.NET Core 8 Web API powering KidCode Studio. Provides project management, progress tracking, challenge system, leaderboards, and media management for an educational creative playground where kids learn coding through art, animation, puzzles, and music.

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4.svg)](https://dotnet.microsoft.com/)
[![C#](https://img.shields.io/badge/C%23-12-239120.svg)](https://docs.microsoft.com/en-us/dotnet/csharp/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791.svg)](https://www.postgresql.org/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-blue.svg)](https://jwt.io/)

## 🚀 Features

### 📁 Project Management
- **Save & Sync**: Store creative projects in the cloud
- **Multiple Modes**: Drawing, Story, Puzzle, Music creation
- **Block Serialization**: Save block-based code as JSON
- **Asset Management**: Store images, sounds, and custom assets
- **Version Control**: Track project history and changes

### 📊 Progress Tracking
- **Achievement System**: Earn stickers and badges
- **Level Unlocking**: Progressive content unlocking
- **Challenge Completion**: Track completed challenges
- **Statistics**: Monitor learning progress and activity
- **Leaderboards**: Compare progress with peers

### 🎯 Challenge System
- **Daily Challenges**: Fresh challenges every day
- **Progressive Difficulty**: Levels 1-5 for all skill levels
- **Mode-Specific**: Challenges for Drawing, Story, Puzzle, Music
- **Starter Blocks**: Pre-filled blocks to guide learners
- **Success Criteria**: Clear completion requirements
- **Rewards**: Sticker rewards for completion

### 🎮 Game Sessions
- **Session Management**: Track active play sessions
- **Session Analytics**: Monitor engagement and playtime
- **Session Persistence**: Resume interrupted sessions
- **Session Cleanup**: Automatic cleanup of old sessions

### 🏆 Leaderboards
- **Global Rankings**: Compare with all users
- **Mode-Specific**: Separate leaderboards per creative mode
- **Time-Based**: Daily, weekly, monthly rankings
- **Stat Tracking**: Multiple ranking criteria

### 🎨 Media Management
- **Asset Upload**: Store images and sounds
- **Character Assets**: Pre-built character library
- **Asset Organization**: Categorized asset collections
- **Asset Reuse**: Share assets across projects

### 🔐 Authentication & Authorization
- **JWT Bearer Tokens**: Secure token-based auth
- **Cookie Support**: Token storage in HTTP-only cookies
- **User Isolation**: Data scoped to authenticated users
- **Role-Based Access**: Support for different user roles

## 🏗️ Architecture

### Tech Stack
- **Framework**: ASP.NET Core 8.0
- **Language**: C# 12 with nullable reference types
- **Database**: PostgreSQL 14+ with Entity Framework Core 8.0
- **Authentication**: JWT Bearer tokens
- **Documentation**: Swagger/OpenAPI
- **Serialization**: JSON with JSONB support

### Project Structure
```
KidCode.Api/
├── Controllers/
│   ├── ProjectsController.cs          # Project CRUD operations
│   ├── ProgressController.cs          # Progress & achievements
│   ├── ChallengesController.cs        # Challenge management
│   ├── GameSessionsController.cs      # Session tracking
│   ├── LeaderboardController.cs       # Leaderboard rankings
│   ├── CharacterAssetsController.cs   # Character assets
│   ├── MediaController.cs             # Media management
│   └── StatsController.cs             # Statistics & analytics
├── Services/
│   ├── ProjectService.cs              # Project business logic
│   ├── ProgressService.cs             # Progress calculations
│   ├── ChallengeService.cs            # Challenge operations
│   ├── GameSessionService.cs          # Session management
│   ├── LeaderboardService.cs          # Ranking calculations
│   └── MediaService.cs                # Media operations
├── Models/
│   ├── Project.cs
│   ├── Progress.cs
│   ├── Challenge.cs
│   ├── GameSession.cs
│   ├── Leaderboard.cs
│   ├── CharacterAsset.cs
│   ├── Media.cs
│   └── User.cs
├── DTOs/
│   ├── ProjectDto.cs
│   ├── ProgressDto.cs
│   ├── ChallengeDto.cs
│   ├── GameSessionDto.cs
│   └── LeaderboardDto.cs
├── Data/
│   └── KidCodeDbContext.cs
└── Program.cs
```

## 🛠️ Installation

### Prerequisites
- .NET 8.0 SDK
- PostgreSQL 14+
- Identity API running (for JWT validation)

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
       "DefaultConnection": "Host=localhost;Database=kidcode;Username=postgres;Password=your_password"
     }
   }
   ```

3. **Configure JWT Authentication**:
   ```json
   {
     "AuthJwt": {
       "Key": "your-secret-key-min-32-chars",
       "Issuer": "https://identity.asafarim.be",
       "Audience": "kidcode-studio-client"
     }
   }
   ```

4. **Run database migrations**:
   ```bash
   dotnet ef database update
   ```

5. **Start the API**:
   ```bash
   dotnet run
   ```
   The API will be available at `http://localhost:5190`

## 🔧 Development

### Available Commands

| Command | Description |
|---------|-------------|
| `dotnet run` | Start the API server on port 5190 |
| `dotnet build` | Build the project |
| `dotnet test` | Run tests |
| `dotnet ef migrations add <Name>` | Create new migration |
| `dotnet ef database update` | Apply migrations |
| `dotnet watch run` | Run with hot reload |

### Configuration

#### Environment Variables
```bash
# Database
ConnectionStrings__DefaultConnection="Host=localhost;Database=kidcode;..."

# JWT Authentication
AuthJwt__Key="your-secret-key-min-32-chars"
AuthJwt__Issuer="https://identity.asafarim.be"
AuthJwt__Audience="kidcode-studio-client"
```

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
| `GET` | `/api/challenges/{id}` | Get challenge by ID | ❌ |

**Query Parameters:**
- `mode` - Filter by mode (Drawing, Story, Puzzle, Music)
- `level` - Filter by difficulty level (1-5)

**Example:**
```
GET /api/challenges?mode=Drawing&level=1
```

### Game Sessions

Track active play sessions.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/game-sessions` | List user's sessions | ✅ |
| `POST` | `/api/game-sessions` | Create new session | ✅ |
| `PUT` | `/api/game-sessions/{id}` | Update session | ✅ |
| `DELETE` | `/api/game-sessions/{id}` | End session | ✅ |

### Leaderboards

Global and mode-specific rankings.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/leaderboards` | Get global leaderboard | ❌ |
| `GET` | `/api/leaderboards/{mode}` | Get mode-specific leaderboard | ❌ |
| `GET` | `/api/leaderboards/weekly` | Get weekly rankings | ❌ |
| `GET` | `/api/leaderboards/monthly` | Get monthly rankings | ❌ |

### Character Assets

Pre-built character library.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/character-assets` | List all characters | ❌ |
| `GET` | `/api/character-assets/{id}` | Get character by ID | ❌ |
| `GET` | `/api/character-assets/category/{category}` | Get by category | ❌ |

### Media

User-uploaded media and assets.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/media` | List user's media | ✅ |
| `POST` | `/api/media/upload` | Upload new media | ✅ |
| `DELETE` | `/api/media/{id}` | Delete media | ✅ |

### Statistics

User statistics and analytics.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/stats/user` | Get user statistics | ✅ |
| `GET` | `/api/stats/global` | Get global statistics | ❌ |

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

### Game Sessions Table

| Column | Type | Description |
|--------|------|-------------|
| `Id` | GUID | Primary key |
| `UserId` | string | User ID |
| `ProjectId` | GUID | Associated project |
| `StartedAt` | DateTime | Session start |
| `EndedAt` | DateTime | Session end |
| `DurationSeconds` | int | Total duration |

### Leaderboard Table

| Column | Type | Description |
|--------|------|-------------|
| `Id` | GUID | Primary key |
| `UserId` | string | User ID |
| `Mode` | enum | Creative mode |
| `Score` | int | Ranking score |
| `Rank` | int | Current rank |
| `UpdatedAt` | DateTime | Last update |

## 🔐 Authentication

The API uses JWT Bearer tokens for authentication:

1. **Token Sources**:
   - Authorization header: `Bearer <token>`
   - Generated by Identity API

2. **Token Validation**:
   - Issuer validation
   - Audience validation
   - Signature validation
   - Lifetime validation

3. **Protected Endpoints**:
   - All `/api/projects` endpoints require authentication
   - All `/api/progress` endpoints require authentication
   - All `/api/game-sessions` endpoints require authentication
   - All `/api/media` endpoints require authentication

## 🚢 Deployment

### Production Configuration

1. **Database**:
   ```bash
   export ConnectionStrings__DefaultConnection="Host=prod-db;Database=kidcode;..."
   ```

2. **Authentication**:
   ```bash
   export AuthJwt__Key="production-secret-key"
   export AuthJwt__Issuer="https://identity.asafarim.be"
   export AuthJwt__Audience="kidcode-studio-client"
   ```

3. **Build and Run**:
   ```bash
   dotnet publish -c Release -o ./publish
   cd publish
   dotnet KidCode.Api.dll
   ```

### Systemd Service
```ini
[Unit]
Description=KidCode API Service
After=network.target postgresql.service

[Service]
Type=notify
WorkingDirectory=/var/www/kidcode-api
ExecStart=/usr/bin/dotnet /var/www/kidcode-api/KidCode.Api.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=kidcode-api
User=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production

[Install]
WantedBy=multi-user.target
```

### Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name kidcode-api.asafarim.be;
    
    location / {
        proxy_pass http://localhost:5190;
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
   - Verify PostgreSQL is running
   - Check connection string format
   - Ensure database exists
   - Verify user permissions

2. **Authentication Failures**
   - Verify JWT configuration matches Identity API
   - Check token expiration
   - Ensure user has required roles

3. **Migration Errors**
   - Verify database is accessible
   - Check for pending migrations
   - Review migration history

## � License

Part of the asafarim.be monorepo. All rights reserved.

## 🤝 Contributing

This is a private monorepo project. For internal development guidelines, see the main repository documentation.

## 📞 Support

For issues or questions, contact the development team or create an issue in the repository.

---

**Version**: 0.2.0  
**Port**: 5190  
**Last Updated**: December 2025
