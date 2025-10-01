# Apply Resume System Migration

## ⚠️ Important: Manual Steps Required

The Resume system uses **GUID primary keys**, but the old `WorkExperiences` table was created with **integer IDs**. 

You need to **manually clean up the migration history** before applying the new migration.

## Steps to Apply Migration

### 1. Clean Up Migration History (REQUIRED)

The old `AddWorkExperience` migration needs to be removed from the database history.

**Option A: Using psql command line:**

```bash
psql -h localhost -U postgres -d asafarim_core -c "DELETE FROM public.\"__EFMigrationsHistory\" WHERE \"MigrationId\" = '20250930195341_AddWorkExperience';"
```

**Option B: Using SQL file:**

Run the SQL script: `apis/Core.Api/Migrations/Resume/FixMigrationHistory.sql`

```sql
DELETE FROM public."__EFMigrationsHistory" 
WHERE "MigrationId" = '20250930195341_AddWorkExperience';
```

### 2. Verify Tables Are Dropped

Make sure the old tables don't exist:

```sql
DROP TABLE IF EXISTS public."WorkAchievements" CASCADE;
DROP TABLE IF EXISTS public."WorkExperiences" CASCADE;
```

### 3. Apply the Migration

```bash
cd D:\repos\asafarim-dot-be\apis\Core.Api
dotnet ef database update --context CoreDbContext
```

### 3. Verify

Check that all tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%Resume%' OR table_name LIKE '%Work%' OR table_name LIKE '%Skill%';
```

## What Gets Created

The migration creates these tables:

### Core Resume Tables
- **Resumes** - Main resume entity
- **ContactInfos** - Contact information (one-to-one with Resume)

### Resume Components
- **Skills** - Technical and soft skills
- **Educations** - Education history
- **Certificates** - Professional certifications
- **WorkExperiences** - Work experience (recreated with GUID IDs)
- **WorkAchievements** - Achievements per work experience (recreated with GUID IDs)
- **Projects** - Portfolio projects
- **Languages** - Language proficiency
- **Awards** - Awards and recognitions
- **References** - Professional references
- **SocialLinks** - Social media links

### Supporting Tables
- **Technologies** - Shared technology/skill catalog
- **ProjectTechnologies** - Many-to-many: Project ↔ Technology
- **WorkExperienceTechnologies** - Many-to-many: WorkExperience ↔ Technology

## Key Changes from Old WorkExperiences

| Aspect | Old | New |
|--------|-----|-----|
| Primary Key | `int` (auto-increment) | `Guid` (generated in code) |
| Foreign Keys | None | `ResumeId` (links to Resume) |
| Technologies | None | Many-to-many via `WorkExperienceTechnologies` |
| Achievements | Separate table with `int` IDs | Separate table with `Guid` IDs |

## Troubleshooting

### Error: "identity column type must be smallint, integer, or bigint"

This means the old tables still exist. Go back to Step 1 and drop them manually.

### Error: "relation already exists"

Some tables were partially created. Drop all Resume-related tables and try again:

```sql
DROP TABLE IF EXISTS public."WorkAchievements" CASCADE;
DROP TABLE IF EXISTS public."WorkExperiences" CASCADE;
DROP TABLE IF EXISTS public."Resumes" CASCADE;
DROP TABLE IF EXISTS public."ContactInfos" CASCADE;
DROP TABLE IF EXISTS public."Skills" CASCADE;
DROP TABLE IF EXISTS public."Educations" CASCADE;
DROP TABLE IF EXISTS public."Certificates" CASCADE;
DROP TABLE IF EXISTS public."Projects" CASCADE;
DROP TABLE IF EXISTS public."Technologies" CASCADE;
DROP TABLE IF EXISTS public."ProjectTechnologies" CASCADE;
DROP TABLE IF EXISTS public."WorkExperienceTechnologies" CASCADE;
DROP TABLE IF EXISTS public."SocialLinks" CASCADE;
DROP TABLE IF EXISTS public."Languages" CASCADE;
DROP TABLE IF EXISTS public."Awards" CASCADE;
DROP TABLE IF EXISTS public."References" CASCADE;
```

Then rerun the migration.

## After Migration Success

1. **Test the API**:
   ```bash
   cd D:\repos\asafarim-dot-be\apis\Core.Api
   dotnet run
   ```

2. **Test the Frontend**:
   ```bash
   cd D:\repos\asafarim-dot-be\apps\web
   pnpm dev
   ```

3. **Navigate to**: `http://web.asafarim.local:5175/admin/resume`

4. **Create a test resume** and verify CRUD operations work

---

**Migration File**: `Migrations/Resume/20251001*_AddCompleteResumeSystem.cs`
**Status**: Ready to apply after manual table drop
