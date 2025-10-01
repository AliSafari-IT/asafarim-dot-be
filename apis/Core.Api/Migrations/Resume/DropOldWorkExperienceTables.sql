-- Drop old WorkExperiences and WorkAchievements tables (they have int IDs)
-- Run this SQL script manually before applying the new migration

DROP TABLE IF EXISTS public."WorkAchievements" CASCADE;
DROP TABLE IF EXISTS public."WorkExperiences" CASCADE;

-- Note: After running this script, run: dotnet ef database update
