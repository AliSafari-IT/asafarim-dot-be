# AI API - Intelligent Career Services Backend

> A robust ASP.NET Core Web API providing AI-powered services for career development, including conversational AI, resume generation, and job application tools.

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4.svg)](https://dotnet.microsoft.com/)
[![C#](https://img.shields.io/badge/C%23-12-239120.svg)](https://docs.microsoft.com/en-us/dotnet/csharp/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-API-412991.svg)](https://openai.com/)

## 🚀 Features

### 💬 Chat System
- **Conversational AI**: Real-time chat powered by OpenAI GPT models
- **Session Management**: Persistent chat sessions with full conversation history
- **Context Awareness**: Maintains conversation context across messages
- **User Isolation**: Secure, user-specific chat sessions
- **Performance Tracking**: Response time and token usage monitoring

### 📋 Resume Services
- **Functional Resume Generation**: Transform detailed CVs into optimized functional resumes
- **AI-Powered Optimization**: Intelligent content structuring and formatting
- **Skills Extraction**: Automatic identification of key competencies
- **Project Highlighting**: Strategic emphasis on relevant achievements

### 🔧 Job Tools
- **Job Description Analysis**: Extract requirements, keywords, and qualifications
- **Skills Matching**: Calculate compatibility scores between candidates and positions
- **Cover Letter Generation**: Create personalized, professional cover letters
- **Requirement Parsing**: Separate must-have from nice-to-have qualifications

## 🏗️ Architecture

### Tech Stack
- **Framework**: ASP.NET Core 8.0
- **Language**: C# 12 with nullable reference types
- **Database**: PostgreSQL with Entity Framework Core 8.0
- **Authentication**: JWT Bearer tokens with cookie support
- **AI Provider**: OpenAI API (configurable endpoint)
- **Documentation**: Swagger/OpenAPI
- **Logging**: Custom shared logging library

### Project Structure
```
Ai.Api/
├── Controllers/
│   ├── ChatController.cs           # Chat endpoints
│   ├── ChatSessionsController.cs   # Session management
│   ├── ChatMessagesController.cs   # Message operations
│   ├── ResumeController.cs         # Resume generation
│   ├── JobToolsController.cs       # Job analysis tools
│   └── HealthController.cs         # Health checks
├── Models/
│   ├── ChatSession.cs              # Chat session entity
│   ├── ChatMessage.cs              # Message entity
│   ├── ChatRequest.cs              # Request DTOs
│   └── FunctionalResumeRequest.cs  # Resume DTOs
├── DTOs/                           # Data transfer objects
├── Data/
│   └── SharedDbContext.cs          # EF Core context
├── OpenAI/
│   ├── IOpenAiService.cs           # Service interface
│   ├── OpenAiService.cs            # OpenAI integration
│   └── OpenAiOptions.cs            # Configuration
├── Extensions/
│   └── MigrationExtensions.cs      # Database utilities
├── Migrations/                     # EF Core migrations
├── Program.cs                      # Application startup
└── appsettings.json                # Configuration
```

## 🛠️ Installation

### Prerequisites
- .NET 8.0 SDK
- PostgreSQL 16+
- OpenAI API key (or compatible endpoint)
- Node.js and pnpm (for monorepo context)

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
       "SharedConnection": "Host=localhost;Database=asafarim_ai;Username=postgres;Password=your_password"
     }
   }
   ```

3. **Configure OpenAI**:
   ```json
   {
     "OpenAI": {
       "ApiKey": "sk-...",
       "BaseUrl": "https://api.openai.com/v1",
       "Model": "gpt-4o-mini",
       "Temperature": 0.7,
       "MaxTokens": 512,
       "UseMockOnFailure": true
     }
   }
   ```

4. **Configure JWT Authentication** (optional):
   ```json
   {
     "AuthJwt": {
       "Issuer": "https://identity.asafarim.be",
       "Audience": "asafarim-api",
       "Key": "your-secret-key-min-32-chars"
     }
   }
   ```

5. **Run database migrations**:
   ```bash
   dotnet ef database update
   ```

6. **Start the API**:
   ```bash
   dotnet run
   ```
   The API will be available at `http://localhost:5103`

## 🔧 Development

### Available Commands

| Command | Description |
|---------|-------------|
| `dotnet run` | Start the API server |
| `dotnet build` | Build the project |
| `dotnet test` | Run tests |
| `dotnet ef migrations add <Name>` | Create new migration |
| `dotnet ef database update` | Apply migrations |
| `dotnet watch run` | Run with hot reload |

### Configuration

#### Environment Variables
```bash
# Database
ConnectionStrings__SharedConnection="Host=localhost;Database=asafarim_ai;..."

# OpenAI
OpenAI__ApiKey="sk-..."
OpenAI__Model="gpt-4o-mini"
OpenAI__Temperature="0.7"

# Authentication
AuthJwt__Issuer="https://identity.asafarim.be"
AuthJwt__Audience="asafarim-api"
AuthJwt__Key="your-secret-key"

# CORS
ALLOWED_ORIGINS="https://ai.asafarim.be,https://asafarim.be"
```

#### CORS Configuration
The API automatically configures CORS based on environment:

**Development**:
- `http://ai.asafarim.local:5173`
- `http://localhost:5173`

**Production**:
- `https://asafarim.be`
- `https://ai.asafarim.be`
- `https://*.asafarim.be` (all subdomains)

## 📡 API Endpoints

### Chat Endpoints

#### POST /chat
Send a message and get AI response.

**Request**:
```json
{
  "message": "How do I improve my resume?",
  "sessionId": "uuid-optional",
  "sessionTitle": "Resume Help"
}
```

**Response**:
```json
{
  "sessionId": "uuid",
  "answer": "Here are some tips...",
  "session": {
    "id": "uuid",
    "title": "Resume Help",
    "messageCount": 2,
    "createdAt": "2025-12-23T14:00:00Z"
  },
  "messages": [...]
}
```

#### GET /chat-sessions
Get all chat sessions for the current user.

**Response**:
```json
[
  {
    "id": "uuid",
    "title": "Resume Help",
    "description": "Started with: How do I...",
    "messageCount": 5,
    "lastMessageAt": "2025-12-23T14:30:00Z",
    "isArchived": false
  }
]
```

#### GET /chat-sessions/{id}
Get a specific chat session with all messages.

#### PUT /chat-sessions/{id}
Update session (title, archive status).

#### DELETE /chat-sessions/{id}
Soft delete a session.

### Resume Endpoints

#### POST /resume/functional
Generate a functional resume from detailed CV.

**Request**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "summary": "Experienced software engineer...",
  "skills": ["C#", "React", "PostgreSQL"],
  "detailedCv": "Full CV text..."
}
```

**Response**:
```json
{
  "userId": "user-id",
  "raw": "{\"name\":\"John Doe\",\"summary\":\"...\",\"skills\":[...],\"projects\":[...],\"achievements\":[...]}"
}
```

#### GET /resume/health
Health check endpoint for resume service.

### Job Tools Endpoints

#### POST /extract/job
Extract key information from job description.

**Request**:
```json
{
  "text": "We are looking for a Senior Developer with 5+ years..."
}
```

**Response**:
```json
{
  "title": "Senior Developer",
  "mustHave": ["5+ years experience", "C#", "React"],
  "niceToHave": ["Cloud experience", "Team leadership"],
  "keywords": ["developer", "senior", "full-stack"]
}
```

#### POST /score/match
Calculate skills match score.

**Request**:
```json
{
  "candidateSkills": ["C#", "React", "PostgreSQL", "Docker"],
  "jobSkills": ["C#", "React", "Azure", "Kubernetes"]
}
```

**Response**:
```json
{
  "score": 0.5
}
```

#### POST /generate/cover-letter
Generate a tailored cover letter.

**Request**:
```json
{
  "jobTitle": "Senior Developer",
  "company": "Tech Corp",
  "highlights": ["10 years experience", "Led team of 5"],
  "tone": "professional"
}
```

**Response**:
```json
{
  "letter": "Dear Hiring Manager,\n\nI am writing to express..."
}
```

### Health Endpoints

#### GET /health
General API health check.

**Response**:
```json
{
  "status": "Healthy",
  "service": "AI API",
  "version": "1.0.0",
  "environment": "Production",
  "timestamp": "2025-12-23T14:00:00Z"
}
```

## 🗄️ Database Schema

### ChatSessions Table
```sql
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    last_message_at TIMESTAMP,
    is_archived BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    message_count INTEGER DEFAULT 0
);
```

### ChatMessages Table
```sql
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES chat_sessions(id),
    user_id VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    tokens_used INTEGER,
    model_used VARCHAR(100),
    response_time_ms BIGINT
);
```

## 🔐 Authentication

The API supports JWT Bearer authentication:

1. **Token Sources**:
   - Authorization header: `Bearer <token>`
   - HTTP-only cookie: `atk`

2. **Claims Required**:
   - `sub` or `NameIdentifier`: User ID

3. **Anonymous Access**:
   - Chat endpoints support anonymous users (userId: "anonymous")
   - Resume and job tools can work without authentication (for testing)

## 🎯 OpenAI Integration

### Service Interface
```csharp
public interface IOpenAiService
{
    Task<string> CompleteAsync(string systemPrompt, string userPrompt, CancellationToken ct);
    Task<string> GetChatCompletionAsync(List<string> conversationHistory);
}
```

### Configuration Options
- **BaseUrl**: OpenAI API endpoint (default: `https://api.openai.com/v1`)
- **Model**: GPT model to use (default: `gpt-3.5-turbo`)
- **Temperature**: Response randomness 0-1 (default: `0.7`)
- **MaxTokens**: Maximum response length (default: `512`)
- **UseMockOnFailure**: Fallback to mock responses (default: `true`)

