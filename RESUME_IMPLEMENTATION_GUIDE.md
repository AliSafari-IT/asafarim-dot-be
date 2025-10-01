# Resume Management System - Implementation Guide

## ✅ Completed

### Backend (C# .NET 8)

1. **CoreDbContext Updated** (`D:\repos\asafarim-dot-be\apis\Core.Api\Data\CoreDbContext.cs`)
   - Added all Resume-related DbSets
   - Configured EF Core Fluent API for all entities
   - Set up many-to-many relationships (Project ↔ Technology, WorkExperience ↔ Technology)
   - Added max length constraints and required fields

2. **ResumesController Created** (`D:\repos\asafarim-dot-be\apis\Core.Api\Controllers\ResumesController.cs`)
   - Full CRUD operations
   - Role-based filtering (Admin sees all, users see only their own)
   - Includes all DTOs and request models

### Models Already Created by User

- ✅ Resume.cs
- ✅ WorkExperience.cs & WorkAchievement.cs (updated to Guid)
- ✅ Certificate.cs
- ✅ Education.cs
- ✅ Skill.cs
- ✅ ContactInfo.cs
- ✅ Language.cs
- ✅ SocialLink.cs
- ✅ Award.cs
- ✅ Reference.cs
- ✅ Project.cs
- ✅ Technology.cs
- ✅ ProjectTechnology.cs
- ✅ WorkExperienceTechnology.cs

## 📋 Next Steps

### 1. Create EF Core Migration

```bash
cd D:\repos\asafarim-dot-be\apis\Core.Api
dotnet ef migrations add AddResumeEntities -o Migrations/Resume
dotnet ef database update
```

### 2. Create Additional Controllers

You need to create controllers for child entities:

- **SkillsController** - CRUD for skills within a resume
- **EducationsController** - CRUD for education items
- **CertificatesController** - CRUD for certificates
- **ProjectsController** - CRUD for projects
- **TechnologiesController** - CRUD for technologies (shared resource)
- **LanguagesController** - CRUD for languages
- **AwardsController** - CRUD for awards
- **ReferencesController** - CRUD for references

**Controller Template Pattern:**

```csharp
[ApiController]
[Route("api/resumes/{resumeId}/[controller]")]
public class SkillsController : ControllerBase
{
    // GET: api/resumes/{resumeId}/skills
    // POST: api/resumes/{resumeId}/skills
    // PUT: api/resumes/{resumeId}/skills/{id}
    // DELETE: api/resumes/{resumeId}/skills/{id}
}
```

### 3. Frontend Implementation

#### A. Create API Services (`D:\repos\asafarim-dot-be\apps\web\src\services\`)

Create these service files:

- `resumeApi.ts` - Resume CRUD
- `skillApi.ts` - Skills CRUD
- `educationApi.ts` - Education CRUD
- `certificateApi.ts` - Certificates CRUD
- `projectApi.ts` - Projects CRUD
- `technologyApi.ts` - Technologies CRUD
- `languageApi.ts` - Languages CRUD
- `awardApi.ts` - Awards CRUD
- `referenceApi.ts` - References CRUD

**Service Template:**

```typescript
import { CORE_API_BASE, getCookie } from '../api/core';

export interface ResumeDto {
  id: string;
  userId: string;
  title: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
}

export const fetchResumes = async (myResumes: boolean = false): Promise<ResumeDto[]> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  const params = new URLSearchParams();
  if (myResumes) params.append('myResumes', 'true');
  
  const response = await fetch(`${CORE_API_BASE}/resumes?${params}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });
  
  if (!response.ok) throw new Error('Failed to fetch resumes');
  return response.json();
};

// Add: createResume, updateResume, deleteResume, fetchResumeById
```

#### B. Create Resume Management Pages

**Directory Structure:**

```
D:\repos\asafarim-dot-be\apps\web\src\pages\admin\resume\
├── ResumeList.tsx          # Grid view of all resumes
├── ResumeDetail.tsx        # Tabbed detail view
├── ResumeForm.tsx          # Add/Edit resume form
├── tabs\
│   ├── SkillsTab.tsx       # Skills table + forms
│   ├── EducationTab.tsx    # Education table + forms
│   ├── CertificatesTab.tsx # Certificates table + forms
│   ├── ProjectsTab.tsx     # Projects table + forms
│   ├── LanguagesTab.tsx    # Languages table + forms
│   ├── AwardsTab.tsx       # Awards table + forms
│   └── ReferencesTab.tsx   # References table + forms
├── forms\
│   ├── SkillForm.tsx
│   ├── EducationForm.tsx
│   ├── CertificateForm.tsx
│   ├── ProjectForm.tsx
│   ├── LanguageForm.tsx
│   ├── AwardForm.tsx
│   └── ReferenceForm.tsx
└── resume-styles.css
```

**ResumeList.tsx Example:**

```typescript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@asafarim/shared-ui-react';
import { fetchResumes, type ResumeDto } from '../../../services/resumeApi';

