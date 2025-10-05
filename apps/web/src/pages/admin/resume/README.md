# Resume Section Management

This directory contains a reusable architecture for managing all resume sections (Skills, Education, Certificates, Projects, Languages, Awards, References).

## Architecture Overview

### Core Components

1. **ResumeSectionManagement.tsx** - Main hub for selecting which resume section to manage
2. **ResumeSectionItemsView.tsx** - Generic component for displaying and managing items in any section
3. **[Section]Management.tsx** - Specific implementations for each section (e.g., SkillsManagement.tsx)
4. **[Section]Form.tsx** - Forms for adding/editing items in each section

## How It Works

### 1. Section Types Configuration

All resume sections are defined in `ResumeSectionManagement.tsx`:

```typescript
export const RESUME_SECTION_TYPES: ResumeSectionType[] = [
  {
    id: "skills",
    name: "skills",
    displayName: "Skills",
    description: "Technical and professional skills",
    icon: "💡",
    endpoint: "/skills",
    color: "#F59E0B",
  },
  // ... other sections
];
```

### 2. Generic Item View

`ResumeSectionItemsView` is a reusable component that handles:
- Fetching items from the API
- Displaying items in a grid
- Delete operations
- Navigation to add/edit forms

It accepts these props:
- `sectionType`: The section identifier (e.g., "skills")
- `fetchItems`: Function to fetch items from API
- `deleteItem`: Function to delete an item
- `getItemDisplayName`: Function to extract display name from item
- `getItemSubtitle`: Optional function for subtitle
- `renderItemDetails`: Optional function to render custom details

### 3. Section-Specific Implementation

Each section creates a thin wrapper around `ResumeSectionItemsView`:

```typescript
// SkillsManagement.tsx
const SkillsManagement: React.FC = () => {
  return (
    <ResumeSectionItemsView
      sectionType="skills"
      fetchItems={fetchSkills}
      deleteItem={deleteSkill}
      getItemDisplayName={(item) => item.name}
      getItemSubtitle={(item) => `${item.category} • ${item.level}`}
      renderItemDetails={(item) => <SkillRating rating={item.rating} />}
    />
  );
};
```

## Adding a New Section

To add a new resume section (e.g., Certificates):

### 1. Add to Section Types

Update `RESUME_SECTION_TYPES` in `ResumeSectionManagement.tsx`:

```typescript
{
  id: "certificates",
  name: "certificates",
  displayName: "Certificates",
  description: "Professional certifications and licenses",
  icon: "📜",
  endpoint: "/certificates",
  color: "#D97706",
}
```

### 2. Create API Service

Create `src/services/certificateApi.ts`:

```typescript
export interface CertificateDto {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  // ... other fields
}

export const fetchCertificates = async (resumeId: string): Promise<CertificateDto[]> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  const response = await fetch(`${CORE_API_BASE}/resumes/${resumeId}/certificates`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });
  if (!response.ok) throw new Error('Failed to fetch certificates');
  return response.json();
};

// ... createCertificate, updateCertificate, deleteCertificate
```

### 3. Create Management Component

Create `CertificatesManagement.tsx`:

```typescript
import React from "react";
import ResumeSectionItemsView from "./ResumeSectionItemsView";
import { fetchCertificates, deleteCertificate } from "../../../services/certificateApi";

const CertificatesManagement: React.FC = () => {
  return (
    <ResumeSectionItemsView
      sectionType="certificates"
      fetchItems={fetchCertificates}
      deleteItem={deleteCertificate}
      getItemDisplayName={(item) => item.name}
      getItemSubtitle={(item) => `${item.issuer} • ${item.issueDate}`}
    />
  );
};

export default CertificatesManagement;
```

### 4. Create Form Component

Create `CertificateForm.tsx` following the pattern in `SkillForm.tsx`.

### 5. Add Routes

Update your router configuration:

```typescript
{
  path: "/admin/entities/resumes/:resumeId/certificates",
  element: <CertificatesManagement />
},
{
  path: "/admin/entities/resumes/:resumeId/certificates/new",
  element: <CertificateForm />
},
{
  path: "/admin/entities/resumes/:resumeId/certificates/:id/edit",
  element: <CertificateForm />
}
```

## Routes Structure

```
/admin/resume-sections/:resumeId          → ResumeSectionManagement (section hub)
/admin/entities/resumes/:resumeId/skills           → SkillsManagement (list)
/admin/entities/resumes/:resumeId/skills/new       → SkillForm (create)
/admin/entities/resumes/:resumeId/skills/:id/edit  → SkillForm (edit)
/admin/entities/resumes/:resumeId/educations       → EducationsManagement (list)
/admin/entities/resumes/:resumeId/educations/new   → EducationForm (create)
... and so on for each section
```

## Benefits

1. **DRY Principle**: Common functionality is centralized in `ResumeSectionItemsView`
2. **Consistency**: All sections have the same UI/UX
3. **Maintainability**: Changes to common behavior only need to be made once
4. **Scalability**: Adding new sections is quick and follows a clear pattern
5. **Type Safety**: TypeScript ensures correct prop usage

## Styling

All components share CSS files:
- `resume-section-management.css` - For the section hub
- `resume-section-items.css` - For item lists
- `resume-section-form.css` - For add/edit forms

## Backend Requirements

Each section must have a controller at:
```
/api/resumes/{resumeId}/[controller]
```

With standard CRUD operations:
- GET /api/resumes/{resumeId}/skills - List all
- GET /api/resumes/{resumeId}/skills/{id} - Get one
- POST /api/resumes/{resumeId}/skills - Create
- PUT /api/resumes/{resumeId}/skills/{id} - Update
- DELETE /api/resumes/{resumeId}/skills/{id} - Delete