### Error Handling
- Automatic retry logic
- Graceful degradation with mock responses
- Detailed error logging
- HTTP status code mapping

## 🚢 Deployment

### Production Configuration

1. **Database**:
   ```bash
   # Use production connection string
   export ConnectionStrings__SharedConnection="Host=prod-db;Database=asafarim_ai;..."
   ```

2. **OpenAI**:
   ```bash
   # Use production API key
   export OpenAI__ApiKey="sk-prod-..."
   export OpenAI__Model="gpt-4o-mini"
   ```

3. **Authentication**:
   ```bash
   export AuthJwt__Issuer="https://identity.asafarim.be"
   export AuthJwt__Key="production-secret-key"
   ```

4. **Build and Run**:
   ```bash
   dotnet publish -c Release -o ./publish
   cd publish
   dotnet Ai.Api.dll
   ```

### Docker Deployment
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY publish/ .
EXPOSE 5103
ENTRYPOINT ["dotnet", "Ai.Api.dll"]
```

### Systemd Service
```ini
[Unit]
Description=AI API Service
After=network.target postgresql.service

[Service]
Type=notify
WorkingDirectory=/var/www/ai-api
ExecStart=/usr/bin/dotnet /var/www/ai-api/Ai.Api.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=ai-api
User=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production

