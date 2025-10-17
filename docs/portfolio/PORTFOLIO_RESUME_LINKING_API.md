# Portfolio & Resume Linking API Documentation

## Overview

This API provides comprehensive portfolio and resume integration with analytics, activity tracking, and intelligent linking capabilities.

**Base URL:** `/api/portfolio`  
**Authentication:** JWT Bearer Token (required for all endpoints except public portfolio views)

---

## 📋 Table of Contents

1. [Resume Linking - Projects](#resume-linking---projects)
2. [Resume Linking - Publications](#resume-linking---publications)
3. [Bulk Operations](#bulk-operations)
4. [Analytics & Insights](#analytics--insights)
5. [Activity Tracking](#activity-tracking)
6. [Resume Metadata](#resume-metadata)
7. [Data Models](#data-models)

---

## Resume Linking - Projects

### Link Resumes to Project

**POST** `/api/portfolio/projects/{id}/link-resumes`

Link one or more resumes to a project, optionally associating specific work experiences.

**Request Body:**
```json
{
  "resumeIds": [
    "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "4fa85f64-5717-4562-b3fc-2c963f66afa7"
  ],
  "workExperienceLinks": {
    "3fa85f64-5717-4562-b3fc-2c963f66afa6": "5fa85f64-5717-4562-b3fc-2c963f66afa8"
  },
  "notes": "Linked to professional resume"
}
```

**Response:** `200 OK`
```json
[
  {
    "id": "7fa85f64-5717-4562-b3fc-2c963f66afa9",
    "resumeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "resumeTitle": "Senior Developer Resume",
    "workExperienceId": "5fa85f64-5717-4562-b3fc-2c963f66afa8",
    "workExperienceTitle": "Senior Developer at Tech Corp",
    "createdAt": "2024-01-15T10:30:00Z",
    "notes": "Linked to professional resume"
  }
]
```

---

### Unlink Resume from Project

**DELETE** `/api/portfolio/projects/{id}/resumes/{resumeId}`

Remove the link between a project and a resume.

**Response:** `204 No Content`

---

### Get Project Resumes

**GET** `/api/portfolio/projects/{id}/resumes`

Retrieve all resumes linked to a specific project.

**Response:** `200 OK`
```json
[
  {
    "id": "7fa85f64-5717-4562-b3fc-2c963f66afa9",
    "resumeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "resumeTitle": "Senior Developer Resume",
    "workExperienceId": "5fa85f64-5717-4562-b3fc-2c963f66afa8",
    "workExperienceTitle": "Senior Developer at Tech Corp",
    "createdAt": "2024-01-15T10:30:00Z",
    "notes": "Linked to professional resume"
  }
]
```

---

## Resume Linking - Publications

### Link Resumes to Publication

**POST** `/api/portfolio/publications/{id}/link-resumes`

Link one or more resumes to a publication.

**Request Body:**
```json
{
  "resumeIds": [
    "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  ],
  "notes": "Academic publication"
}
```

**Response:** `200 OK`
```json
[
  {
    "id": "8fa85f64-5717-4562-b3fc-2c963f66afaa",
    "resumeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "resumeTitle": "Academic Resume",
    "workExperienceId": null,
    "workExperienceTitle": null,
    "createdAt": "2024-01-15T10:35:00Z",
    "notes": "Academic publication"
  }
]
```

---

### Unlink Resume from Publication

**DELETE** `/api/portfolio/publications/{id}/resumes/{resumeId}`

Remove the link between a publication and a resume.

**Response:** `204 No Content`

---

### Get Publication Resumes

**GET** `/api/portfolio/publications/{id}/resumes`

Retrieve all resumes linked to a specific publication.

**Response:** `200 OK` (same structure as project resumes)

---

## Bulk Operations

### Bulk Link Resumes to Projects

**POST** `/api/portfolio/projects/bulk-link`

Link multiple resumes to multiple projects in one operation.

**Request Body:**
```json
{
  "projectIds": [
    "1fa85f64-5717-4562-b3fc-2c963f66afa1",
    "2fa85f64-5717-4562-b3fc-2c963f66afa2"
  ],
  "resumeIds": [
    "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "4fa85f64-5717-4562-b3fc-2c963f66afa7"
  ],
  "notes": "Bulk linking operation"
}
```

**Response:** `200 OK`
```json
{
  "linkedCount": 4,
  "message": "Successfully linked 4 connections"
}
```

---

### Bulk Unlink Resumes from Projects

**POST** `/api/portfolio/projects/bulk-unlink`

Remove multiple resume-project links in one operation.

**Request Body:** (same as bulk-link)

**Response:** `200 OK`
```json
{
  "unlinkedCount": 4,
  "message": "Successfully unlinked 4 connections"
}
```

---

## Analytics & Insights

### Get Portfolio Insights

**GET** `/api/portfolio/insights`

Retrieve comprehensive analytics about your portfolio.

**Response:** `200 OK`
```json
{
  "totalProjects": 15,
  "linkedProjects": 12,
  "unlinkedProjects": 3,
  "linkingRate": 80.00,
  "totalPublications": 8,
  "linkedPublications": 6,
  "totalResumes": 3,
  "activeResumes": 2,
  "mostUsedTechnologies": [
    {
      "technologyId": "tech-001",
      "name": "React",
      "category": "Frontend",
      "usageCount": 10
    },
    {
      "technologyId": "tech-002",
      "name": "Node.js",
      "category": "Backend",
      "usageCount": 8
    }
  ],
  "mostLinkedResumes": [
    {
      "resumeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "title": "Senior Developer Resume",
      "linkCount": 12,
      "lastLinked": "2024-01-15T10:30:00Z"
    }
  ],
  "projectPublicationOverlaps": [],
  "lastActivityDate": "2024-01-15T10:30:00Z",
  "portfolioHealth": "Excellent"
}
```

**Portfolio Health Values:**
- `Excellent` - Linking rate ≥ 75%
- `Good` - Linking rate ≥ 50%
- `NeedsAttention` - Linking rate < 50%

---

## Activity Tracking

### Get Activity Logs

**GET** `/api/portfolio/activity?limit=50`

Retrieve user activity timeline.

**Query Parameters:**
- `limit` (optional, default: 50) - Maximum number of logs to return

**Response:** `200 OK`
```json
[
  {
    "id": "9fa85f64-5717-4562-b3fc-2c963f66afab",
    "entityType": "Project",
    "entityId": "1fa85f64-5717-4562-b3fc-2c963f66afa1",
    "entityName": "E-Commerce Platform",
    "action": "Link",
    "details": "Linked 2 resume(s)",
    "timestamp": "2024-01-15T10:30:00Z"
  },
  {
    "id": "afa85f64-5717-4562-b3fc-2c963f66afac",
    "entityType": "Project",
    "entityId": "2fa85f64-5717-4562-b3fc-2c963f66afa2",
    "entityName": "Mobile App",
    "action": "Create",
    "details": "Created new project",
    "timestamp": "2024-01-14T15:20:00Z"
  }
]
```

**Entity Types:**
- `Project`
- `Publication`
- `Resume`
- `WorkExperience`
- `Portfolio`

**Action Types:**
- `Create`
- `Update`
- `Delete`
- `Link`
- `Unlink`
- `Publish`
- `Unpublish`
- `View`

---

### Create Activity Log

**POST** `/api/portfolio/activity`

Manually log an activity event.

**Request Body:**
```json
{
  "entityType": "Project",
  "entityId": "1fa85f64-5717-4562-b3fc-2c963f66afa1",
  "entityName": "E-Commerce Platform",
  "action": "View",
  "details": "Viewed project details"
}
```

**Response:** `201 Created`
```json
{
  "id": "bfa85f64-5717-4562-b3fc-2c963f66afad",
  "entityType": "Project",
  "entityId": "1fa85f64-5717-4562-b3fc-2c963f66afa1",
  "entityName": "E-Commerce Platform",
  "action": "View",
  "details": "Viewed project details",
  "timestamp": "2024-01-15T10:40:00Z"
}
```

---

## Resume Metadata

### Get User Resumes Metadata

**GET** `/api/portfolio/resumes/metadata`

Retrieve lightweight metadata for all user resumes.

**Response:** `200 OK`
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "title": "Senior Developer Resume",
    "resumeType": null,
    "createdAt": "2023-06-01T10:00:00Z",
    "updatedAt": "2024-01-10T14:30:00Z",
    "isPublic": true,
    "projectCount": 12,
    "workExperiences": [
      {
        "id": "5fa85f64-5717-4562-b3fc-2c963f66afa8",
        "company": "Tech Corp",
        "position": "Senior Developer",
        "startDate": "2020-01-01T00:00:00Z",
        "endDate": null,
        "isCurrent": true
      }
    ]
  }
]
```

---

### Get Resume Work Experiences

**GET** `/api/portfolio/resumes/{id}/work-experiences`

Retrieve work experiences for a specific resume.

**Response:** `200 OK`
```json
[
  {
    "id": "5fa85f64-5717-4562-b3fc-2c963f66afa8",
    "company": "Tech Corp",
    "position": "Senior Developer",
    "startDate": "2020-01-01T00:00:00Z",
    "endDate": null,
    "isCurrent": true
  },
  {
    "id": "6fa85f64-5717-4562-b3fc-2c963f66afa9",
    "company": "Startup Inc",
    "position": "Full Stack Developer",
    "startDate": "2018-06-01T00:00:00Z",
    "endDate": "2019-12-31T00:00:00Z",
    "isCurrent": false
  }
]
```

---

## Data Models

### LinkResumesDto
```typescript
{
  resumeIds: Guid[],
  workExperienceLinks?: { [resumeId: Guid]: workExperienceId: Guid },
  notes?: string
}
```

### BulkLinkResumesDto
```typescript
{
  projectIds: Guid[],
  resumeIds: Guid[],
  notes?: string
}
```

### ResumeLinkDto
```typescript
{
  id: Guid,
  resumeId: Guid,
  resumeTitle: string,
  workExperienceId?: Guid,
  workExperienceTitle?: string,
  createdAt: DateTime,
  notes?: string
}
```

### PortfolioInsightsDto
```typescript
{
  totalProjects: number,
  linkedProjects: number,
  unlinkedProjects: number,
  linkingRate: decimal,
  totalPublications: number,
  linkedPublications: number,
  totalResumes: number,
  activeResumes: number,
  mostUsedTechnologies: TechnologyUsageDto[],
  mostLinkedResumes: ResumeUsageDto[],
  projectPublicationOverlaps: ProjectPublicationOverlapDto[],
  lastActivityDate?: DateTime,
  portfolioHealth: string
}
```

### ActivityLogDto
```typescript
{
  id: Guid,
  entityType: string,
  entityId: string,
  entityName: string,
  action: string,
  details?: string,
  timestamp: DateTime
}
```

### ResumeMetadataDto
```typescript
{
  id: Guid,
  title: string,
  resumeType?: string,
  createdAt: DateTime,
  updatedAt: DateTime,
  isPublic: boolean,
  projectCount: number,
  workExperiences: WorkExperienceMetadataDto[]
}
```

### WorkExperienceMetadataDto
```typescript
{
  id: Guid,
  company: string,
  position: string,
  startDate?: DateTime,
  endDate?: DateTime,
  isCurrent: boolean
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Invalid request data"
}
```

### 401 Unauthorized
```json
{
  "message": "Authentication required"
}
```

### 404 Not Found
```json
{
  "message": "Project not found or access denied"
}
```

### 500 Internal Server Error
```json
{
  "message": "An error occurred while processing your request"
}
```

---

## Usage Examples

### Example 1: Link Project to Multiple Resumes

```bash
curl -X POST https://core.asafarim.be/api/portfolio/projects/{projectId}/link-resumes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resumeIds": ["resume-id-1", "resume-id-2"],
    "workExperienceLinks": {
      "resume-id-1": "work-exp-id-1"
    },
    "notes": "Professional projects"
  }'
```

### Example 2: Get Portfolio Analytics

```bash
curl -X GET https://core.asafarim.be/api/portfolio/insights \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Example 3: Bulk Link Operations

```bash
curl -X POST https://core.asafarim.be/api/portfolio/projects/bulk-link \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectIds": ["project-1", "project-2"],
    "resumeIds": ["resume-1", "resume-2"]
  }'
```

---

## Notes

- All timestamps are in UTC (ISO 8601 format)
- GUIDs must be valid UUID v4 format
- Publication IDs are integers, not GUIDs
- Activity logs are automatically created for link/unlink operations
- Duplicate links are automatically prevented
- Cascading deletes are configured for data integrity

---

## Support

For issues or questions, please contact the development team or refer to the main API documentation.
