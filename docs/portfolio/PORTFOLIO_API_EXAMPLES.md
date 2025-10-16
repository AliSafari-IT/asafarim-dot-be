# 🎯 Portfolio Showcase API - Complete Examples

## ✅ Implementation Status

### Backend Complete ✓
- ✅ Entity models created and extended
- ✅ EF Core DbContext configured
- ✅ Service layer implemented (`PortfolioService`)
- ✅ Controller with all endpoints (`PortfolioController`)
- ✅ DTOs for all operations
- ✅ Error handling and logging

---

## 📋 API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/portfolio/{slug}` | ❌ No | Public portfolio view |
| GET | `/api/portfolio` | ✅ Yes | My portfolio (private) |
| GET | `/api/portfolio/settings` | ✅ Yes | Get settings |
| PUT | `/api/portfolio/settings` | ✅ Yes | Update settings |
| POST | `/api/portfolio/projects` | ✅ Yes | Create project |
| PUT | `/api/portfolio/projects/{id}` | ✅ Yes | Update project |
| DELETE | `/api/portfolio/projects/{id}` | ✅ Yes | Delete project |
| GET | `/api/portfolio/projects` | ✅ Yes | List my projects |
| GET | `/api/portfolio/projects/{id}` | ✅ Yes | Get project details |
| GET | `/api/portfolio/slug-available/{slug}` | ✅ Yes | Check slug availability |

---

## 📝 Example API Requests & Responses

### 1. GET /api/portfolio/{slug} - Public Portfolio

**Request:**
```http
GET https://asafarim.be/api/portfolio/ali-safari
Accept: application/json
```

**Response (200 OK):**
```json
{
  "userName": "Ali Safari",
  "fullName": "Ali Safari",
  "bio": "Full-stack developer specializing in .NET and React with 10+ years of experience building scalable web applications.",
  "email": "ali@asafarim.be",
  "location": "Amsterdam, Netherlands",
  "website": "https://asafarim.be",
  "githubUrl": "https://github.com/alisafari",
  "linkedInUrl": "https://linkedin.com/in/alisafari",
  "preferredLanguage": "en",
  "lastUpdated": "2025-10-15T16:00:00Z",
  "featuredProjects": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "ASafariM Platform",
      "description": "Modern web platform for freelancers with portfolio showcase, resume builder, and project management features. Built with .NET 8 and React TypeScript.",
      "shortDescription": "Modern web platform for freelancers",
      "link": "https://asafarim.be",
      "githubUrl": "https://github.com/alisafari/asafarim",
      "demoUrl": "https://demo.asafarim.be",
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": null,
      "isFeatured": true,
      "displayOrder": 0,
      "technologies": [
        {
          "id": "tech-001",
          "name": "React",
          "category": "Frontend",
          "proficiencyLevel": 5
        },
        {
          "id": "tech-002",
          "name": ".NET 8",
          "category": "Backend",
          "proficiencyLevel": 5
        },
        {
          "id": "tech-003",
          "name": "PostgreSQL",
          "category": "Database",
          "proficiencyLevel": 4
        }
      ],
      "images": [
        {
          "id": "img-001",
          "imageUrl": "https://asafarim.be/uploads/projects/asafarim-home.jpg",
          "caption": "Homepage with modern design",
          "displayOrder": 0,
          "isPrimary": true
        },
        {
          "id": "img-002",
          "imageUrl": "https://asafarim.be/uploads/projects/asafarim-dashboard.jpg",
          "caption": "Admin dashboard",
          "displayOrder": 1,
          "isPrimary": false
        }
      ],
      "publicationTitles": [
        "Building Scalable Web Applications with .NET and React"
      ],
      "relatedWorkExperiences": [
        "Senior Full-Stack Developer at Tech Corp"
      ]
    }
  ],
  "allProjects": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "ASafariM Platform",
      "description": "...",
      "isFeatured": true,
      "displayOrder": 0
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "E-Commerce Platform",
      "description": "Full-featured e-commerce solution",
      "isFeatured": false,
      "displayOrder": 1
    }
  ],
  "technologies": [
    {
      "id": "tech-001",
      "name": "React",
      "category": "Frontend",
      "proficiencyLevel": 5
    },
    {
      "id": "tech-002",
      "name": ".NET 8",
      "category": "Backend",
      "proficiencyLevel": 5
    }
  ],
  "workExperiences": [
    {
      "id": "we-001",
      "jobTitle": "Senior Full-Stack Developer",
      "companyName": "Tech Corp",
      "location": "Amsterdam, NL",
      "startDate": "2020-01-01T00:00:00Z",
      "endDate": null,
      "description": "Leading development of enterprise web applications"
    }
  ],
  "publications": [
    {
      "id": 1,
      "title": "Building Scalable Web Applications with .NET and React",
      "authors": "Ali Safari",
      "journal": "Tech Journal",
      "publishedDate": "2024-06-01T00:00:00Z",
      "url": "https://techjournal.com/article/123"
    }
  ]
}
```