[Install]
WantedBy=multi-user.target
```

## 📊 Monitoring

### Health Checks
- `/health` - General API health
- `/resume/health` - Resume service health

### Logging
- Structured logging with Shared.Logging library
- Request/response logging
- Error tracking with stack traces
- Performance metrics (response times, token usage)

### Metrics to Monitor
- API response times
- OpenAI API latency
- Database query performance
- Token usage and costs
- Error rates by endpoint

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Check connection string
   dotnet ef database update
   # Verify PostgreSQL is running
   systemctl status postgresql
   ```

2. **OpenAI API Errors**
   - Verify API key is valid
   - Check rate limits and quotas
   - Review error logs for specific issues
   - Enable mock responses for testing

3. **CORS Issues**
   - Verify allowed origins in configuration
   - Check request headers include credentials
   - Review browser console for CORS errors

4. **Authentication Failures**
   - Verify JWT configuration matches Identity API
   - Check token expiration
   - Ensure cookie domain is correct

## 📄 License

Part of the asafarim.be monorepo. All rights reserved.

## 🤝 Contributing

This is a private monorepo project. For internal development guidelines, see the main repository documentation.

## 📞 Support

For issues or questions, contact the development team or create an issue in the repository.

---

**Version**: 1.0.0  
**Port**: 5103  
**Last Updated**: December 2025