const ResumeList: React.FC = () => {
  const [resumes, setResumes] = useState<ResumeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.roles?.includes('Admin');

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const data = await fetchResumes(!isAdmin);
      setResumes(data);
    } catch (error) {
      console.error('Failed to load resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-list">
      <header>
        <h1>Resume Management</h1>
        <button onClick={() => navigate('/admin/resume/new')}>
          Create New Resume
        </button>
      </header>
      
      <div className="resume-grid">
        {resumes.map(resume => (
          <div key={resume.id} className="resume-card" onClick={() => navigate(`/admin/resume/${resume.id}`)}>
            <h3>{resume.title}</h3>
            <p>{resume.summary}</p>
            <span>{new Date(resume.updatedAt).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResumeList;
```

#### C. Update Entity Management

Add Resume to `entityService.ts`:

```typescript
{
  id: 'resumes',
  name: 'resumes',
  displayName: 'Resumes',
  description: 'Manage resume profiles',
  icon: '📄',
  endpoint: '/resumes'
}
```

#### D. Add Routes to `main.tsx`

```typescript
import { ResumeList, ResumeDetail, ResumeForm } from './pages/admin/resume';

// Add routes:
{ path: "admin/resume", element: <ResumeList /> },
{ path: "admin/resume/new", element: <ResumeForm /> },
{ path: "admin/resume/:id", element: <ResumeDetail /> },
{ path: "admin/resume/:id/edit", element: <ResumeForm /> },
```

### 4. Key Features to Implement

#### Multi-Select for Technologies

```typescript
// In ProjectForm.tsx and WorkExperienceForm.tsx
<select multiple value={selectedTechs} onChange={handleTechChange}>
  {technologies.map(tech => (
    <option key={tech.id} value={tech.id}>{tech.name}</option>
  ))}
</select>
```

#### Enum Dropdowns

```typescript
// SkillLevel dropdown
<select value={skillLevel} onChange={e => setSkillLevel(e.target.value)}>
  <option value="Beginner">Beginner</option>
  <option value="Intermediate">Intermediate</option>
  <option value="Advanced">Advanced</option>
  <option value="Expert">Expert</option>
</select>

// LanguageLevel dropdown
<select value={languageLevel} onChange={e => setLanguageLevel(e.target.value)}>
  <option value="Basic">Basic</option>
  <option value="Intermediate">Intermediate</option>
  <option value="Fluent">Fluent</option>
  <option value="Native">Native</option>
</select>
```

#### Toast Notifications

```typescript
import { useNotifications } from '@asafarim/shared-ui-react';

const { showNotification } = useNotifications();

// On success
showNotification('Resume created successfully!', 'success');

// On error
showNotification('Failed to create resume', 'error');
```

#### Confirmation Modals

```typescript
const handleDelete = async (id: string) => {
  if (!window.confirm('Are you sure you want to delete this item?')) {
    return;
  }
  
  try {
    await deleteResume(id);
    showNotification('Deleted successfully', 'success');
    loadResumes();
  } catch (error) {
    showNotification('Failed to delete', 'error');
  }
};
```

## 🎨 Styling

Use the same CSS pattern as `entity-management.css`:

- Use `--color-*` variables for theming
- Responsive with `clamp()` for fluid typography
- Mobile-first approach
- Dark mode support via CSS variables

## 🔒 Security Checklist

- ✅ All endpoints require `[Authorize]` attribute
- ✅ Role-based filtering (Admin vs User)
- ✅ Ownership checks before update/delete
- ✅ JWT token in API requests
- ✅ CORS configured for credentials

## 📊 Testing Steps

1. Run migration: `dotnet ef database update`
2. Start backend: `pnpm api:core`
3. Start frontend: `pnpm dev:web`
4. Test as Admin: See all resumes
5. Test as User: See only own resumes
6. Test CRUD operations for each entity type

## 🚀 Priority Order

1. **High Priority**: Create migration and update database
2. **High Priority**: Create SkillsController, EducationsController, CertificatesController
3. **Medium Priority**: Create frontend API services
4. **Medium Priority**: Create ResumeList and ResumeDetail pages
5. **Low Priority**: Create individual tab components and forms

---

**Note**: This is a large feature. Implement incrementally and test each component before moving to the next.