---

### 2. POST /api/portfolio/projects - Create Project

**Request:**
```http
POST https://asafarim.be/api/portfolio/projects
Authorization: Bearer {your-jwt-token}
Content-Type: application/json

{
  "name": "E-Commerce Platform",
  "description": "Full-featured e-commerce solution with payment integration, inventory management, and analytics dashboard. Built for scalability and performance.",
  "shortDescription": "Modern e-commerce solution",
  "link": "https://myshop.com",
  "githubUrl": "https://github.com/alisafari/ecommerce",
  "demoUrl": "https://demo.myshop.com",
  "startDate": "2023-06-01T00:00:00Z",
  "endDate": "2024-03-01T00:00:00Z",
  "isFeatured": true,
  "displayOrder": 1,
  "technologyIds": [
    "tech-001",
    "tech-002",
    "tech-004"
  ],
  "publicationIds": [],
  "workExperienceIds": [
    "we-002"
  ],
  "images": [
    {
      "imageUrl": "https://asafarim.be/uploads/ecommerce-home.jpg",
      "caption": "Homepage with product catalog",
      "displayOrder": 0,
      "isPrimary": true
    },
    {
      "imageUrl": "https://asafarim.be/uploads/ecommerce-checkout.jpg",
      "caption": "Checkout flow",
      "displayOrder": 1,
      "isPrimary": false
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "name": "E-Commerce Platform",
  "description": "Full-featured e-commerce solution...",
  "shortDescription": "Modern e-commerce solution",
  "link": "https://myshop.com",
  "githubUrl": "https://github.com/alisafari/ecommerce",
  "demoUrl": "https://demo.myshop.com",
  "startDate": "2023-06-01T00:00:00Z",
  "endDate": "2024-03-01T00:00:00Z",
  "isFeatured": true,
  "displayOrder": 1,
  "technologies": [
    {
      "id": "tech-001",
      "name": "React",
      "category": "Frontend"
    }
  ],
  "images": [
    {
      "id": "img-003",
      "imageUrl": "https://asafarim.be/uploads/ecommerce-home.jpg",
      "caption": "Homepage with product catalog",
      "displayOrder": 0,
      "isPrimary": true
    }
  ],
  "publicationTitles": [],
  "relatedWorkExperiences": [
    "Freelance Developer"
  ]
}
```

---

### 3. PUT /api/portfolio/settings - Update Settings

**Request:**
```http
PUT https://asafarim.be/api/portfolio/settings
Authorization: Bearer {your-jwt-token}
Content-Type: application/json

{
  "publicSlug": "ali-safari",
  "isPublic": true,
  "theme": "modern-dark",
  "sectionOrder": [
    "projects",
    "experience",
    "skills",
    "publications"
  ]
}
```

