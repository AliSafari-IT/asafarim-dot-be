# Portfolio API Response Mapping

## API Endpoint: `GET /api/portfolio/{slug}`

### Example Response
```json
{
  "username": "ali-safari",
  "displayName": "Ali Safari",
  "headline": "Full-Stack Developer • .NET & React",
  "bio": "Passionate developer with expertise in building scalable web applications",
  "profileImageUrl": "https://example.com/avatar.jpg",
  "preferredLanguage": "en",
  "contact": {
    "fullName": "Ali Safari",
    "email": "ali@asafarim.be",
    "phone": "+1234567890",
    "location": "Amsterdam, Netherlands"
  },
  "projects": [
    {
      "id": "proj-123",
      "title": "IGS Pharma Website",
      "summary": "Custom WordPress setup for pharmaceutical company",
      "description": "Full project description with detailed information...",
      "slug": "igs-pharma",
      "isFeatured": true,
      "displayOrder": 1,
      "githubUrl": "https://github.com/username/project",
      "demoUrl": "https://igspharma.com",
      "startDate": "2023-01-15T00:00:00Z",
      "endDate": "2023-06-30T00:00:00Z",
      "technologies": [
        {
          "id": "tech-1",
          "name": "React",
          "category": "Frontend"
        },
        {
          "id": "tech-2",
          "name": "WordPress",
          "category": "CMS"
        }
      ],
      "images": [
        {
          "id": "img-1",
          "imageUrl": "https://example.com/project1.jpg",
          "caption": "Homepage design",
          "displayOrder": 0
        }
      ],
      "publications": [],
      "workExperiences": []
    }
  ],
  "publications": [
    {
      "id": 1,
      "title": "Hydrological Modeling in Urban Areas",
      "authorId": "user-123",
      "journalName": "Journal of Hydrology",
      "link": "https://doi.org/10.1234/example",
      "createdAt": "2023-05-20T00:00:00Z"
    }
  ],
  "workExperiences": [
    {
      "id": "exp-1",
      "company": "XiTechniX",
      "position": "Full-Stack Developer",
      "startDate": "2022-01-01T00:00:00Z",
      "endDate": null,
      "description": "Leading development of enterprise applications",
      "location": "Amsterdam, NL"
    }
  ],
  "technologies": [
    {
      "id": "tech-1",
      "name": "React",
      "category": "Frontend"
    },
    {
      "id": "tech-2",
      "name": ".NET",
      "category": "Backend"
    }
  ],
  "settings": {
    "publicSlug": "ali-safari",
    "isPublic": true,
    "showContactInfo": true,
    "showPublications": true,
    "showWorkExperience": true,
    "sectionOrder": ["projects", "skills", "experience", "publications"],
    "customCss": null,
    "metaDescription": "Full-stack developer specializing in .NET and React"
  }
}
```

## Component Mapping

### PortfolioHeader Component
Maps the following fields:
- `displayName` → Header title
- `headline` → Subtitle
- `bio` → Description paragraph
- `profileImageUrl` → Avatar image
- `contact.*` → Contact information (if `settings.showContactInfo` is true)

### ProjectCard Component
Maps each item in `projects[]`:
- `title` → Card title
- `summary` → Card description
- `isFeatured` → Featured badge
- `technologies[]` → Technology tags
- `images[0]` → Card thumbnail (first image with displayOrder 0)
- `githubUrl` → GitHub link
- `demoUrl` → Live demo link

### ExperienceCard Component
Maps each item in `workExperiences[]`:
- `position` → Job title
- `company` → Company name
- `startDate` / `endDate` → Duration
- `location` → Location badge
- `description` → Job description

### PublicationCard Component
Maps each item in `publications[]`:
- `title` → Publication title
- `journalName` → Journal name
- `createdAt` → Year (extracted)
- `link` → External link

### SkillsSection Component
Maps `technologies[]` grouped by `category`:
- Groups technologies by their `category` field
- Displays as categorized tag clouds

## State Flow

```
User visits /u/ali-safari
    ↓
PortfolioPublicView component mounts
    ↓
useEffect triggers fetchPublicPortfolio('ali-safari')
    ↓
Zustand store calls portfolioService.getPublicPortfolio()
    ↓
API request to GET /api/portfolio/ali-safari
    ↓
Response stored in Zustand store
    ↓
Components re-render with portfolio data
    ↓
SEO meta tags updated
```

## Error Handling

### Portfolio Not Found (404)
```tsx
if (error) {
  return <div>Portfolio Not Found</div>
}
```

### Portfolio Private
```tsx
if (!portfolio.settings.isPublic) {
  return <div>Portfolio Private</div>
}
```

### Loading State
```tsx
if (loading) {
  return <PortfolioSkeleton />
}
```

## Language Adaptation

The `preferredLanguage` field can be used for i18n:

```tsx
const { portfolio } = usePortfolioStore();
const lang = portfolio?.preferredLanguage || 'en';

// Use with your i18n library
const t = useTranslation(lang);
```

## Section Ordering

The `settings.sectionOrder` array controls the display order:

```typescript
// Example: ["projects", "skills", "experience", "publications"]
settings.sectionOrder.map(sectionName => {
  switch (sectionName) {
    case 'projects': return <ProjectsSection />;
    case 'skills': return <SkillsSection />;
    case 'experience': return <ExperienceSection />;
    case 'publications': return <PublicationsSection />;
  }
});
```

## Custom CSS

If `settings.customCss` is provided, inject it:

```tsx
useEffect(() => {
  if (portfolio?.settings.customCss) {
    const style = document.createElement('style');
    style.textContent = portfolio.settings.customCss;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }
}, [portfolio]);
```