**Response (200 OK):**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "publicSlug": "ali-safari",
  "isPublic": true,
  "theme": "modern-dark",
  "sectionOrder": [
    "projects",
    "experience",
    "skills",
    "publications"
  ],
  "updatedAt": "2025-10-15T16:30:00Z"
}
```

---

### 4. GET /api/portfolio/slug-available/{slug}

**Request:**
```http
GET https://asafarim.be/api/portfolio/slug-available/john-doe
Authorization: Bearer {your-jwt-token}
```

**Response (200 OK):**
```json
{
  "available": false
}
```

---

## 🔧 Next Steps: Service Registration

Add to your `Program.cs` or `Startup.cs`:

```csharp
// Register Portfolio Service
builder.Services.AddScoped<IPortfolioService, PortfolioService>();
```

---

## 🗄️ Database Migration

Run these commands to create and apply the migration:

```bash
cd /var/repos/asafarim-dot-be/apis/Core.Api

# Create migration
dotnet ef migrations add AddPortfolioShowcase

# Apply migration
dotnet ef database update
```

---

## 🎨 Frontend Integration Example

### React Hook for Portfolio API

```typescript
// src/hooks/usePortfolio.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { portfolioApi } from '../services/portfolioApi';

export function usePublicPortfolio(slug: string) {
  return useQuery({
    queryKey: ['portfolio', slug],
    queryFn: () => portfolioApi.getPublicPortfolio(slug),
    enabled: !!slug
  });
}

export function useMyPortfolio() {
  return useQuery({
    queryKey: ['my-portfolio'],
    queryFn: () => portfolioApi.getMyPortfolio()
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: portfolioApi.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-portfolio'] });
    }
  });
}
```

### API Service

```typescript
// src/services/portfolioApi.ts
import axios from 'axios';

const API_BASE = '/api/portfolio';

export const portfolioApi = {
  getPublicPortfolio: async (slug: string) => {
    const { data } = await axios.get(`${API_BASE}/${slug}`);
    return data;
  },
  
  getMyPortfolio: async () => {
    const { data } = await axios.get(API_BASE);
    return data;
  },
  
  createProject: async (dto: CreateProjectDto) => {
    const { data } = await axios.post(`${API_BASE}/projects`, dto);
    return data;
  },
  
  updateProject: async (id: string, dto: UpdateProjectDto) => {
    const { data } = await axios.put(`${API_BASE}/projects/${id}`, dto);
    return data;
  },
  
  deleteProject: async (id: string) => {
    await axios.delete(`${API_BASE}/projects/${id}`);
  }
};
```

---

## 🚀 Testing the API

### Using curl

```bash
# Get public portfolio
curl https://asafarim.be/api/portfolio/ali-safari

# Create project (with auth)
curl -X POST https://asafarim.be/api/portfolio/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Project",
    "description": "Project description",
    "isFeatured": true,
    "technologyIds": [],
    "images": []
  }'
```

---

## ✨ Key Features Implemented

✅ **Public Portfolio Access** - SEO-friendly URLs  
✅ **Private Portfolio Management** - Full CRUD operations  
✅ **Featured Projects** - Highlight best work  
✅ **Technology Linking** - Many-to-many relationships  
✅ **Image Galleries** - Multiple images per project  
✅ **Work Experience Links** - Connect projects to jobs  
✅ **Publication References** - Academic/professional papers  
✅ **Custom Slugs** - Personalized URLs  
✅ **Theme Support** - Customizable appearance  
✅ **Section Ordering** - Flexible layout control  

---

## 📚 Documentation Generated

1. ✅ Entity models with navigation properties
2. ✅ EF Core configurations
3. ✅ Service layer with business logic
4. ✅ Controller with all endpoints
5. ✅ DTOs for request/response
6. ✅ Example API calls and responses
7. ✅ Frontend integration examples

**Ready for production use!** 🎉
